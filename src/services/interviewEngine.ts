/**
 * InterviewOS — Core interview engine with stateful session management,
 * Breeth AI memory integration, and Groq LLM-driven adaptive questioning.
 */
import fs from 'fs';
import path from 'path';
import { groqClient } from './groq.js';
import { breethClient } from './breeth.js';
import { logAiInteraction } from '../utils/logger.js';
import type {
  Candidate,
  InterviewSession,
  ConversationTurn,
  InterviewApiResponse,
  Feedback,
  Curriculum,
  CurriculumModule,
  Mission,
} from '../types/interview.js';

// ─── In-Memory Session Store ─────────────────────────────────────────────────

const sessions = new Map<string, InterviewSession>();

// ─── Curriculum Loader ───────────────────────────────────────────────────────

let curriculumCache: Curriculum | null = null;

function loadCurriculum(): Curriculum {
  if (curriculumCache) return curriculumCache;
  const raw = fs.readFileSync(path.resolve(process.cwd(), 'data/curriculum.json'), 'utf-8');
  curriculumCache = JSON.parse(raw) as Curriculum;
  return curriculumCache;
}

// ─── Candidate Analysis Helpers ──────────────────────────────────────────────

function getModuleForDay(day: number, modules: CurriculumModule[]): string | null {
  for (const mod of modules) {
    if (day >= mod.days[0] && day <= mod.days[1]) {
      return mod.title;
    }
  }
  return null;
}

function analyzeCandidateTelemetry(candidate: Candidate, curriculum: Curriculum) {
  const skippedTopics: string[] = [];
  const weakTopics: string[] = [];
  const strongTopics: string[] = [];

  for (const mission of candidate.missions) {
    const moduleName = getModuleForDay(mission.day, curriculum.modules);
    if (!moduleName) continue;

    if (mission.skipped) {
      if (!skippedTopics.includes(moduleName)) skippedTopics.push(moduleName);
    } else if (mission.passed && mission.attempts && mission.attempts >= 4) {
      if (!weakTopics.includes(moduleName)) weakTopics.push(moduleName);
    } else if (mission.passed && mission.attempts === 1) {
      if (!strongTopics.includes(moduleName)) strongTopics.push(moduleName);
    }
  }

  return { skippedTopics, weakTopics, strongTopics };
}

function buildCandidateProfile(candidate: Candidate): string {
  const m = candidate.member;
  const s = candidate.signals;
  const curriculum = loadCurriculum();
  const { skippedTopics, weakTopics, strongTopics } = analyzeCandidateTelemetry(candidate, curriculum);

  return [
    `Candidate: ${m.name}`,
    `Role: ${m.jobRole} | Experience: ${m.yearsExperience} years | Education: ${m.education}`,
    `Cohort Progress: ${s.missionsCompleted}/31 missions completed, ${s.missionsFirstTry} first-try passes, ${s.commitDays}/31 commit days`,
    strongTopics.length > 0 ? `Strong areas: ${strongTopics.join(', ')}` : '',
    weakTopics.length > 0 ? `Weak areas (multiple attempts): ${weakTopics.join(', ')}` : '',
    skippedTopics.length > 0 ? `Skipped topics: ${skippedTopics.join(', ')}` : '',
  ].filter(Boolean).join('\n');
}

function selectNextTopic(session: InterviewSession): string {
  const curriculum = loadCurriculum();
  const { skippedTopics, weakTopics } = analyzeCandidateTelemetry(session.candidate, curriculum);

  // Prioritize: skipped topics first, then weak topics, then uncovered modules
  const allModules = curriculum.modules.map(m => m.title);
  const uncoveredSkipped = skippedTopics.filter(t => !session.topicsCovered.has(t));
  const uncoveredWeak = weakTopics.filter(t => !session.topicsCovered.has(t));
  const uncoveredAny = allModules.filter(t => !session.topicsCovered.has(t));

  if (uncoveredSkipped.length > 0) return uncoveredSkipped[0];
  if (uncoveredWeak.length > 0) return uncoveredWeak[0];
  if (uncoveredAny.length > 0) return uncoveredAny[0];
  // If all covered, cycle back to weak areas
  return weakTopics[0] || allModules[session.turnCount % allModules.length];
}

function getDifficultyLabel(difficulty: 'easy' | 'medium' | 'hard'): string {
  return { easy: 'beginner-friendly', medium: 'intermediate', hard: 'senior-level' }[difficulty];
}

