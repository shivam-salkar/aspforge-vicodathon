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
5. Format your output into 2 sections separated by "---FOLLOWUP---":
   [Main Technical Question]
   ---FOLLOWUP---
   [2-3 word targeted follow-up probe]
   Example:
   How do you optimize vector index search latency in production?
   ---FOLLOWUP---
   Why vector index?
6. Keep total response under 60 words total. Speak naturally without markdown labels like "Evaluation:" or "Topic:".
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

  if (matchedDays.length < 4) {
    const existingDays = new Set(matchedDays.map((d) => d.day));
    for (const d of curriculumDays) {
      if (!existingDays.has(d.day)) {
        matchedDays.push(d);
        existingDays.add(d.day);
      }
      if (matchedDays.length >= 5) break;
    }
  }
  return matchedDays;
}

// ─── Sanitizer & Scoring Helpers ─────────────────────────────────────────────

function sanitizeReply(reply: string): string {
  if (!reply) return '';
  return reply
    .replace(/^Topic:\s*[^|]+\|\s*Q\d+:\s*/i, '')
    .replace(/\*\*(?:Evaluation|Next Question|Question|Feedback|Follow-up|Follow up|Followup|Probe):\*\*/gi, '')
    .replace(/(?:Evaluation|Next Question|Main Question|Question|Feedback|Follow-up Question|Follow-up|Follow up Question|Follow up|Followup|Probe):/gi, '')
    .replace(/\[(?:Follow-up|Follow up|Question|Probe)\]/gi, '')
    .replace(/\((?:Follow-up|Follow up|Question|Probe)\)/gi, '')
    .replace(/\bFollow-up\b/gi, '')
    .replace(/\bFollow up\b/gi, '')
    .replace(/\bFollowup\b/gi, '')
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
  if (!answer) return 1.5;
  const text = answer.trim().toLowerCase();
  if (text.length < 5) return 1.5;

  const unknownPatterns = [
    "don't know", "dont know", "do not know", "idk",
    "cant recall", "can't recall", "cannot recall", "unable to recall", "dont recall", "don't recall",
    "not sure", "unsure", "no idea", "no clue", "haven't worked", "havent worked",
    "skip", "pass", "no experience", "forgot", "forget", "not familiar", "don't remember", "dont remember",
    "na", "n/a", "no answer", "nothing"
  ];

  for (const pattern of unknownPatterns) {
    if (text.includes(pattern)) {
      return Number((Math.random() * 1.0 + 1.5).toFixed(1)); // 1.5 - 2.5 (ALWAYS <= 5 -> RED BOX!)
    }
  }

  // Short answers without technical keywords (< 8 words)
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 8) {
    const simpleTechHits = ['vector', 'index', 'hnsw', 'ivf', 'cache', 'rag', 'embedding', 'redis', 'api'].filter(k => text.includes(k)).length;
    if (simpleTechHits === 0) {
      return Number((Math.random() * 1.0 + 2.5).toFixed(1)); // 2.5 - 3.5 (ALWAYS <= 5 -> RED BOX!)
    }
  }

  const techKeywords = [
    'system', 'architecture', 'vector', 'embedding', 'retrieval', 'index',
    'latency', 'throughput', 'cache', 'pipeline', 'agent', 'model', 'api',
    'docker', 'kubernetes', 'scale', 'database', 'sqlite', 'chroma', 'rag',
    'prompt', 'mcp', 'context', 'memory', 'optimization', 'trade-off',
    'hnsw', 'ivf', 'redis', 'kafka', 'postgres', 'grpc', 'rest', 'json', 'token'
  ];

  const keywordHits = techKeywords.filter((kw) => text.includes(kw)).length;

  if (keywordHits >= 3) {
    return Number((Math.min(10.0, Math.random() * 1.5 + 8.2)).toFixed(1));
  } else if (keywordHits >= 1) {
    return Number((Math.random() * 1.0 + 6.2).toFixed(1));
  }

  // Default for non-technical or vague answers: strictly <= 5 (RED BOX!)
  return Number((Math.random() * 1.0 + 3.2).toFixed(1)); // 3.2 - 4.2 (ALWAYS <= 5 -> RED BOX!)
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

  const userPrompt = `Ask your first main technical question Q1 directly to ${candidate.member.name} ("you") about completed topic "${initialDay.title}" (Day ${initialDay.day}). Focus on concrete system architecture, tools (${(initialDay.tools || []).join(', ')}), or trade-offs. Ask only the main question in 2-3 sentences. Under 50 words total. Do not include follow-up headers or labels.`;

  let reply: string;
  try {
    const response = await groqClient.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 180,
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
  session.currentMainQuestion = reply;
  session.turns.push({ role: 'interviewer', content: reply, mainQuestion: reply, topic: topicLabel, isFollowUp: false, timestamp: new Date().toISOString() });
  session.turnCount = 1;
  session.topicsCovered.add(`Day ${initialDay.day}`);
  session.topicsCovered.add(initialDay.title);

  return { reply, mainQuestion: reply, done: false, topic: topicLabel, isFollowUp: false };
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
  const currentTopic = lastInterviewerTurn?.topic || session.currentTopic;
  const profile = buildCandidateProfile(session.candidate);

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 1: Candidate just answered the MAIN QUESTION
  // ─────────────────────────────────────────────────────────────────────────────
  if (!session.isExpectingFollowUpAnswer) {
    const mainScore = evaluateAnswerScore(message, currentTopic);
    session.currentMainAnswer = message;
    session.currentMainScore = mainScore;

    // Rule 2: Follow-up question is generated ONLY IF main question score > 5 (Answered correctly!)
    if (mainScore > 5.0) {
      session.isExpectingFollowUpAnswer = true;

      const systemPrompt = `${SYSTEM_PROMPT}

Candidate Profile:
${profile}

Focus Topic: "${currentTopic}"`;

      const userPrompt = `The candidate correctly answered your main technical question about "${currentTopic}":
"${message}"

Provide your output in exactly 2 separate lines:
Line 1: A brief validation phrase (e.g., "Correct! Spot-on analysis.", "Exactly right — strong technical explanation.").
Line 2: A thoughtful, highly specific 1-sentence technical probing question whose ideal answer is a short 2-3 words (e.g. "Which vector index type gave lower search latency: HNSW or IVF?", "Was your cache write-through or write-around?", "Did you use gRPC or REST for inter-service communication?").

Total response under 40 words. Do not use markdown labels or headers.`;

      let rawReply: string;
      try {
        const response = await groqClient.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.6,
          max_tokens: 140,
        });

        rawReply = sanitizeReply(response.choices[0]?.message?.content || '');

        logAiInteraction({
          taskName: `Interview Follow-up Gen: ${session.candidate.member.name}`,
          userPrompt,
          reasoning: `Main score ${mainScore} > 5. Generated validation & follow-up probe.`,
          output: { model: 'llama-3.3-70b-versatile', usage: response.usage, reply: rawReply },
        });
      } catch (err) {
        rawReply = `Correct! Spot-on technical answer.\nWhich specific index structure yielded lower search latency in your benchmark: HNSW or IVF?`;
        console.warn('[InterviewEngine] Groq follow-up generation failed, using fallback:', (err as Error).message);
      }

      let validationText = 'Correct! Spot-on analysis.';
      let followUpQuestionText = rawReply;

      const lines = rawReply.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length >= 2) {
        validationText = lines[0];
        followUpQuestionText = lines.slice(1).join(' ');
      } else {
        const match = rawReply.match(/^(Correct!?[^.?!]*[.?!]|Spot-on[^.?!]*[.?!]|Exactly right[^.?!]*[.?!]|Great job[^.?!]*[.?!])/i);
        if (match) {
          validationText = match[0].trim();
          followUpQuestionText = rawReply.slice(match[0].length).trim() || rawReply;
        }
      }

      session.currentFollowUpQuestion = followUpQuestionText;

      session.turns.push({
        role: 'candidate',
        content: message,
        topic: currentTopic,
        timestamp: new Date().toISOString(),
        timeSpentSeconds,
      });

      session.turns.push({
        role: 'interviewer',
        content: followUpQuestionText,
        mainQuestion: session.currentMainQuestion,
        followUpQuestion: followUpQuestionText,
        validationText,
        topic: currentTopic,
        isFollowUp: true,
        timestamp: new Date().toISOString(),
      });

      return {
        reply: followUpQuestionText,
        mainQuestion: session.currentMainQuestion,
        followUpQuestion: followUpQuestionText,
        validationText,
        isFollowUp: true,
        skippedFollowUp: false,
        score: mainScore,
        isRight: true,
        done: false,
        topic: currentTopic,
      };
    } else {
      // ─── Main Answer Score <= 5 (Incorrect / Weak) ───
      // Rule 2: DO NOT generate a follow-up! Record question and move directly to Next Main Question Q+1
      session.isExpectingFollowUpAnswer = false;

      const dayNumMatch = currentTopic.match(/Day\s*(\d+)/i);
      const dayNumber = dayNumMatch ? parseInt(dayNumMatch[1], 10) : undefined;

      const questionNumber = session.recordedQuestions.length + 1;
      session.recordedQuestions.push({
        questionNumber,
        topic: currentTopic,
        dayNumber,
        question: session.currentMainQuestion || 'Technical Question',
        answer: message,
        mainQuestion: session.currentMainQuestion || 'Technical Question',
        mainAnswer: message,
        mainScore,
        followUpQuestion: undefined,
        followUpAnswer: undefined,
        followUpScore: undefined,
        timeSpentSeconds: Math.max(10, timeSpentSeconds),
        score: mainScore,
        isRight: false,
      });

      let wrongValidationText = 'Not very accurate — missing core architectural trade-offs.';
      const lowerMsg = message.toLowerCase();
      if (
        lowerMsg.includes('know') ||
        lowerMsg.includes('recall') ||
        lowerMsg.includes('sure') ||
        lowerMsg.includes('remember') ||
        lowerMsg.includes('idea') ||
        lowerMsg.includes('clue') ||
        lowerMsg.includes('idk')
      ) {
        wrongValidationText = 'Candidate was unable to recall key technical concepts for this topic.';
      }

      session.turns.push({
        role: 'candidate',
        content: message,
        topic: currentTopic,
        timestamp: new Date().toISOString(),
        timeSpentSeconds,
      });

      session.turnCount++;

      const interviewerTurns = session.turns.filter((t) => t.role === 'interviewer' && !t.isFollowUp).length;
      if (interviewerTurns >= 8 || session.recordedQuestions.length >= 8) {
        const feedbackResponse = await generateFinalFeedback(session);
        const result = compileInterviewResult(session);
        return { ...feedbackResponse, result, done: true, isFollowUp: false, validationText: wrongValidationText, isRight: false };
      }

      const nextDay = selectNextCompletedDayTopic(session);
      const qNum = interviewerTurns + 1;
      const topicLabel = `${nextDay.title} (Day ${nextDay.day})`;

      const systemPrompt = `${SYSTEM_PROMPT}

Candidate Profile:
${profile}

Target Completed Curriculum Topic: "${nextDay.title}" (Day ${nextDay.day}) [Level: ${getDifficultyLabel(session.difficulty)}]`;

      const userPrompt = `Ask main technical question Q${qNum} directly to ${session.candidate.member.name} ("you") about completed topic "${nextDay.title}" (Day ${nextDay.day}). Focus on architecture, tools (${(nextDay.tools || []).join(', ')}), or trade-offs. Ask only the main question in 2-3 sentences. Under 50 words total. Do not include follow-up headers or labels.`;

      let nextMainReply: string;
      try {
        const response = await groqClient.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.6,
          max_tokens: 180,
        });

        nextMainReply = sanitizeReply(response.choices[0]?.message?.content || '');
      } catch (err) {
        nextMainReply = `Moving to your completed topic ${nextDay.title}: How do you approach designing and scaling this component for reliability?`;
      }

      session.currentMainQuestion = nextMainReply;
      session.turns.push({
        role: 'interviewer',
        content: nextMainReply,
        mainQuestion: nextMainReply,
        validationText: wrongValidationText,
        topic: topicLabel,
        isFollowUp: false,
        timestamp: new Date().toISOString(),
      });
      session.currentTopic = topicLabel;
      session.topicsCovered.add(`Day ${nextDay.day}`);
      session.topicsCovered.add(nextDay.title);

      const currentResult = compileInterviewResult(session);
      return {
        reply: nextMainReply,
        mainQuestion: nextMainReply,
        validationText: wrongValidationText,
        isFollowUp: false,
        skippedFollowUp: true,
        done: false,
        topic: topicLabel,
        score: mainScore,
        isRight: false,
        result: currentResult,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 2: Candidate answered the FOLLOW-UP QUESTION (short 2-3 words)
  // ─────────────────────────────────────────────────────────────────────────────
  session.isExpectingFollowUpAnswer = false;

  const followUpScore = evaluateAnswerScore(message, currentTopic);
  const combinedScore = Number((((session.currentMainScore || 6.0) * 0.7) + (followUpScore * 0.3)).toFixed(1));
  const isRight = combinedScore > 5.0;

  const dayNumMatch = currentTopic.match(/Day\s*(\d+)/i);
  const dayNumber = dayNumMatch ? parseInt(dayNumMatch[1], 10) : undefined;

  const questionNumber = session.recordedQuestions.length + 1;
  session.recordedQuestions.push({
    questionNumber,
    topic: currentTopic,
    dayNumber,
    question: session.currentMainQuestion || 'Technical Question',
    answer: `Main: ${session.currentMainAnswer || ''} | Follow-up: ${message}`,
    mainQuestion: session.currentMainQuestion || 'Technical Question',
    mainAnswer: session.currentMainAnswer,
    mainScore: session.currentMainScore,
    followUpQuestion: session.currentFollowUpQuestion,
    followUpAnswer: message,
    followUpScore,
    timeSpentSeconds: Math.max(10, timeSpentSeconds),
    score: combinedScore,
    isRight,
  });

  session.turns.push({
    role: 'candidate',
    content: message,
    topic: currentTopic,
    timestamp: new Date().toISOString(),
    timeSpentSeconds,
  });
  session.turnCount++;

  const interviewerTurns = session.turns.filter((t) => t.role === 'interviewer' && !t.isFollowUp).length;
  if (interviewerTurns >= 8 || session.recordedQuestions.length >= 8) {
    const feedbackResponse = await generateFinalFeedback(session);
    const result = compileInterviewResult(session);
    return { ...feedbackResponse, result, done: true, isFollowUp: false };
  }

  const nextDay = selectNextCompletedDayTopic(session);
  const qNum = interviewerTurns + 1;
  const topicLabel = `${nextDay.title} (Day ${nextDay.day})`;

  const systemPrompt = `${SYSTEM_PROMPT}

Candidate Profile:
${profile}

Target Completed Curriculum Topic: "${nextDay.title}" (Day ${nextDay.day}) [Level: ${getDifficultyLabel(session.difficulty)}]`;

  const userPrompt = `Ask main technical question Q${qNum} directly to ${session.candidate.member.name} ("you") about completed topic "${nextDay.title}" (Day ${nextDay.day}). Focus on architecture, tools (${(nextDay.tools || []).join(', ')}), or trade-offs. Ask only the main question in 2-3 sentences. Under 50 words total. Do not include follow-up headers or labels.`;

  let nextMainReply: string;

  try {
    const response = await groqClient.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 180,
    });

    nextMainReply = sanitizeReply(response.choices[0]?.message?.content || '');
  } catch (err) {
    nextMainReply = `Moving to your completed topic ${nextDay.title}: How do you approach designing and scaling this component for reliability?`;
  }

  session.currentMainQuestion = nextMainReply;
  session.turns.push({
    role: 'interviewer',
    content: nextMainReply,
    mainQuestion: nextMainReply,
    topic: topicLabel,
    isFollowUp: false,
    timestamp: new Date().toISOString(),
  });
  session.currentTopic = topicLabel;
  session.topicsCovered.add(`Day ${nextDay.day}`);
  session.topicsCovered.add(nextDay.title);

  const currentResult = compileInterviewResult(session);

  return {
    reply: nextMainReply,
    mainQuestion: nextMainReply,
    isFollowUp: false,
    done: false,
    topic: topicLabel,
    score: combinedScore,
    isRight,
    result: currentResult,
  };
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

  const totalEarnedScore = Number(recorded.reduce((acc, q) => acc + q.score, 0).toFixed(1));
  const totalMaxScore = totalQuestions * 10;
  const overallPercentage = totalMaxScore > 0 ? Math.round((totalEarnedScore / totalMaxScore) * 100) : 0;
  const overallScore = Number((totalEarnedScore / (totalQuestions || 1)).toFixed(1));

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
    totalMaxScore,
    totalEarnedScore,
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
