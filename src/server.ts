/**
 * InterviewOS — Express server entry point.
 */
import express, { Request, Response } from 'express';
import cors from 'cors';
import { validateEnv } from './config/env.js';
import interviewRouter from './routes/interview.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health check — registered BEFORE router to debug ordering
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'InterviewOS', timestamp: new Date().toISOString() });
});

app.use('/api', interviewRouter);

// ─── Start ───────────────────────────────────────────────────────────────────

validateEnv();

app.listen(PORT, () => {
  console.log(`\n🚀 InterviewOS server running on http://localhost:${PORT}`);
  console.log(`   POST /api/interview  — Interview endpoint`);
  console.log(`   GET  /health         — Health check\n`);
});

export default app;