function adjustDifficulty(session: InterviewSession, answerQuality: string): void {
  const lower = answerQuality.toLowerCase();
  if (lower.includes('excellent') || lower.includes('strong') || lower.includes('correct')) {
    if (session.difficulty === 'easy') session.difficulty = 'medium';
    else if (session.difficulty === 'medium') session.difficulty = 'hard';
  } else if (lower.includes('weak') || lower.includes('incorrect') || lower.includes('needs improvement')) {
    if (session.difficulty === 'hard') session.difficulty = 'medium';
    else if (session.difficulty === 'medium') session.difficulty = 'easy';
  }
}

// ─── Core Engine Methods ─────────────────────────────────────────────────────

/**
 * Initialize a new interview session with candidate context.
 */
export async function startInterview(
  sessionId: string,
  candidate: Candidate
): Promise<InterviewApiResponse> {
  const curriculum = loadCurriculum();
  const profile = buildCandidateProfile(candidate);
  const { skippedTopics, weakTopics } = analyzeCandidateTelemetry(candidate, curriculum);

  // Determine initial topic priority
  const initialTopic = skippedTopics[0] || weakTopics[0] || curriculum.modules[2].title;

  const session: InterviewSession = {
    sessionId,
    candidate,
    turns: [],
    turnCount: 0,
    topicsCovered: new Set<string>(),
    currentTopic: initialTopic,
    weakAreas: [...skippedTopics, ...weakTopics],
    strongAreas: [],
    difficulty: 'medium',
    createdAt: new Date().toISOString(),
  };

  sessions.set(sessionId, session);

  // Ingest candidate profile into Breeth memory
  try {
    await breethClient.createEpisode({
      title: `Interview Session Init: ${candidate.member.name}`,
      content: profile,
      tags: ['interview-init', sessionId, candidate.member.id],
      metadata: { sessionId, candidateId: candidate.member.id },
    });
  } catch (err) {
    console.warn('[InterviewEngine] Breeth episode creation failed (non-fatal):', (err as Error).message);
  }

  // Generate welcome + first question via Groq
  const systemPrompt = `You are an expert AI technical interviewer for the ABTalks AI Cohort program. You are conducting a personalized technical assessment interview.

Your interview rules:
- Be professional, encouraging, and precise.
- Ask one clear technical question at a time.
- Ground your questions in the 31-day AI curriculum the candidate completed.
- Start with topics where the candidate showed weakness or skipped content.
- Adjust difficulty based on answers.

Candidate Profile:
${profile}

Curriculum modules: ${curriculum.modules.map(m => m.title).join(', ')}`;

  const userPrompt = `Start the interview with ${candidate.member.name}. Introduce yourself briefly, acknowledge their background as a ${candidate.member.jobRole}, and ask your first ${getDifficultyLabel(session.difficulty)} technical question about "${initialTopic}".`;

  let reply: string;
  try {
    const response = await groqClient.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });
    reply = response.choices[0]?.message?.content || 'Welcome! Let us begin the interview.';

    logAiInteraction({
      taskName: `Interview Start: ${candidate.member.name}`,
      userPrompt: `System: ${systemPrompt}\nUser: ${userPrompt}`,
      reasoning: `Initialized session ${sessionId}. First topic: "${initialTopic}". Difficulty: ${session.difficulty}.`,
      output: { model: 'llama-3.3-70b-versatile', usage: response.usage, reply },
    });
  } catch (err) {
    reply = `Welcome, ${candidate.member.name}! I'm your AI interviewer for today's technical assessment. Based on your cohort journey, let's start with a question about ${initialTopic}. Can you explain what you understand about this topic and how you applied it during the program?`;
    console.warn('[InterviewEngine] Groq completion failed, using fallback greeting:', (err as Error).message);
  }

  // Record the turn
  session.turns.push({ role: 'interviewer', content: reply, topic: initialTopic, timestamp: new Date().toISOString() });
  session.turnCount = 1;
  session.topicsCovered.add(initialTopic);

  return { reply, done: false };
}

/**
 * Process a candidate's answer and generate the next question or finalize.
 */
