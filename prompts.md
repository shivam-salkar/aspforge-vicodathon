# Hackathon AI Usage Log & Prompt History
*Project: InterviewOS*
*Organization: ABTalks AI Cohort Hackathon*

This file records all AI-assisted prompt workflows, reasoning steps, tool usage, model outputs, and API execution logs throughout the project lifecycle.

> **CRITICAL LOGGING INSTRUCTIONS FOR ALL FUTURE PROMPTS & AI ENTRIES:**
> 1. **Full Prompt Inclusion**: Always record the ENTIRE, complete, untruncated user prompt text under the prompt section.
> 2. **Structure**: Include the full user prompt, AI reasoning/thought process, generated code/API outputs, and runtime execution logs.
> 3. **Append-Only Mode**: Never clear or overwrite existing entries in `prompts.md`. Always append new entries to the bottom of the file.

---

## [2026-08-07T17:51:20Z] - Record Full Untruncated Original Prompt & Log Rule Note
- **Tool Used:** Antigravity
- **AI Model:** Gemini 3.6 Flash
- **Git User:** Shivam Salkar
- **Execution ID:** b492ef10

### 1. User Prompt / Intent
> You are an expert Lead Systems Architect initializing a clean, hackathon-ready TypeScript/Node.js CLI project (No UI framework) for "InterviewOS".
> 
> ### Objective
> Scaffold a minimal TypeScript Node.js backend project that integrates Groq SDK for LLM completions and sets up Breeth AI SDK/API structures for memory and episodic search. Configure a standardized AI Usage Logger that writes all prompts, reasoning, tool metadata, and model outputs to `prompts.md`.
> 
> ---
> 
> ### Directory & File Requirements
> Create the following directory structure:
> 
> .
> ├── src/
> │   ├── config/
> │   │   └── env.ts           # Type-safe process.env (GROQ_API_KEY, BREETH_API_KEY)
> │   ├── services/
> │   │   ├── groq.ts          # Groq SDK completion client
> │   │   └── breeth.ts        # Breeth AI Client (Episodes, Search, Intent endpoints)
> │   ├── utils/
> │   │   └── logger.ts        # Automated append-only logger for prompts.md
> │   └── index.ts             # CLI test entrypoint verifying Groq + Breeth
> ├── data/
> │   ├── candidates.json      # Mock candidates profile
> │   └── curriculum.json      # Hackathon curriculum data
> ├── prompts.md               # Main AI Usage Log for Judges
> ├── .env.example             # Template for API keys
> ├── .gitignore               # Ignores node_modules, .env, build outputs
> ├── package.json             # ES Modules + TypeScript config
> └── tsconfig.json            # Target Node20 / ES2022
> 
> ---
> 
> ### Step-by-Step Execution Plan
> 
> 1. **Package Management (`package.json`)**
>    - Configure ES Modules (`"type": "module"`).
>    - Add dependencies: `groq-sdk`, `dotenv`, `axios` (for Breeth API).
>    - Add devDependencies: `typescript`, `@types/node`, `tsx`.
>    - Add scripts: `"dev": "tsx src/index.ts"`, `"build": "tsc"`.
> 
> 2. **Logger Utility (`src/utils/logger.ts`)**
>    - Create a helper `logAiInteraction(params)` that appends a Markdown section to `prompts.md`.
>    - The logger MUST format entries using this exact structure required by judges:
> 
>      ```markdown
>      ## [TIMESTAMP] - TASK_NAME
>      - **Tool Used:** TOOL_NAME (e.g. Antigravity, OpenCode, Cursor, Cline)
>      - **AI Model:** MODEL_NAME (e.g. Claude 3.5 Sonnet, GPT-4o)
>      - **Git User:** GIT_USERNAME
>      - **Execution ID:** RANDOM_UUID
> 
>      ### 1. User Prompt / Intent
>      > USER_PROMPT_TEXT
> 
>      ### 2. AI Reasoning & Strategy
>      REASONING_TEXT
> 
>      ### 3. Generated Code / API Output Logs
>      ```json
>      OUTPUT_OR_PAYLOAD
>      ```
>      ---
>      ```
> 
> 3. **Groq Client (`src/services/groq.ts`)**
>    - Initialize `Groq` using `process.env.GROQ_API_KEY`.
>    - Export a helper `generateCompletion(prompt: string, systemPrompt?: string)` that logs both the prompt and LLM response via `logger.ts`.
> 
> 4. **Breeth Memory Client (`src/services/breeth.ts`)**
>    - Implement wrappers for Breeth AI endpoints using `process.env.BREETH_API_KEY` and base URL `https://api.thebreeth.com/v1`:
>      - `createEpisode(payload)` -> `POST /v1/episodes`
>      - `searchMemory(query)` -> `POST /v1/search`
>      - `extractIntent(text)` -> `POST /v1/episodes?extract_intent=true`
> 
> 5. **Sanity Check CLI (`src/index.ts`)**
>    - Write an `async main()` script that:
>      1. Loads environment variables.
>      2. Calls Groq SDK with a minimal test prompt ("System check").
>      3. Calls Breeth API to test search initialization.
>      4. Logs the entire operation into `prompts.md`.
> 
> 6. **Initialize `prompts.md`**
>    - Add a document header explaining the log layout for judges:
>      ```markdown
>      # Hackathon AI Usage Log & Prompt History
>      *Project: InterviewOS*
>      *Organization: ABTalks AI Cohort Hackathon*
> 
>      This file records all AI-assisted prompt workflows, reasoning steps, tool usage, and execution outputs throughout the project lifecycle.
>      ---
>      ```

