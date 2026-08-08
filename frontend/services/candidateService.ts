import { apiClient } from './api';
import { Candidate } from '@/types';
import rawCandidatesData from '@/lib/candidates.json';

// Parse raw candidates list from lib/candidates.json
const allCandidatesFromDataset: Candidate[] = Array.isArray(rawCandidatesData)
  ? (rawCandidatesData as any)
  : (rawCandidatesData.candidates as any) || [];

// Populate a comprehensive map of all 20 candidates (CAND-001 through CAND-020)
export const mockCandidates: Record<string, Candidate> = {};

allCandidatesFromDataset.forEach((cand) => {
  if (cand && cand.member && cand.member.id) {
    mockCandidates[cand.member.id.toUpperCase().trim()] = cand;
  }
});

export const candidateService = {
  /**
   * Fetches real candidate profile by ID (e.g. CAND-001 through CAND-020).
   * Queries Express API endpoint GET /api/candidates/:id; falls back to lib/candidates.json.
   */
  async getCandidateById(candidateId: string): Promise<Candidate> {
    const formattedId = candidateId.toUpperCase().trim();
    try {
      const response = await apiClient.get<Candidate>(`/candidates/${formattedId}`);
      if (response.data && response.data.member) {
        return response.data;
      }
    } catch (err) {
      console.warn(`[candidateService] API fetch for ${formattedId} failed; reading from candidates dataset.`);
    }

    if (mockCandidates[formattedId]) {
      return mockCandidates[formattedId];
    }

    // Default structure for unknown IDs
    return {
      member: {
        id: formattedId,
        name: `Candidate ${formattedId}`,
        jobRole: 'Software Engineer',
        yearsExperience: 4,
        education: 'BS Computer Science',
        status: 'READY',
      },
      missions: [
        { day: 7, title: 'Embeddings Explained', passed: true, attempts: 1 },
        { day: 8, title: 'Vector Databases Overview', passed: true, attempts: 1 },
        { day: 12, title: 'Prompt Engineering', passed: true, attempts: 2 },
        { day: 16, title: 'API Integration', passed: true, attempts: 1 },
      ],
      signals: { commitDays: 20, missionsCompleted: 24, missionsFirstTry: 15 },
    };
  },

  /**
   * Fetches all candidates list.
   * Queries Express API endpoint GET /api/candidates; falls back to lib/candidates.json.
   */
  async getAllCandidates(): Promise<Candidate[]> {
    try {
      const response = await apiClient.get<Candidate[]>('/candidates');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn('[candidateService] API fetch for all candidates failed; reading from candidates dataset.');
    }

    return Object.values(mockCandidates);
  },
};
