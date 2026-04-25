import { apiClient } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  bio?: string;  // Add bio field
  created_at: string;
  total_debates: number;
  avg_score: number;
}

export interface DebateHistoryItem {
  session: {
    id: string;
    topic: string;
    category: string;
    difficulty: string;
    candidate_stance: string;
    created_at: string;
    ended_at?: string;
    duration_seconds: number;
    candidate_message_count: number;
    total_message_count: number;
  };
  evaluation?: {
    id: string;
    session_id: string;
    user_id: string;
    criteria_scores: {
      argumentation: number;
      clarity: number;
      evidence: number;
      rebuttal: number;
      presentation: number;
    };
    overall_score: number;
    strengths: Array<{
      title: string;
      description: string;
    }>;
    weaknesses: Array<{
      title: string;
      description: string;
    }>;
    improvements: Array<{
      title: string;
      description: string;
      priority: string;
    }>;
    missed_points: string[];
    feedback: string;
    ai_analysis: string;
    created_at: string;
  };
}

export const userService = {
  async getProfile(): Promise<User> {
    return apiClient.get<User>("/api/user/profile");
  },

  async updateProfile(data: { 
    username?: string; 
    full_name?: string;
    bio?: string;  // Add bio field
  }): Promise<User> {
    return apiClient.put<User>("/api/user/profile", data);
  },

  async getDebateHistory(limit: number = 20, skip: number = 0): Promise<DebateHistoryItem[]> {
    return apiClient.get<DebateHistoryItem[]>(`/user/debate-history?limit=${limit}&skip=${skip}`);
  },
};
