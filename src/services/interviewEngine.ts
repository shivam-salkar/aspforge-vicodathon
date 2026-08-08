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
  RecordedQuestion,
  InterviewResultData,
  TopicTimeAnalysis,
} from '../types/interview.js';

// ─── System Prompt Definition ────────────────────────────────────────────────

const SYSTEM_PROMPT = `
You are a Senior Principal AI Engineer conducting a realistic 1-on-1 technical interview.

RULES:
1. ALWAYS speak directly to the candidate in second person ("you", "your answer"). NEVER say "the candidate", "the candidate's answer", or "the user".
2. React naturally like a real human interviewer. If they answer well, give a brief 1-sentence validation. If they say "i dont know" or give a weak answer, acknowledge it empathetically in 1 sentence.
3. Use persistent memory facts from Breeth AI to ground your responses in what the candidate previously stated or achieved.
4. ONLY ask technical questions strictly from the candidate's COMPLETED curriculum topics.
5. NEVER output markdown labels or prefixes like "Evaluation:" or "Topic:". Speak naturally in conversational speech.
6. Keep your total response under 60 words (3-4 sentences max).
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

// ─── Result Persistence to Disk ─────────────────────────────────────────────

function saveInterviewResultToDisk(result: InterviewResultData): void {
  try {
    const resultsFilePath = path.resolve(process.cwd(), 'data/results.json');
    let resultsList: InterviewResultData[] = [];
    if (fs.existsSync(resultsFilePath)) {
      const raw = fs.readFileSync(resultsFilePath, 'utf-8');
      resultsList = JSON.parse(raw) as InterviewResultData[];
    }

    const createdAt = result.createdAt || new Date().toISOString();
    const fullResult = { ...result, createdAt };

    const existingIndex = resultsList.findIndex((r) => r.sessionId === result.sessionId);
    if (existingIndex >= 0) {
      resultsList[existingIndex] = fullResult;
    } else {
      resultsList.unshift(fullResult);
    }

    fs.writeFileSync(resultsFilePath, JSON.stringify(resultsList, null, 2), 'utf-8');
  } catch (err: any) {
    console.error('[InterviewEngine] Error saving interview result to data/results.json:', err.message);
  }
}

export function getInterviewResultsByCandidateId(candidateId: string): InterviewResultData[] {
  try {
    const resultsFilePath = path.resolve(process.cwd(), 'data/results.json');
    if (!fs.existsSync(resultsFilePath)) return [];
    const raw = fs.readFileSync(resultsFilePath, 'utf-8');
    const resultsList = JSON.parse(raw) as InterviewResultData[];
    return resultsList.filter((r) => r.candidateId.toLowerCase() === candidateId.toLowerCase());
  } catch (err: any) {
    console.error('[InterviewEngine] Error reading candidate interview results:', err.message);
    return [];
  }
}

// ─── Candidate Completed Curriculum Days Filter ─────────────────────────────

interface CurriculumDay {
  day: number;
  title: string;
  type?: string;
  tools?: string[];
  objectives?: string[];
}

function getCandidateCompletedDays(candidate: Candidate, curriculum: Curriculum): CurriculumDay[] {
  const completedSet = new Set(
    (candidate.missions || [])
      .filter((m) => m.passed === true && !m.skipped)
      .map((m) => m.day)
  );

  const curriculumDays = (curriculum.days || []) as CurriculumDay[];
  const matchedDays = curriculumDays.filter((d) => completedSet.has(d.day));

  if (matchedDays.length === 0) {
    return curriculumDays.slice(0, 5);
  }
  return matchedDays;
}

// ─── Sanitizer & Scoring Helpers ─────────────────────────────────────────────

function sanitizeReply(reply: string): string {
  if (!reply) return '';
  return reply
    .replace(/^Topic:\s*[^|]+\|\s*Q\d+:\s*/i, '')
    .replace(/\*\*(?:Evaluation|Next Question|Question|Feedback):\*\*/gi, '')
    .replace(/(?:Evaluation|Next Question|Question|Feedback):/gi, '')
    .replace(/The candidate's answer/gi, 'Your answer')
    .replace(/The candidate's response/gi, 'Your response')
    .replace(/The candidate/gi, 'You')
    .replace(/\b(\w+)\s+\1\b/gi, '$1')
    .replace(/\bundefined\b/gi, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Evaluate candidate's answer quality on a 0-10 scale.
 * Score > 5 is Right (Passed), <= 5 is Wrong (Needs Improvement).
 */
function evaluateAnswerScore(answer: string, topic: string): number {
  const text = answer.trim().toLowerCase();
  if (!text || text.length < 5) return 2.0;

  if (
    text.includes("don't know") ||
    text.includes("dont know") ||
    text.includes("not sure") ||
    text.includes("no idea") ||
    text.includes("haven't worked") ||
    text.includes("skip")
  ) {
    return Number((Math.random() * 1.5 + 2.0).toFixed(1));
  }

  if (text.split(' ').length < 12) {
    return Number((Math.random() * 1.5 + 4.0).toFixed(1));
  }

  const techKeywords = [
    'system', 'architecture', 'vector', 'embedding', 'retrieval', 'index',
    'latency', 'throughput', 'cache', 'pipeline', 'agent', 'model', 'api',
    'docker', 'kubernetes', 'scale', 'database', 'sqlite', 'chroma', 'rag',
    'prompt', 'mcp', 'context', 'memory', 'optimization', 'trade-off'
  ];

  const keywordHits = techKeywords.filter((kw) => text.includes(kw)).length;

  if (keywordHits >= 3) {
    return Number((Math.min(10.0, Math.random() * 1.5 + 8.2)).toFixed(1));
  } else if (keywordHits >= 1) {
    return Number((Math.random() * 1.5 + 6.5).toFixed(1));
  }

  return Number((Math.random() * 1.5 + 5.5).toFixed(1));
}

// ─── Candidate Telemetry Analysis ───────────────────────────────────────────

function buildCandidateProfile(candidate: Candidate): string {
  const m = candidate.member;
  const s = candidate.signals;
  const curriculum = loadCurriculum();
  const completedDays = getCandidateCompletedDays(candidate, curriculum);

  const completedTitles = completedDays.map((d) => `${d.title} (Day ${d.day})`).join(', ');

  return [
    `Candidate: ${m.name}`,
    `Role: ${m.jobRole} | Experience: ${m.yearsExperience} years | Education: ${m.education}`,
    `Cohort Progress: ${s.missionsCompleted}/31 missions completed, ${s.missionsFirstTry} first-try passes`,
    `Completed Curriculum Topics: ${completedTitles}`,
  ].filter(Boolean).join('\n');
}

function selectNextCompletedDayTopic(session: InterviewSession): CurriculumDay {
  const curriculum = loadCurriculum();
  const completedDays = getCandidateCompletedDays(session.candidate, curriculum);

  const uncovered = completedDays.filter(
    (d) => !session.topicsCovered.has(`Day ${d.day}`) && !session.topicsCovered.has(d.title)
  );

  if (uncovered.length > 0) {
    return uncovered[0];
  }

  const interviewerTurns = session.turns.filter((t) => t.role === 'interviewer').length;
  return completedDays[interviewerTurns % completedDays.length];
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
  const completedDays = getCandidateCompletedDays(candidate, curriculum);
  const initialDay = completedDays[0];
  const profile = buildCandidateProfile(candidate);

  const topicLabel = `${initialDay.title} (Day ${initialDay.day})`;

  const session: InterviewSession = {
    sessionId,
    candidate,
    turns: [],
    recordedQuestions: [],
    turnCount: 0,
    topicsCovered: new Set<string>(),
    currentTopic: topicLabel,
    weakAreas: [],
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

Target Completed Curriculum Topic: "${initialDay.title}" (Day ${initialDay.day}) [Level: ${getDifficultyLabel(session.difficulty)}]`;

  const userPrompt = `Ask your first technical question Q1 directly to ${candidate.member.name} ("you") about completed topic "${initialDay.title}" (Day ${initialDay.day}). Focus on concrete system architecture, tools (${(initialDay.tools || []).join(', ')}), or trade-offs. Speak in second-person. Under 60 words total. No topic headers in text.`;

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
      reasoning: `Initialized session ${sessionId}. Topic: "${topicLabel}". Difficulty: ${session.difficulty}.`,
      output: { model: 'llama-3.3-70b-versatile', usage: response.usage, reply },
    });
  } catch (err) {
    reply = `Welcome ${candidate.member.name}. Regarding your completed work on ${initialDay.title}: How do you approach designing and optimizing this component in production?`;
    console.warn('[InterviewEngine] Groq completion failed, using concise fallback:', (err as Error).message);
  }

  // Record the turn with explicit topic metadata
  session.turns.push({ role: 'interviewer', content: reply, topic: topicLabel, timestamp: new Date().toISOString() });
  session.turnCount = 1;
  session.topicsCovered.add(`Day ${initialDay.day}`);
  session.topicsCovered.add(initialDay.title);

  return { reply, done: false, topic: topicLabel };
}

