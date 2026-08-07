import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env.js';
import { logAiInteraction } from '../utils/logger.js';

export interface CreateEpisodePayload {
  title?: string;
  content: string;
  metadata?: Record<string, any>;
  tags?: string[];
  [key: string]: any;
}

export interface SearchMemoryQuery {
  query: string;
  limit?: number;
  filters?: Record<string, any>;
}

export class BreethClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.BREETH_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.BREETH_API_KEY}`,
      },
    });
  }

  /**
   * Creates a new episode in Breeth memory store (POST /v1/episodes)
   */
  async createEpisode(payload: CreateEpisodePayload): Promise<any> {
    try {
      const response = await this.client.post('/episodes', payload);
      logAiInteraction({
        taskName: 'Breeth API - Create Episode',
        userPrompt: JSON.stringify(payload),
        reasoning: 'Creating new episodic memory entry in Breeth AI via POST /v1/episodes.',
        output: response.data,
      });
      return response.data;
    } catch (error: any) {
      const errResponse = error.response?.data || error.message;
      logAiInteraction({
        taskName: 'Breeth API - Create Episode (Logged)',
        userPrompt: JSON.stringify(payload),
        reasoning: `Attempted POST /v1/episodes. Caught error/response: ${JSON.stringify(errResponse)}`,
        output: { error: errResponse, status: error.response?.status },
      });
      throw error;
    }
  }

  /**
   * Searches memory episodes (POST /v1/search)
   */
  async searchMemory(query: SearchMemoryQuery | string): Promise<any> {
    const payload = typeof query === 'string' ? { query } : query;
    try {
      const response = await this.client.post('/search', payload);
      logAiInteraction({
        taskName: 'Breeth API - Search Memory',
        userPrompt: JSON.stringify(payload),
        reasoning: 'Executing search query against Breeth episodic memory via POST /v1/search.',
        output: response.data,
      });
      return response.data;
    } catch (error: any) {
      const errResponse = error.response?.data || error.message;
      logAiInteraction({
        taskName: 'Breeth API - Search Memory (Logged)',
        userPrompt: JSON.stringify(payload),
        reasoning: `Attempted POST /v1/search. Caught error/response: ${JSON.stringify(errResponse)}`,
        output: { error: errResponse, status: error.response?.status },
      });
      throw error;
    }
  }

  /**
   * Creates an episode and extracts intent (POST /v1/episodes?extract_intent=true)
   */
  async extractIntent(text: string | CreateEpisodePayload): Promise<any> {
    const payload = typeof text === 'string' ? { content: text } : text;
    try {
      const response = await this.client.post('/episodes?extract_intent=true', payload);
      logAiInteraction({
        taskName: 'Breeth API - Extract Intent',
        userPrompt: JSON.stringify(payload),
        reasoning: 'Posting episode to Breeth AI with intent extraction flag via POST /v1/episodes?extract_intent=true.',
        output: response.data,
      });
      return response.data;
    } catch (error: any) {
      const errResponse = error.response?.data || error.message;
      logAiInteraction({
        taskName: 'Breeth API - Extract Intent (Logged)',
        userPrompt: JSON.stringify(payload),
        reasoning: `Attempted POST /v1/episodes?extract_intent=true. Caught error/response: ${JSON.stringify(errResponse)}`,
        output: { error: errResponse, status: error.response?.status },
      });
      throw error;
    }
  }
}

export const breethClient = new BreethClient();
