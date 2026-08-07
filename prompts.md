# Hackathon AI Usage Log & Prompt History
*Project: InterviewOS*
*Organization: ABTalks AI Cohort Hackathon*

This file records all AI-assisted prompt workflows, reasoning steps, tool usage, and execution outputs throughout the project lifecycle.
---

## [2026-08-07T17:04:39.696Z] - Sanity Check - Groq SDK (Key Missing)
- **Tool Used:** Antigravity
- **AI Model:** Gemini 3.6 Flash
- **Git User:** Shivam Salkar
- **Execution ID:** a0581e6a

### 1. User Prompt / Intent
> System check: Verify Groq SDK configuration

### 2. AI Reasoning & Strategy
API key is missing in environment. Logged configuration state to prompts.md.

### 3. Generated Code / API Output Logs
```json
{
  "status": "CONFIG_MISSING",
  "message": "Set GROQ_API_KEY in .env file to enable live completions."
}
```
---

## [2026-08-07T17:04:39.697Z] - Sanity Check - Breeth AI (Key Missing)
- **Tool Used:** Antigravity
- **AI Model:** Gemini 3.6 Flash
- **Git User:** Shivam Salkar
- **Execution ID:** bee38af5

### 1. User Prompt / Intent
> Search Query: "TypeScript candidate history"

### 2. AI Reasoning & Strategy
API key is missing in environment. Logged endpoint structure test to prompts.md.

### 3. Generated Code / API Output Logs
```json
{
  "status": "CONFIG_MISSING",
  "message": "Set BREETH_API_KEY in .env file to enable live search."
}
```
---

## [2026-08-07T17:04:39.697Z] - Sanity Check CLI Complete
- **Tool Used:** Antigravity
- **AI Model:** Gemini 3.6 Flash
- **Git User:** Shivam Salkar
- **Execution ID:** 4ad00ce8

### 1. User Prompt / Intent
> Initialize InterviewOS System Verification CLI

### 2. AI Reasoning & Strategy
Completed environment setup, data loading verification, Groq SDK integration, and Breeth API client wrapper.

### 3. Generated Code / API Output Logs
```json
{
  "timestamp": "2026-08-07T17:04:39.697Z",
  "status": "INITIALIZATION_SUCCESS",
  "candidatesLoaded": 2,
  "curriculumTrack": "ABTalks AI Cohort Hackathon - Technical Assessment Track",
  "modulesCount": 3
}
```
---

## [2026-08-07T17:04:45Z] - InterviewOS Project Scaffolding & Initial Verification
- **Tool Used:** Antigravity
- **AI Model:** Gemini 3.6 Flash
- **Git User:** Shivam Salkar
- **Execution ID:** c9f3b14a

### 1. User Prompt / Intent
> Scaffold a clean, hackathon-ready TypeScript/Node.js CLI project for "InterviewOS" with Groq SDK, Breeth AI client, standardized prompts.md logger utility, and mock data.

### 2. AI Reasoning & Strategy
Architected a modular Node.js backend using ES Modules and Node20/ES2022 TypeScript compiler target. Established type-safe environment configuration (`src/config/env.ts`), automated append-only markdown logger (`src/utils/logger.ts`), Groq SDK integration (`src/services/groq.ts`), Breeth memory endpoints wrapper (`src/services/breeth.ts`), mock data payloads (`data/candidates.json`, `data/curriculum.json`), and CLI sanity script (`src/index.ts`). Verified build and runtime status via `npm run dev` and `npm run build`.

### 3. Generated Code / Output Logs
```typescript
// Key components scaffolded:
// 1. src/config/env.ts - Type-safe environment validation
// 2. src/utils/logger.ts - logAiInteraction() helper for prompts.md
// 3. src/services/groq.ts - Groq SDK completions client
// 4. src/services/breeth.ts - Breeth AI episodic memory & search wrapper
// 5. src/index.ts - CLI test entrypoint
```
---

## [2026-08-07T17:06:21Z] - Update Dataset Reader & Guidance for Groq API Testing
- **Tool Used:** Antigravity
- **AI Model:** Gemini 3.6 Flash
- **Git User:** Shivam Salkar
- **Execution ID:** a7b89f10

### 1. User Prompt / Intent
> "how do i test groq api etc"

### 2. AI Reasoning & Strategy
Updated `src/index.ts` data loader to gracefully parse both object-wrapped (`{ candidates: [...] }`) and raw array JSON formats from `data/candidates.json` and `data/curriculum.json`. Provided step-by-step instructions on setting `.env` keys (`GROQ_API_KEY`, `BREETH_API_KEY`) and running `npm run dev` to test LLM completions and memory search.

### 3. Generated Code / Output Logs
```typescript
// Updated data parsing in src/index.ts:
const candidateList = Array.isArray(candidatesRaw) ? candidatesRaw : (candidatesRaw.candidates || []);
const moduleList = curriculumRaw.modules || [];
```
---

