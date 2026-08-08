import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000/api/interview';
const SESSION_ID = `test-run-${Date.now()}`;

async function runTest() {
  console.log('===========================================================');
  console.log('  InterviewOS - Automated API Integration Test Suite      ');
  console.log('===========================================================\n');
  console.log(`Target Endpoint : ${API_URL}`);
  console.log(`Session ID      : ${SESSION_ID}\n`);

  // 1. Initialize Session
  console.log('--- Step 1: Initialize Session ---');
  try {
    const initRes = await axios.post(API_URL, {
      sessionId: SESSION_ID,
      candidate: {
        member: {
          id: 'CAND-001',
          name: 'Sarah Johnson',
          jobRole: 'Senior Data Engineer',
          yearsExperience: 9,
          education: 'MS Computer Science',
          status: 'COMPLETED',
        },
        missions: [
          { day: 7, title: 'Embeddings Explained', passed: true, attempts: 1 },
          { day: 8, title: 'Vector Databases Overview', passed: true, attempts: 1 },
          { day: 10, title: 'Retrieval & Matching Engine', passed: true, attempts: 2 },
          { day: 12, title: 'Prompt Engineering Fundamentals', passed: true, attempts: 4 },
          { day: 22, title: 'Multi-Agent Orchestration', passed: true, attempts: 2 },
          { day: 29, title: 'Monitoring, Logging & Observability', skipped: true },
          { day: 31, title: 'Capstone Project & Final Demo', passed: true, attempts: 1 },
        ],
        signals: { commitDays: 28, missionsCompleted: 30, missionsFirstTry: 20 },
      },
    });

    console.log('✅ Status Code:', initRes.status);
    console.log('🤖 AI Opening Question:\n', initRes.data.reply);
    console.log('📌 Done State:', initRes.data.done);
  } catch (err: any) {
    console.error('❌ Failed to initialize session:', err.response?.data || err.message);
    process.exit(1);
  }

  // 2. Mock Candidate Answers for Turns 2 through 9
  const mockAnswers = [
    'I chose vector search using cosine similarity because standard keyword search could not capture semantic query intent and contextual variations.',
    'For document chunking, we implemented parent-document retrieval to preserve broad section context while performing fine-grained vector embedding matching.',
    'We enforced strict JSON output schemas using Pydantic models in Python during function calling and tool execution.',
    'When MCP tool connections drop, we implement exponential backoff retries and fallback to local cached memory state.',
    'We used ChromaDB for local vector search prototyping and Pinecone for production cloud-scale indexing.',
    'For system observability, we logged latency, token consumption, and model outputs using structured JSON logs.',
    'We containerized our FastAPI backend with Docker and deployed it onto Kubernetes with health check probes.',
    'For our capstone project, we integrated RAG, multi-agent orchestration via CrewAI, and episodic memory persistence with Breeth AI.',
  ];

  // 3. Execute Conversation Loop
  for (let i = 0; i < mockAnswers.length; i++) {
    const turnNumber = i + 1;
    console.log(`\n--- Turn ${turnNumber + 1} (Mock Answer ${turnNumber}/${mockAnswers.length}) ---`);
    console.log(`👤 Candidate Answer: "${mockAnswers[i]}"`);

    try {
      const turnRes = await axios.post(API_URL, {
        sessionId: SESSION_ID,
        message: mockAnswers[i],
      });

      console.log('🤖 AI Reply:\n', turnRes.data.reply);
      console.log('📌 Done State:', turnRes.data.done);

      if (turnRes.data.done) {
        console.log('\n===========================================================');
        console.log('  🎉 INTERVIEW COMPLETED SUCCESSFULLY                      ');
        console.log('===========================================================');
        if (turnRes.data.feedback) {
          console.log('\n📊 Final Synthesized Feedback Payload:\n');
          console.log(JSON.stringify(turnRes.data.feedback, null, 2));
        } else {
          console.log('⚠️ Interview done signal received without feedback payload.');
        }
        break;
      }
    } catch (err: any) {
      console.error(`❌ Error on turn ${turnNumber}:`, err.response?.data || err.message);
      break;
    }
  }

  console.log('\n✨ Integration test run complete.\n');
}

runTest().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
