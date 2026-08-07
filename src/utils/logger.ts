import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { env } from '../config/env.js';

export interface LogAiInteractionParams {
  taskName: string;
  userPrompt: string;
  reasoning: string;
  output: string | object;
  toolUsed?: string;
  aiModel?: string;
  gitUser?: string;
  executionId?: string;
  outputLanguage?: string;
}

const PROMPTS_FILE_PATH = path.resolve(process.cwd(), 'prompts.md');

/**
 * Appends a standardized AI interaction log entry to prompts.md.
 * Ensures strict compliance with hackathon evaluation rules.
 */
export function logAiInteraction(params: LogAiInteractionParams): void {
  const timestamp = new Date().toISOString();
  const toolUsed = params.toolUsed || env.DEFAULT_TOOL_NAME || 'Antigravity';
  const aiModel = params.aiModel || env.DEFAULT_AI_MODEL || 'Gemini 3.6 Flash';
  const gitUser = params.gitUser || env.GIT_USERNAME || 'Shivam Salkar';
  const executionId = params.executionId || crypto.randomUUID().slice(0, 8);

  const formattedOutput =
    typeof params.output === 'object'
      ? JSON.stringify(params.output, null, 2)
      : String(params.output);

  const lang = params.outputLanguage || (typeof params.output === 'object' ? 'json' : 'json');

  const logEntry = `\n## [${timestamp}] - ${params.taskName}
- **Tool Used:** ${toolUsed}
- **AI Model:** ${aiModel}
- **Git User:** ${gitUser}
- **Execution ID:** ${executionId}

### 1. User Prompt / Intent
> ${params.userPrompt.split('\n').join('\n> ')}

### 2. AI Reasoning & Strategy
${params.reasoning}

### 3. Generated Code / API Output Logs
\`\`\`${lang}
${formattedOutput}
\`\`\`
---
`;

  try {
    fs.appendFileSync(PROMPTS_FILE_PATH, logEntry, 'utf-8');
  } catch (error) {
    console.error('[Logger Error] Failed to write entry to prompts.md:', error);
  }
}
