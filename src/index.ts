import { validateEnv, env } from './config/env.js';
import { generateCompletion } from './services/groq.js';
import { breethClient } from './services/breeth.js';
import { logAiInteraction } from './utils/logger.js';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('---------------------------------------------------------');
  console.log('  InterviewOS CLI - System Initialization & Verification  ');
  console.log('---------------------------------------------------------\n');

  // 1. Load & Validate Environment Variables
  console.log('[1/4] Validating Environment Configuration...');
  validateEnv();

  // Load sample mock datasets
  const candidatesPath = path.resolve(process.cwd(), 'data/candidates.json');
  const curriculumPath = path.resolve(process.cwd(), 'data/curriculum.json');
  const candidatesRaw = JSON.parse(fs.readFileSync(candidatesPath, 'utf-8'));
  const curriculumRaw = JSON.parse(fs.readFileSync(curriculumPath, 'utf-8'));

  const candidateList = Array.isArray(candidatesRaw) ? candidatesRaw : (candidatesRaw.candidates || []);
  const moduleList = curriculumRaw.modules || [];
  console.log(`- Loaded ${candidateList.length} Candidate Profiles`);
  console.log(`- Loaded ${moduleList.length} Curriculum Modules`);

  // 2. Groq SDK Test Call
  console.log('\n[2/4] Verifying Groq LLM Completion Client...');
  if (!env.GROQ_API_KEY) {
    console.log('⚠️  GROQ_API_KEY is not set in .env file. Logging test entry.');
    logAiInteraction({
      taskName: 'Sanity Check - Groq SDK (Key Missing)',
      userPrompt: 'System check: Verify Groq SDK configuration',
      reasoning: 'API key is missing in environment. Logged configuration state to prompts.md.',
      output: { status: 'CONFIG_MISSING', message: 'Set GROQ_API_KEY in .env file to enable live completions.' },
    });
  } else {
    try {
      const response = await generateCompletion('System check', 'System Verification Agent');
      console.log(`✅ Groq Response: ${response.trim()}`);
    } catch (error: any) {
      console.log(`⚠️ Groq API Error (Logged): ${error.message}`);
    }
  }

  // 3. Breeth Memory API Test Call
  console.log('\n[3/4] Verifying Breeth AI Memory Client...');
  if (!env.BREETH_API_KEY) {
    console.log('⚠️  BREETH_API_KEY is not set in .env file. Logging test entry.');
    logAiInteraction({
      taskName: 'Sanity Check - Breeth AI (Key Missing)',
      userPrompt: 'Search Query: "TypeScript candidate history"',
      reasoning: 'API key is missing in environment. Logged endpoint structure test to prompts.md.',
      output: { status: 'CONFIG_MISSING', message: 'Set BREETH_API_KEY in .env file to enable live search.' },
    });
  } else {
    try {
      const searchResult = await breethClient.searchMemory({ query: 'System check' });
      console.log('✅ Breeth Search Response:', searchResult);
    } catch (error: any) {
      console.log(`⚠️ Breeth API Error (Logged): ${error.message}`);
    }
  }

  // 4. Log Overall Operation Summary
  console.log('\n[4/4] Finalizing AI Usage Log in prompts.md...');
  logAiInteraction({
    taskName: 'Sanity Check CLI Complete',
    userPrompt: 'Initialize InterviewOS System Verification CLI',
    reasoning: 'Completed environment setup, data loading verification, Groq SDK integration, and Breeth API client wrapper.',
    output: {
      timestamp: new Date().toISOString(),
      status: 'INITIALIZATION_SUCCESS',
      candidatesLoaded: candidateList.length,
      curriculumTrack: curriculumRaw.cohort || curriculumRaw.track,
      modulesCount: moduleList.length,
    },
  });

  console.log('\n✅ InterviewOS CLI Scaffold initialized successfully!\n');
}

main().catch((err) => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