## [2026-08-07T17:06:09.977Z] - Sanity Check - Groq SDK (Key Missing)
- **Tool Used:** Antigravity
- **AI Model:** Gemini 3.6 Flash
- **Git User:** Shivam Salkar
- **Execution ID:** 3fa83a90

### 1. User Prompt / Intent
> System check: Verify Groq SDK configuration

### 2. AI Reasoning & Strategy
API key is missing in environment. Logged configuration state to prompts.md.

### 3. Generated Code / API Output Logs
```json
{
  "status": "CONFIG_MISSING",
  "message": "Set GROQ_API_KEY in .env file to enable live completions."
}
```
---

## [2026-08-07T17:06:09.978Z] - Sanity Check - Breeth AI (Key Missing)
- **Tool Used:** Antigravity
- **AI Model:** Gemini 3.6 Flash
- **Git User:** Shivam Salkar
- **Execution ID:** 1f9e539d

### 1. User Prompt / Intent
> Search Query: "TypeScript candidate history"

### 2. AI Reasoning & Strategy
API key is missing in environment. Logged endpoint structure test to prompts.md.

### 3. Generated Code / API Output Logs
```json
{
  "status": "CONFIG_MISSING",
  "message": "Set BREETH_API_KEY in .env file to enable live search."
}
```
---

## [2026-08-07T17:06:09.978Z] - Sanity Check CLI Complete
- **Tool Used:** Antigravity
- **AI Model:** Gemini 3.6 Flash
- **Git User:** Shivam Salkar
- **Execution ID:** 8d55572f

### 1. User Prompt / Intent
> Initialize InterviewOS System Verification CLI

### 2. AI Reasoning & Strategy
Completed environment setup, data loading verification, Groq SDK integration, and Breeth API client wrapper.

### 3. Generated Code / API Output Logs
```json
{
  "timestamp": "2026-08-07T17:06:09.978Z",
  "status": "INITIALIZATION_SUCCESS",
  "modulesCount": 8
}
```
---

## [2026-08-07T17:06:20.441Z] - Sanity Check - Groq SDK (Key Missing)
- **Tool Used:** Antigravity
- **AI Model:** Gemini 3.6 Flash
- **Git User:** Shivam Salkar
- **Execution ID:** c5381e55

### 1. User Prompt / Intent
> System check: Verify Groq SDK configuration

### 2. AI Reasoning & Strategy
API key is missing in environment. Logged configuration state to prompts.md.

### 3. Generated Code / API Output Logs
```json
{
  "status": "CONFIG_MISSING",
  "message": "Set GROQ_API_KEY in .env file to enable live completions."
}
```
---

## [2026-08-07T17:06:20.441Z] - Sanity Check - Breeth AI (Key Missing)
- **Tool Used:** Antigravity
- **AI Model:** Gemini 3.6 Flash
- **Git User:** Shivam Salkar
- **Execution ID:** 8da506d2

### 1. User Prompt / Intent
> Search Query: "TypeScript candidate history"

### 2. AI Reasoning & Strategy
API key is missing in environment. Logged endpoint structure test to prompts.md.

### 3. Generated Code / API Output Logs
```json
{
  "status": "CONFIG_MISSING",
  "message": "Set BREETH_API_KEY in .env file to enable live search."
}
```
---

## [2026-08-07T17:06:20.441Z] - Sanity Check CLI Complete
- **Tool Used:** Antigravity
- **AI Model:** Gemini 3.6 Flash
- **Git User:** Shivam Salkar
- **Execution ID:** d57cc8c5

### 1. User Prompt / Intent
> Initialize InterviewOS System Verification CLI

### 2. AI Reasoning & Strategy
Completed environment setup, data loading verification, Groq SDK integration, and Breeth API client wrapper.

### 3. Generated Code / API Output Logs
```json
{
  "timestamp": "2026-08-07T17:06:20.441Z",
  "status": "INITIALIZATION_SUCCESS",
  "candidatesLoaded": 20,
  "curriculumTrack": "AI Cohort · 31 days · 8 modules",
  "modulesCount": 8
}
```
---

## [2026-08-07T17:12:06Z] - Git Commit - Project Scaffold & Initial Setup
- **Tool Used:** Antigravity
- **AI Model:** Gemini 3.6 Flash
- **Git User:** Shivam Salkar
- **Execution ID:** f8d92e14

### 1. User Prompt / Intent
> "commit these changes with appropriete message"

### 2. AI Reasoning & Strategy
Staged all project scaffold files (`src/`, `data/`, `package.json`, `tsconfig.json`, `.gitignore`, `.env.example`, `prompts.md`) while ensuring secret files (`.env`) and `node_modules/` are excluded via `.gitignore`. Executed git commit with conventional commit message `feat: scaffold InterviewOS TypeScript CLI project with Groq, Breeth AI client, and prompts logger`.

### 3. Generated Code / Output Logs
```bash
git add .
git commit -m "feat: scaffold InterviewOS TypeScript CLI project with Groq, Breeth AI client, and prompts logger"
```
---
