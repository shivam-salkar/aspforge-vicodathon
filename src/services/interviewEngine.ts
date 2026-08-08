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

// ─── System Prompt Definition ────────────────────────────────────────────────

const SYSTEM_PROMPT = `
You are a Senior Principal AI Engineer conducting a realistic 1-on-1 technical interview.

RULES:
1. ALWAYS speak directly to the candidate in second person ("you", "your answer"). NEVER say "the candidate", "the candidate's answer", or "the user".
2. React naturally like a real human interviewer. If they answer well, give a brief 1-sentence validation. If they say "i dont know" or give a weak answer, acknowledge it empathetically in 1 sentence (e.g., "Fair enough if you haven't worked with that directly", "I see your answer didn't quite cover the scaling aspect").
3. Use persistent memory facts from Breeth AI to ground your responses in what the candidate previously stated or achieved.
4. NEVER output markdown labels like "**Evaluation:**" or "**Next Question:**".
5. Keep your total response under 60 words (3-4 sentences max).
6. Ask sharp, concrete technical questions focused on system architecture, data engineering, or production trade-offs. Max 2 sentences for the question.
`;

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

// ─── Sanitizer Helper ────────────────────────────────────────────────────────

function sanitizeReply(reply: string): string {
  if (!reply) return '';
  return reply
    .replace(/\*\*(?:Evaluation|Next Question|Question|Feedback):\*\*/gi, '')
    .replace(/(?:Evaluation|Next Question|Question|Feedback):/gi, '')
    .replace(/The candidate's answer/gi, 'Your answer')
    .replace(/The candidate's response/gi, 'Your response')
    .replace(/The candidate/gi, 'You')
    .replace(/\b(\w+)\s+\1\b/gi, '$1') // Strip duplicate consecutive words (e.g. "optimize optimize")
    .replace(/\bundefined\b/gi, '') // Strip residual 'undefined' tokens
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
    `Cohort Progress: ${s.missionsCompleted}/31 missions completed, ${s.missionsFirstTry} first-try passes`,
    strongTopics.length > 0 ? `Strong areas: ${strongTopics.join(', ')}` : '',
    weakTopics.length > 0 ? `Weak areas: ${weakTopics.join(', ')}` : '',
    skippedTopics.length > 0 ? `Skipped topics: ${skippedTopics.join(', ')}` : '',
  ].filter(Boolean).join('\n');
}

function selectNextTopic(session: InterviewSession): string {
  const curriculum = loadCurriculum();
  const { skippedTopics, weakTopics } = analyzeCandidateTelemetry(session.candidate, curriculum);

  const allModules = curriculum.modules.map(m => m.title);
  const uncoveredSkipped = skippedTopics.filter(t => !session.topicsCovered.has(t));
  const uncoveredWeak = weakTopics.filter(t => !session.topicsCovered.has(t));
  const uncoveredAny = allModules.filter(t => !session.topicsCovered.has(t));

  if (uncoveredSkipped.length > 0) return uncoveredSkipped[0];
  if (uncoveredWeak.length > 0) return uncoveredWeak[0];
  if (uncoveredAny.length > 0) return uncoveredAny[0];
  return weakTopics[0] || allModules[session.turnCount % allModules.length];
}

function getDifficultyLabel(difficulty: 'easy' | 'medium' | 'hard'): string {
  return { easy: 'beginner', medium: 'intermediate', hard: 'senior' }[difficulty];
}

function adjustDifficulty(session: InterviewSession, text: string): void {
  const lower = text.toLowerCase();
  if (lower.includes('correct') || lower.includes('solid') || lower.includes('good') || lower.includes('accurate') || lower.includes('great point')) {
    if (session.difficulty === 'easy') session.difficulty = 'medium';
    else if (session.difficulty === 'medium') session.difficulty = 'hard';
  } else if (lower.includes('weak') || lower.includes('incorrect') || lower.includes("don't know") || lower.includes('missed') || lower.includes('didn\'t quite')) {
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

  // Ingest candidate profile into Breeth memory (background logging)
  breethClient.createEpisode({
    title: `Interview Session Init: ${candidate.member.name}`,
    content: profile,
    tags: ['interview-init', sessionId, candidate.member.id],
    metadata: { sessionId, candidateId: candidate.member.id },
  }).catch((err) => {
    console.warn('[InterviewEngine] Breeth episode creation failed (non-fatal):', (err as Error).message);
  });

  const systemPrompt = `${SYSTEM_PROMPT}

Candidate Profile:
${profile}

Target Curriculum Focus: "${initialTopic}" (${getDifficultyLabel(session.difficulty)} level)`;

  const userPrompt = `Ask your first technical question directly to ${candidate.member.name} ("you") about "${initialTopic}". Focus on concrete system architecture or trade-offs. Speak in second-person. Under 60 words total. No fluff.`;

  let reply: string;
  try {
    const response = await groqClient.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 200,
    });
    reply = sanitizeReply(response.choices[0]?.message?.content || '');

    logAiInteraction({
      taskName: `Interview Start: ${candidate.member.name}`,
      userPrompt: `System: ${systemPrompt}\nUser: ${userPrompt}`,
      reasoning: `Initialized session ${sessionId}. Topic: "${initialTopic}". Difficulty: ${session.difficulty}.`,
      output: { model: 'llama-3.3-70b-versatile', usage: response.usage, reply },
    });
  } catch (err) {
    reply = `Welcome ${candidate.member.name}. Regarding ${initialTopic}: How do you approach scaling vector search indexing without incurring excessive memory overhead?`;
    console.warn('[InterviewEngine] Groq completion failed, using concise fallback:', (err as Error).message);
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
    return { reply: `No active session found for "${sessionId}". Please start a new interview.`, done: true };
  }

  // Record candidate's answer
  session.turns.push({ role: 'candidate', content: message, topic: session.currentTopic, timestamp: new Date().toISOString() });
  session.turnCount++;

  // Log turn to Breeth AI memory (non-blocking async)
  breethClient.extractIntent({
    title: `Turn ${session.turnCount} — Candidate Answer`,
    content: `Topic: ${session.currentTopic}\nCandidate Answer: ${message}`,
    tags: ['interview-turn', sessionId, session.candidate.member.id],
    metadata: { sessionId, turn: session.turnCount, topic: session.currentTopic },
  }).catch((err) => {
    console.warn('[InterviewEngine] Breeth extractIntent failed (non-fatal):', (err as Error).message);
  });

  // Check if interview threshold met (>= 8 interviewer turns across >= 4 topics)
  const interviewerTurns = session.turns.filter(t => t.role === 'interviewer').length;
  if (interviewerTurns >= 8 && session.topicsCovered.size >= 4) {
    return await generateFinalFeedback(session);
  }

  // Retrieve persistent context from Breeth memory
  let breethContext = '';
  try {
    const searchResult = await breethClient.searchMemory({
      query: `${session.candidate.member.name} ${session.currentTopic} ${message.substring(0, 100)}`,
      limit: 5,
    });
    if (searchResult?.edges?.length > 0) {
      const memoryFacts = searchResult.edges
        .map((e: any) => e.fact || e.content || e.name || '')
        .filter(Boolean)
        .slice(0, 3)
        .join('; ');
      if (memoryFacts) {
        breethContext = `Persistent Memory Facts (Breeth AI): ${memoryFacts}`;
      }
    }
  } catch (err) {
    console.warn('[InterviewEngine] Breeth search failed (non-fatal):', (err as Error).message);
  }

  // Recent 4 turns for context window efficiency
  const recentTurns = session.turns.slice(-4).map(t =>
    t.role === 'interviewer' ? `Interviewer: ${t.content}` : `Candidate: ${t.content}`
  ).join('\n');

  const profile = buildCandidateProfile(session.candidate);
  const nextTopic = selectNextTopic(session);

  const systemPrompt = `${SYSTEM_PROMPT}

Candidate Profile:
${profile}
${breethContext}

Interview Progress:
- Focus Topic: "${nextTopic}" (${getDifficultyLabel(session.difficulty)} level)`;

  const userPrompt = `Recent Conversation:
${recentTurns}

React directly to what the candidate just said in 1 sentence using second-person ("you" / "your answer"). If they said "i dont know", acknowledge it empathetically ("Fair enough if you haven't worked with that directly"). Then ask your next sharp technical question about "${nextTopic}" (max 2 sentences). Total response under 60 words. Never say "the candidate" or "the candidate's answer".`;

  let reply: string;

  try {
    const response = await groqClient.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 200,
    });

    reply = sanitizeReply(response.choices[0]?.message?.content || '');

    logAiInteraction({
      taskName: `Interview Turn ${session.turnCount}: ${session.candidate.member.name}`,
      userPrompt: `Candidate: "${message.substring(0, 150)}..."`,
      reasoning: `Turn ${session.turnCount}. Evaluated on "${session.currentTopic}". Next topic: "${nextTopic}".`,
      output: { model: 'llama-3.3-70b-versatile', usage: response.usage, reply },
    });
  } catch (err) {
    reply = `Got it. Moving to ${nextTopic}: How do you approach designing this component for high availability?`;
    console.warn('[InterviewEngine] Groq completion failed, using fallback:', (err as Error).message);
  }

  // Adjust difficulty based on reply content
  adjustDifficulty(session, reply);

  // Track areas
  const lower = message.toLowerCase();
  if (lower.includes("don't know") || lower.includes("dont know") || lower.includes("not sure")) {
    if (!session.weakAreas.includes(session.currentTopic)) session.weakAreas.push(session.currentTopic);
  } else {
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

  let memoryContext = '';
  try {
    const searchResult = await breethClient.searchMemory({
      query: `interview evaluation ${session.candidate.member.name}`,
      limit: 10,
    });
    if (searchResult?.edges?.length > 0) {
      memoryContext = `\nBreeth Memory Context:\n${searchResult.edges.map((e: any) => e.fact || e.content || JSON.stringify(e)).join('\n')}`;
    }
  } catch (err) {
    console.warn('[InterviewEngine] Breeth search for feedback failed (non-fatal):', (err as Error).message);
  }

  const systemPrompt = `You are an expert AI technical interviewer. Synthesize final performance feedback.

Candidate Profile:
${profile}
${memoryContext}

Topics covered: ${[...session.topicsCovered].join(', ')}
Total turns: ${session.turnCount}`;

  const userPrompt = `Conversation history:
${conversationHistory}

Output ONLY a valid JSON object matching this exact schema:
{
  "summary": "2-3 sentence overall evaluation",
  "strengths": ["strength 1", "strength 2"],
  "gaps": ["gap 1", "gap 2"],
  "next": ["recommendation 1", "recommendation 2"]
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
      max_tokens: 800,
    });

    const raw = response.choices[0]?.message?.content || '';

    logAiInteraction({
      taskName: `Interview Feedback: ${session.candidate.member.name}`,
      userPrompt: `Generate final feedback for session ${session.sessionId}`,
      reasoning: `Synthesized ${session.turnCount} turns across ${session.topicsCovered.size} topics.`,
      output: { model: 'llama-3.3-70b-versatile', usage: response.usage, rawFeedback: raw },
    });

    const jsonStr = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    feedback = JSON.parse(jsonStr);
  } catch (err) {
    console.warn('[InterviewEngine] Feedback parse failed, using fallback:', (err as Error).message);
    feedback = {
      summary: `${session.candidate.member.name} completed a ${session.turnCount}-turn technical interview covering ${session.topicsCovered.size} curriculum topics.`,
      strengths: session.strongAreas.length > 0 ? session.strongAreas : ['Completed technical interview'],
      gaps: session.weakAreas.length > 0 ? session.weakAreas : ['No critical gaps identified'],
      next: ['Review targeted curriculum modules', 'Practice architectural design trade-offs'],
    };
  }

  sessions.delete(session.sessionId);

  return {
    reply: 'Interview completed successfully.',
    done: true,
    feedback,
  };
}

export function getSession(sessionId: string): InterviewSession | undefined {
  return sessions.get(sessionId);
}

export function getActiveSessionIds(): string[] {
  return [...sessions.keys()];
}