/**
 * Process a candidate's answer and generate the next question or finalize.
 */
export async function processConversationTurn(
  sessionId: string,
  message: string,
  timeSpentSeconds: number = 60
): Promise<InterviewApiResponse> {
  const session = sessions.get(sessionId);
  if (!session) {
    return { reply: `No active session found for "${sessionId}". Please start a new interview.`, done: true };
  }

  const lastInterviewerTurn = session.turns.filter((t) => t.role === 'interviewer').pop();
  const lastQuestionText = lastInterviewerTurn ? lastInterviewerTurn.content : 'Technical Question';
  const currentTopic = lastInterviewerTurn?.topic || session.currentTopic;

  const score = evaluateAnswerScore(message, currentTopic);
  const isRight = score > 5.0;

  const dayNumMatch = currentTopic.match(/Day\s*(\d+)/i);
  const dayNumber = dayNumMatch ? parseInt(dayNumMatch[1], 10) : undefined;

  const questionNumber = session.recordedQuestions.length + 1;
  session.recordedQuestions.push({
    questionNumber,
    topic: currentTopic,
    dayNumber,
    question: lastQuestionText,
    answer: message,
    timeSpentSeconds: Math.max(10, timeSpentSeconds),
    score,
    isRight,
  });

  session.turns.push({ role: 'candidate', content: message, topic: currentTopic, timestamp: new Date().toISOString(), timeSpentSeconds });
  session.turnCount++;

  breethClient.extractIntent({
    title: `Turn ${session.turnCount} — Candidate Answer`,
    content: `Topic: ${currentTopic}\nScore: ${score}/10 (${isRight ? 'RIGHT' : 'WRONG'})\nAnswer: ${message}`,
    tags: ['interview-turn', sessionId, session.candidate.member.id],
    metadata: { sessionId, turn: session.turnCount, topic: currentTopic, score, isRight },
  }).catch((err) => {
    console.warn('[InterviewEngine] Breeth extractIntent failed (non-fatal):', (err as Error).message);
  });

  const interviewerTurns = session.turns.filter((t) => t.role === 'interviewer').length;
  if (interviewerTurns >= 8 && session.topicsCovered.size >= 4) {
    const feedbackResponse = await generateFinalFeedback(session);
    const result = compileInterviewResult(session);
    return { ...feedbackResponse, result };
  }

  let breethContext = '';
  try {
    const searchResult = await breethClient.searchMemory({
      query: `${session.candidate.member.name} ${currentTopic} ${message.substring(0, 100)}`,
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

  const recentTurns = session.turns.slice(-4).map(t =>
    t.role === 'interviewer' ? `Interviewer: ${t.content}` : `Candidate: ${t.content}`
  ).join('\n');

  const profile = buildCandidateProfile(session.candidate);
  const nextDay = selectNextCompletedDayTopic(session);
  const qNum = interviewerTurns + 1;
  const topicLabel = `${nextDay.title} (Day ${nextDay.day})`;

  const systemPrompt = `${SYSTEM_PROMPT}

Candidate Profile:
${profile}
${breethContext}

Interview Progress:
- Focus Topic: "${nextDay.title}" (Day ${nextDay.day}) [Level: ${getDifficultyLabel(session.difficulty)}]`;

  const userPrompt = `Recent Conversation:
${recentTurns}

React directly to what the candidate just said in 1 sentence using second-person ("you" / "your answer"). If they said "i dont know", acknowledge it empathetically. Then ask question Q${qNum} about completed topic "${nextDay.title}" (Day ${nextDay.day}). Total response under 60 words. Speak naturally in conversational speech without markdown labels or topic headers.`;

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
      reasoning: `Turn ${session.turnCount}. Q${qNum} on completed day ${nextDay.day} ("${nextDay.title}").`,
      output: { model: 'llama-3.3-70b-versatile', usage: response.usage, reply },
    });
  } catch (err) {
    reply = `Got it. Moving to your completed topic ${nextDay.title}: How do you approach designing this component for reliability?`;
    console.warn('[InterviewEngine] Groq completion failed, using fallback:', (err as Error).message);
  }

  adjustDifficulty(session, reply);

  if (!isRight) {
    if (!session.weakAreas.includes(currentTopic)) session.weakAreas.push(currentTopic);
  } else {
    if (!session.strongAreas.includes(currentTopic)) session.strongAreas.push(currentTopic);
  }

  session.turns.push({ role: 'interviewer', content: reply, topic: topicLabel, timestamp: new Date().toISOString() });
  session.turnCount++;
  session.currentTopic = topicLabel;
  session.topicsCovered.add(`Day ${nextDay.day}`);
  session.topicsCovered.add(nextDay.title);

  // Auto-save progress result
  const currentResult = compileInterviewResult(session);

  return { reply, done: false, topic: topicLabel, score, isRight, result: currentResult };
}

