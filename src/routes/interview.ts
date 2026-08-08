/**
 * InterviewOS — Express router for POST /api/interview.
 */
import { Router, Request, Response } from 'express';
import { startInterview, processConversationTurn } from '../services/interviewEngine.js';
import type { InterviewApiRequest, InterviewApiResponse } from '../types/interview.js';

const router = Router();

router.post('/interview', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as InterviewApiRequest;

    // Validate: sessionId is always required
    if (!body.sessionId || typeof body.sessionId !== 'string') {
      res.status(400).json({
        error: 'Missing or invalid "sessionId". Provide a unique session identifier.',
      });
      return;
    }

    let response: InterviewApiResponse;

    if (body.candidate) {
      // ── Flow 1: Start a new interview ──────────────────────────────────
      if (!body.candidate.member || !body.candidate.missions) {
        res.status(400).json({
          error: 'Invalid "candidate" payload. Must include "member" and "missions" fields.',
        });
        return;
      }
      response = await startInterview(body.sessionId, body.candidate);
    } else if (body.message && typeof body.message === 'string') {
      // ── Flow 2: Conversation turn ──────────────────────────────────────
      response = await processConversationTurn(body.sessionId, body.message);
    } else {
      res.status(400).json({
        error: 'Request must include either "candidate" (to start) or "message" (to continue).',
      });
      return;
    }

    res.status(200).json(response);
  } catch (error: any) {
    console.error('[/api/interview] Unhandled error:', error);
    res.status(500).json({
      error: 'Internal server error during interview processing.',
      details: error.message,
    });
  }
});

import fs from 'fs';
import path from 'path';

// ── GET /api/candidates — List or search candidates ──────────────────────────
router.get('/candidates', (_req: Request, res: Response): void => {
  try {
    const raw = fs.readFileSync(path.resolve(process.cwd(), 'data/candidates.json'), 'utf-8');
    const data = JSON.parse(raw);
    res.json(data.candidates || []);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load candidates data' });
  }
});

// ── GET /api/candidates/:id — Fetch candidate by ID ──────────────────────────
router.get('/candidates/:id', (req: Request, res: Response): void => {
  try {
    const raw = fs.readFileSync(path.resolve(process.cwd(), 'data/candidates.json'), 'utf-8');
    const data = JSON.parse(raw);
    const candidateId = String(req.params.id || '').toLowerCase();
    const candidate = (data.candidates || []).find(
      (c: any) => c.member.id.toLowerCase() === candidateId
    );
    if (!candidate) {
      res.status(404).json({ error: `Candidate with ID '${req.params.id}' not found.` });
      return;
    }
    res.json(candidate);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});


export default router;