export async function processConversationTurn(
  sessionId: string,
  message: string
): Promise<InterviewApiResponse> {
  const session = sessions.get(sessionId);
  if (!session) {
    return { reply: `Error: No active session found for sessionId "${sessionId}". Please start a new interview.`, done: true };
  }

  // Record candidate's answer
  session.turns.push({ role: 'candidate', content: message, topic: session.currentTopic, timestamp: new Date().toISOString() });
  session.turnCount++;

  // Log the candidate turn into Breeth memory
  try {
    await breethClient.extractIntent({
      title: `Turn ${session.turnCount} — Candidate Answer`,
      content: `Topic: ${session.currentTopic}\nCandidate Answer: ${message}`,
      tags: ['interview-turn', sessionId, session.candidate.member.id],
      metadata: { sessionId, turn: session.turnCount, topic: session.currentTopic },
    });
  } catch (err) {
    console.warn('[InterviewEngine] Breeth extractIntent failed (non-fatal):', (err as Error).message);
  }

  // Check if interview should end: >= 8 interviewer questions across >= 4 topics
  const interviewerTurns = session.turns.filter(t => t.role === 'interviewer').length;
  if (interviewerTurns >= 8 && session.topicsCovered.size >= 4) {
    return await generateFinalFeedback(session);
  }

  // Retrieve context from Breeth memory
  let breethContext = '';
  try {
    const searchResult = await breethClient.searchMemory({
      query: `${session.currentTopic} ${message}`,
      limit: 3,
    });
    if (searchResult?.edges?.length > 0) {
      breethContext = `\nRelevant context from memory:\n${searchResult.edges.map((e: any) => e.content || e.text || JSON.stringify(e)).join('\n')}`;
    }
  } catch (err) {
    console.warn('[InterviewEngine] Breeth search failed (non-fatal):', (err as Error).message);
  }

  // Build conversation history for Groq
  const conversationHistory = session.turns.map(t =>
    t.role === 'interviewer' ? `Interviewer: ${t.content}` : `Candidate: ${t.content}`
  ).join('\n\n');

  const profile = buildCandidateProfile(session.candidate);
  const nextTopic = selectNextTopic(session);

  const systemPrompt = `You are an expert AI technical interviewer for the ABTalks AI Cohort program.

Candidate Profile:
${profile}

Interview rules:
- You have asked ${interviewerTurns} questions so far across ${session.topicsCovered.size} topics.
- You must ask at least 8 questions covering at least 4 distinct curriculum topics before ending.
- Topics covered so far: ${[...session.topicsCovered].join(', ')}
- Current difficulty: ${getDifficultyLabel(session.difficulty)}
- Evaluate the candidate's last answer first, then ask the next question.
- If the answer was strong, increase difficulty. If weak, simplify or probe deeper.
${breethContext}`;

  const userPrompt = `Conversation so far:
${conversationHistory}

First, briefly evaluate the quality of the candidate's last answer (was it correct, partially correct, or incorrect?). Then ask your next ${getDifficultyLabel(session.difficulty)} technical question about "${nextTopic}".

Reply in this exact format:
**Evaluation:** [Your brief assessment of the previous answer]

**Next Question:** [Your next technical question]`;

  let reply: string;
  let answerEvaluation = 'moderate';

  try {
    const response = await groqClient.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });
    reply = response.choices[0]?.message?.content || '';

    // Extract evaluation sentiment for difficulty adjustment
    const evalMatch = reply.match(/\*\*Evaluation:\*\*\s*(.+?)(?:\n|$)/i);
    if (evalMatch) {
      answerEvaluation = evalMatch[1];
    }

    logAiInteraction({
      taskName: `Interview Turn ${session.turnCount}: ${session.candidate.member.name}`,
      userPrompt: `Candidate answered: "${message.substring(0, 200)}..."`,
      reasoning: `Turn ${session.turnCount}. Evaluated answer on "${session.currentTopic}". Next topic: "${nextTopic}". Topics covered: ${session.topicsCovered.size}. Interviewer questions: ${interviewerTurns}.`,
      output: { model: 'llama-3.3-70b-versatile', usage: response.usage, reply: reply.substring(0, 500) },
    });
  } catch (err) {
    reply = `Thank you for your answer. Let's move on to the next topic. Regarding ${nextTopic}: Can you explain the key concepts and how they were applied in your cohort work?`;
    console.warn('[InterviewEngine] Groq completion failed, using fallback:', (err as Error).message);
  }

  // Adjust difficulty based on evaluation
  adjustDifficulty(session, answerEvaluation);

  // Track areas
  const evalLower = answerEvaluation.toLowerCase();
  if (evalLower.includes('incorrect') || evalLower.includes('weak') || evalLower.includes('partial')) {
    if (!session.weakAreas.includes(session.currentTopic)) session.weakAreas.push(session.currentTopic);
  } else if (evalLower.includes('excellent') || evalLower.includes('correct') || evalLower.includes('strong')) {
    if (!session.strongAreas.includes(session.currentTopic)) session.strongAreas.push(session.currentTopic);
  }

  // Record interviewer turn
  session.turns.push({ role: 'interviewer', content: reply, topic: nextTopic, timestamp: new Date().toISOString() });
  session.turnCount++;
  session.currentTopic = nextTopic;
  session.topicsCovered.add(nextTopic);

  return { reply, done: false };
}