### 2. AI Reasoning & Strategy
Added explicit rule to header of `prompts.md` mandating that all log entries record full untruncated user prompts. Recorded complete original prompt specification and updated project repository logs accordingly.

### 3. Generated Code / Output Logs
```markdown
Updated header rule note and recorded full untruncated prompt history to prompts.md.
```
---

## [2026-08-07T17:52:48Z] - Full Prompt & Logging Protocol Update + Git Commit
- **Tool Used:** Antigravity
- **AI Model:** Gemini 3.6 Flash
- **Git User:** Shivam Salkar
- **Execution ID:** d7e910fa

### 1. Full User Prompt
> add this the the original prompt
> iYou are an expert Lead Systems Architect initializing a clean, hackathon-ready TypeScript/Node.js CLI project (No UI framework) for "InterviewOS".
> 
> ### Objective
> Scaffold a minimal TypeScript Node.js backend project that integrates Groq SDK for LLM completions and sets up Breeth AI SDK/API structures for memory and episodic search. Configure a standardized AI Usage Logger that writes all prompts, reasoning, tool metadata, and model outputs to `prompts.md`.
> 
> ---
> 
> ### Directory & File Requirements
> Create the following directory structure:
> 
> .
> ├── src/
> │   ├── config/
> │   │   └── env.ts           # Type-safe process.env (GROQ_API_KEY, BREETH_API_KEY)
> │   ├── services/
> │   │   ├── groq.ts          # Groq SDK completion client
> │   │   └── breeth.ts        # Breeth AI Client (Episodes, Search, Intent endpoints)
> │   ├── utils/
> │   │   └── logger.ts        # Automated append-only logger for prompts.md
> │   └── index.ts             # CLI test entrypoint verifying Groq + Breeth
> ├── data/
> │   ├── candidates.json      # Mock candidates profile
> │   └── curriculum.json      # Hackathon curriculum data
> ├── prompts.md               # Main AI Usage Log for Judges
> ├── .env.example             # Template for API keys
> ├── .gitignore               # Ignores node_modules, .env, build outputs
> ├── package.json             # ES Modules + TypeScript config
> └── tsconfig.json            # Target Node20 / ES2022
> 
> ---
> 
> ### Step-by-Step Execution Plan
> 
> 1. **Package Management (`package.json`)**
>    - Configure ES Modules (`"type": "module"`).
>    - Add dependencies: `groq-sdk`, `dotenv`, `axios` (for Breeth API).
>    - Add devDependencies: `typescript`, `@types/node`, `tsx`.
>    - Add scripts: `"dev": "tsx src/index.ts"`, `"build": "tsc"`.
> 
> 2. **Logger Utility (`src/utils/logger.ts`)**
>    - Create a helper `logAiInteraction(params)` that appends a Markdown section to `prompts.md`.
>    - The logger MUST format entries using this exact structure required by judges:
> 
>      ```markdown
>      ## [TIMESTAMP] - TASK_NAME
>      - **Tool Used:** TOOL_NAME (e.g. Antigravity, OpenCode, Cursor, Cline)
>      - **AI Model:** MODEL_NAME (e.g. Claude 3.5 Sonnet, GPT-4o)
>      - **Git User:** GIT_USERNAME
>      - **Execution ID:** RANDOM_UUID
> 
>      ### 1. User Prompt / Intent
>      > USER_PROMPT_TEXT
> 
>      ### 2. AI Reasoning & Strategy
>      REASONING_TEXT
> 
>      ### 3. Generated Code / API Output Logs
>      ```json
>      OUTPUT_OR_PAYLOAD
>      ```
>      ---
>      ```
> 
> 3. **Groq Client (`src/services/groq.ts`)**
>    - Initialize `Groq` using `process.env.GROQ_API_KEY`.
>    - Export a helper `generateCompletion(prompt: string, systemPrompt?: string)` that logs both the prompt and LLM response via `logger.ts`.
> 
> 4. **Breeth Memory Client (`src/services/breeth.ts`)**
>    - Implement wrappers for Breeth AI endpoints using `process.env.BREETH_API_KEY` and base URL `https://api.thebreeth.com/v1`:
>      - `createEpisode(payload)` -> `POST /v1/episodes`
>      - `searchMemory(query)` -> `POST /v1/search`
>      - `extractIntent(text)` -> `POST /v1/episodes?extract_intent=true`
> 
> 5. **Sanity Check CLI (`src/index.ts`)**
>    - Write an `async main()` script that:
>      1. Loads environment variables.
>      2. Calls Groq SDK with a minimal test prompt ("System check").
>      3. Calls Breeth API to test search initialization.
>      4. Logs the entire operation into `prompts.md`.
> 
> 6. **Initialize `prompts.md`**
>    - Add a document header explaining the log layout for judges:
>      ```markdown
>      # Hackathon AI Usage Log & Prompt History
>      *Project: InterviewOS*
>      *Organization: ABTalks AI Cohort Hackathon*
> 
>      This file records all AI-assisted prompt workflows, reasoning steps, tool usage, and execution outputs throughout the project lifecycle.
>      ---
>      ```
> 
> SYSTEM INSTRUCTION: HACKATHON AI USAGE LOGGING RULE
> Every time you modify code, generate a new component, write a script, or issue an API call, you MUST append a new record to the bottom of `prompts.md`.
> 
> to the prompts.md, update the prompts.md to INCLUDE ENTIRE USER message, also no need for user intent just include the PROMPTS along ai output and thoguht and another section at bottom which will contain ai logs also add note in prompts.md for future prompts to add the entire prompt and these instructions
> 
> and also commit the changes

### 2. AI Thought & Strategy
Updated the header section of `prompts.md` with persistent logging instructions for future turns (mandating untruncated prompt capture, AI thoughts/outputs, runtime logs, and append-only mode). Updated `prompts.md` with the complete untruncated user request and staged all changes for a git commit.

### 3. Generated Code & Changes
```markdown
- Updated prompts.md header with explicit instructions for full prompt logging and execution log sections.
- Appended untruncated prompt history to prompts.md.
```

### 4. Runtime Execution Logs
```bash
git add prompts.md
git commit -m "docs: update prompts.md with full prompt logging guidelines and append untruncated prompt history"
```
---