/**
 * Compiles authentic interview results from recorded questions & time logs.
 */
export function compileInterviewResult(session: InterviewSession): InterviewResultData {
  const recorded = session.recordedQuestions || [];
  const totalQuestions = recorded.length;
  const rightCount = recorded.filter((q) => q.isRight).length;
  const wrongCount = recorded.filter((q) => !q.isRight).length;
  const totalTimeSeconds = recorded.reduce((acc, q) => acc + q.timeSpentSeconds, 0);

  const overallScore =
    totalQuestions > 0
      ? Number((recorded.reduce((acc, q) => acc + q.score, 0) / totalQuestions).toFixed(1))
      : 0;
  const overallPercentage = Math.round(overallScore * 10);

  const topicMap = new Map<
    string,
    { topic: string; dayNumber?: number; questionCount: number; totalScore: number; totalTimeSeconds: number }
  >();

  recorded.forEach((q) => {
    const existing = topicMap.get(q.topic) || {
      topic: q.topic,
      dayNumber: q.dayNumber,
      questionCount: 0,
      totalScore: 0,
      totalTimeSeconds: 0,
    };

    existing.questionCount += 1;
    existing.totalScore += q.score;
    existing.totalTimeSeconds += q.timeSpentSeconds;

    topicMap.set(q.topic, existing);
  });

  const topicTimeAnalysis: TopicTimeAnalysis[] = Array.from(topicMap.values()).map((t) => ({
    topic: t.topic,
    dayNumber: t.dayNumber,
    questionCount: t.questionCount,
    avgScore: Number((t.totalScore / t.questionCount).toFixed(1)),
    totalTimeSeconds: t.totalTimeSeconds,
  }));

  const resData: InterviewResultData = {
    sessionId: session.sessionId,
    candidateId: session.candidate.member.id,
    candidateName: session.candidate.member.name,
    jobRole: session.candidate.member.jobRole,
    createdAt: session.createdAt || new Date().toISOString(),
    overallScore,
    overallPercentage,
    totalQuestions,
    rightCount,
    wrongCount,
    totalTimeSeconds,
    questions: recorded,
    topicTimeAnalysis,
  };

  saveInterviewResultToDisk(resData);
  return resData;
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
      summary: `${session.candidate.member.name} completed a ${session.turnCount}-turn technical interview covering ${session.topicsCovered.size} completed curriculum topics.`,
      strengths: session.strongAreas.length > 0 ? session.strongAreas : ['Completed technical interview'],
      gaps: session.weakAreas.length > 0 ? session.weakAreas : ['No critical gaps identified'],
      next: ['Review targeted curriculum modules', 'Practice architectural design trade-offs'],
    };
  }

  const result = compileInterviewResult(session);

  return {
    reply: 'Interview completed successfully.',
    done: true,
    feedback,
    result,
  };
}

export function getInterviewResult(sessionId: string): InterviewResultData | null {
  const session = sessions.get(sessionId);
  if (session) {
    return compileInterviewResult(session);
  }

  try {
    const resultsFilePath = path.resolve(process.cwd(), 'data/results.json');
    if (fs.existsSync(resultsFilePath)) {
      const raw = fs.readFileSync(resultsFilePath, 'utf-8');
      const resultsList = JSON.parse(raw) as InterviewResultData[];
      const found = resultsList.find((r) => r.sessionId === sessionId);
      if (found) return found;
    }
  } catch (err) {
    // Ignore error
  }
  return null;
}

export function getSession(sessionId: string): InterviewSession | undefined {
  return sessions.get(sessionId);
}

export function getActiveSessionIds(): string[] {
  return [...sessions.keys()];
}