/**
 * Generate final structured feedback when interview threshold is met.
 */
async function generateFinalFeedback(session: InterviewSession): Promise<InterviewApiResponse> {
  const profile = buildCandidateProfile(session.candidate);
  const conversationHistory = session.turns.map(t =>
    t.role === 'interviewer' ? `Interviewer: ${t.content}` : `Candidate: ${t.content}`
  ).join('\n\n');

  // Retrieve all memory from Breeth for synthesis
  let memoryContext = '';
  try {
    const searchResult = await breethClient.searchMemory({
      query: `interview evaluation ${session.candidate.member.name}`,
      limit: 10,
    });
    if (searchResult?.edges?.length > 0) {
      memoryContext = `\nBreeth Memory Context:\n${searchResult.edges.map((e: any) => e.content || e.text || JSON.stringify(e)).join('\n')}`;
    }
  } catch (err) {
    console.warn('[InterviewEngine] Breeth search for feedback failed (non-fatal):', (err as Error).message);
  }

  const systemPrompt = `You are an expert AI technical interviewer. Generate a final evaluation of the candidate's interview performance.

Candidate Profile:
${profile}
${memoryContext}

Topics covered: ${[...session.topicsCovered].join(', ')}
Total turns: ${session.turnCount}
Weak areas identified: ${session.weakAreas.join(', ') || 'None'}
Strong areas identified: ${session.strongAreas.join(', ') || 'None'}`;

  const userPrompt = `Based on the full interview conversation below, generate a structured evaluation.

${conversationHistory}

You MUST respond with ONLY a valid JSON object in this exact format (no markdown, no code fences):
{
  "summary": "2-3 sentence overall evaluation of the candidate",
  "strengths": ["strength 1", "strength 2", "..."],
  "gaps": ["gap 1", "gap 2", "..."],
  "next": ["recommendation 1", "recommendation 2", "..."]
}`;

  let feedback: Feedback;

  try {
    const response = await groqClient.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 1024,
    });

    const raw = response.choices[0]?.message?.content || '';

    logAiInteraction({
      taskName: `Interview Feedback: ${session.candidate.member.name}`,
      userPrompt: `Generate final feedback for session ${session.sessionId}`,
      reasoning: `Synthesized ${session.turnCount} turns across ${session.topicsCovered.size} topics. Weak: [${session.weakAreas.join(', ')}]. Strong: [${session.strongAreas.join(', ')}].`,
      output: { model: 'llama-3.3-70b-versatile', usage: response.usage, rawFeedback: raw },
    });

    // Parse JSON — handle potential markdown fences from LLM
    const jsonStr = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    feedback = JSON.parse(jsonStr);
  } catch (err) {
    console.warn('[InterviewEngine] Feedback generation/parse failed, using fallback:', (err as Error).message);
    feedback = {
      summary: `${session.candidate.member.name} completed a ${session.turnCount}-turn technical interview covering ${session.topicsCovered.size} curriculum topics.`,
      strengths: session.strongAreas.length > 0 ? session.strongAreas : ['Completed the full interview'],
      gaps: session.weakAreas.length > 0 ? session.weakAreas : ['No critical gaps identified'],
      next: ['Review curriculum modules with lower scores', 'Practice hands-on exercises in identified gap areas'],
    };
  }

  // Clean up session
  sessions.delete(session.sessionId);

  return {
    reply: 'Interview completed.',
    done: true,
    feedback,
  };
}

/**
 * Get a session by ID (for debugging/inspection).
 */
export function getSession(sessionId: string): InterviewSession | undefined {
  return sessions.get(sessionId);
}

/**
 * Get all active session IDs (for debugging).
 */
export function getActiveSessionIds(): string[] {
  return [...sessions.keys()];
}
