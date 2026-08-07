import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export interface EnvConfig {
  GROQ_API_KEY: string;
  BREETH_API_KEY: string;
  BREETH_BASE_URL: string;
  DEFAULT_TOOL_NAME: string;
  DEFAULT_AI_MODEL: string;
  GIT_USERNAME: string;
}

export const env: EnvConfig = {
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  BREETH_API_KEY: process.env.BREETH_API_KEY || '',
  BREETH_BASE_URL: process.env.BREETH_BASE_URL || 'https://api.thebreeth.com/v1',
  DEFAULT_TOOL_NAME: process.env.DEFAULT_TOOL_NAME || 'Antigravity',
  DEFAULT_AI_MODEL: process.env.DEFAULT_AI_MODEL || 'Gemini 3.6 Flash',
  GIT_USERNAME: process.env.GIT_USERNAME || 'Shivam Salkar',
};

/**
 * Validates that critical environment variables are present.
 */
export function validateEnv(): void {
  const missing: string[] = [];
  if (!env.GROQ_API_KEY) missing.push('GROQ_API_KEY');
  if (!env.BREETH_API_KEY) missing.push('BREETH_API_KEY');

  if (missing.length > 0) {
    console.warn(`[Config Warning] Missing environment variables: ${missing.join(', ')}. Please configure them in .env file.`);
  }
}
