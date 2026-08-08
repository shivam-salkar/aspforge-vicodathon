import { apiClient } from './api';
import { Candidate, InterviewResultData } from '@/types';
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
   * Verifies if candidate ID exists in database dataset.
   */
  async verifyCandidateExists(candidateId: string): Promise<boolean> {
    const formattedId = candidateId.toUpperCase().trim();
    try {
      const response = await apiClient.get<Candidate>(`/candidates/${formattedId}`);
      if (response.data && response.data.member && response.data.member.id) {
        return true;
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        return false;
      }
    }
    return Boolean(mockCandidates[formattedId]);
  },

  /**
   * Fetches real candidate profile by ID (e.g. CAND-001 through CAND-020).
   * Queries Express API endpoint GET /api/candidates/:id; falls back to lib/candidates.json.
   */
  async getCandidateById(candidateId: string): Promise<Candidate | null> {
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

    return null;
  },

  /**
   * Fetches past interview results history for a specific candidate.
   */
  async getCandidateInterviews(candidateId: string): Promise<InterviewResultData[]> {
    const formattedId = candidateId.toUpperCase().trim();
    try {
      const response = await apiClient.get<InterviewResultData[]>(`/candidates/${formattedId}/interviews`);
      if (Array.isArray(response.data)) {
        return response.data;
      }
    } catch (err) {
      console.warn(`[candidateService] API fetch interviews for ${formattedId} failed.`);
    }
    return [];
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
