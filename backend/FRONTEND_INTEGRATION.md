# Frontend Integration Guide

This guide helps you integrate your React/TypeScript frontend with the Debate Assistant AI backend.

## Overview

The backend provides a RESTful API that your frontend can consume. All endpoints require JWT authentication (except signup/login).

## Setup

### 1. Environment Variables (Frontend)

Create a `.env` file in your frontend:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 2. API Client Setup

Create an API client utility:

```typescript
// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
```

## API Service Functions

### Authentication Service

```typescript
// src/services/authService.ts
import { apiClient } from '../lib/api';

export interface SignupData {
  email: string;
  password: string;
  username: string;
  full_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/signup', data);
    apiClient.setToken(response.access_token);
    return response;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    apiClient.setToken(response.access_token);
    return response;
  },

  logout() {
    apiClient.clearToken();
  },
};
```

### User Service

```typescript
// src/services/userService.ts
import { apiClient } from '../lib/api';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  created_at: string;
  total_debates: number;
  avg_score: number;
}

export const userService = {
  async getProfile(): Promise<User> {
    return apiClient.get<User>('/api/user/profile');
  },

  async updateProfile(data: { username?: string; full_name?: string }): Promise<User> {
    return apiClient.put<User>('/api/user/profile', data);
  },
};
```

### Topics Service

```typescript
// src/services/topicsService.ts
import { apiClient } from '../lib/api';

export interface Topic {
  id: string;
  title: string;
  description?: string;
  category: string;
  created_at: string;
  usage_count: number;
}

export interface TopicsList {
  topics: Topic[];
  total: number;
}

export const topicsService = {
  async getTopics(category?: string, limit = 20, skip = 0): Promise<TopicsList> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('limit', limit.toString());
    params.append('skip', skip.toString());

    return apiClient.get<TopicsList>(`/api/topics/?${params.toString()}`);
  },

  async createTopic(data: {
    title: string;
    description?: string;
    category?: string;
  }): Promise<Topic> {
    return apiClient.post<Topic>('/api/topics/', data);
  },

  async getTopic(topicId: string): Promise<Topic> {
    return apiClient.get<Topic>(`/api/topics/${topicId}`);
  },
};
```

### Debate Service

```typescript
// src/services/debateService.ts
import { apiClient } from '../lib/api';

export interface DebateMessage {
  speaker: 'ai' | 'candidate';
  content: string;
  timestamp: string;
  audio_url?: string;
}

export interface DebateSession {
  id: string;
  user_id: string;
  topic: string;
  custom_topic: boolean;
  ai_stance: string;
  candidate_stance: string;
  status: 'active' | 'completed' | 'abandoned';
  messages: DebateMessage[];
  created_at: string;
  ended_at?: string;
  evaluation_id?: string;
}

export interface CreateDebateData {
  topic: string;
  custom_topic?: boolean;
  ai_stance: string;
  candidate_stance: string;
}

export interface AIResponse {
  ai_message: string;
  audio_url?: string;
}

export const debateService = {
  async createSession(data: CreateDebateData): Promise<DebateSession> {
    return apiClient.post<DebateSession>('/api/debate/session', data);
  },

  async submitResponse(sessionId: string, content: string): Promise<AIResponse> {
    return apiClient.post<AIResponse>('/api/debate/respond', {
      session_id: sessionId,
      content,
    });
  },

  async getSession(sessionId: string): Promise<DebateSession> {
    return apiClient.get<DebateSession>(`/api/debate/session/${sessionId}`);
  },

  async endSession(sessionId: string): Promise<{ message: string }> {
    return apiClient.post(`/api/debate/session/${sessionId}/end`);
  },

  async getSessions(limit = 10, skip = 0): Promise<DebateSession[]> {
    return apiClient.get<DebateSession[]>(
      `/api/debate/sessions?limit=${limit}&skip=${skip}`
    );
  },
};
```

### Evaluation Service

```typescript
// src/services/evaluationService.ts
import { apiClient } from '../lib/api';

export interface EvaluationCriteria {
  argumentation: number;
  clarity: number;
  evidence: number;
  rebuttal: number;
  presentation: number;
}

export interface Evaluation {
  id: string;
  session_id: string;
  user_id: string;
  criteria_scores: EvaluationCriteria;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  ai_analysis: string;
  created_at: string;
}

export const evaluationService = {
  async createEvaluation(sessionId: string): Promise<Evaluation> {
    return apiClient.post<Evaluation>('/api/evaluation/', {
      session_id: sessionId,
    });
  },

  async getEvaluation(evaluationId: string): Promise<Evaluation> {
    return apiClient.get<Evaluation>(`/api/evaluation/${evaluationId}`);
  },

  async getEvaluationBySession(sessionId: string): Promise<Evaluation> {
    return apiClient.get<Evaluation>(`/api/evaluation/session/${sessionId}`);
  },

  async getUserEvaluations(limit = 10, skip = 0): Promise<Evaluation[]> {
    return apiClient.get<Evaluation[]>(
      `/api/evaluation/user/all?limit=${limit}&skip=${skip}`
    );
  },
};
```

### Leaderboard Service

```typescript
// src/services/leaderboardService.ts
import { apiClient } from '../lib/api';

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_debates: number;
  average_score: number;
  highest_score: number;
  rank: number;
}

export const leaderboardService = {
  async getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    return apiClient.get<LeaderboardEntry[]>(`/api/leaderboard/?limit=${limit}`);
  },

  async getUserRank(userId: string): Promise<LeaderboardEntry> {
    return apiClient.get<LeaderboardEntry>(`/api/leaderboard/user/${userId}`);
  },
};
```

## React Hooks

### Authentication Hook

```typescript
// src/hooks/useAuth.ts
import { create } from 'zustand';
import { authService, userService, type User } from '../services';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await authService.login({ email, password });
      const user = await userService.getProfile();
      set({ user, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signup: async (email, password, username) => {
    set({ isLoading: true, error: null });
    try {
      await authService.signup({ email, password, username });
      const user = await userService.getProfile();
      set({ user, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null });
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const user = await userService.getProfile();
      set({ user, isLoading: false });
    } catch (error) {
      set({ user: null, isLoading: false });
    }
  },
}));
```

### Debate Hook

```typescript
// src/hooks/useDebate.ts
import { useState, useCallback } from 'react';
import { debateService, type DebateSession, type AIResponse } from '../services';

export const useDebate = () => {
  const [session, setSession] = useState<DebateSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDebate = useCallback(async (
    topic: string,
    aiStance: string,
    candidateStance: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const newSession = await debateService.createSession({
        topic,
        custom_topic: false,
        ai_stance: aiStance,
        candidate_stance: candidateStance,
      });
      setSession(newSession);
      return newSession;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitResponse = useCallback(async (content: string): Promise<AIResponse> => {
    if (!session) throw new Error('No active session');

    setIsLoading(true);
    setError(null);
    try {
      const response = await debateService.submitResponse(session.id, content);

      // Update session with new messages
      const updatedSession = await debateService.getSession(session.id);
      setSession(updatedSession);

      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const endDebate = useCallback(async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      await debateService.endSession(session.id);
      const updatedSession = await debateService.getSession(session.id);
      setSession(updatedSession);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  return {
    session,
    isLoading,
    error,
    startDebate,
    submitResponse,
    endDebate,
  };
};
```

## Speech Integration

### Text-to-Speech (AI Responses)

```typescript
// src/utils/textToSpeech.ts
export const speakText = (text: string, lang = 'en-US'): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(event);

    window.speechSynthesis.speak(utterance);
  });
};

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
```

### Speech-to-Text (Candidate Responses)

```typescript
// src/utils/speechToText.ts
export class SpeechRecognition {
  private recognition: any;
  private isListening = false;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error('Speech recognition not supported');
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
  }

  start(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject(new Error(event.error));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.isListening = true;
      this.recognition.start();
    });
  }

  stop() {
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}
```

## Example: Debate Room Component

```typescript
// src/pages/DebateRoomPage.tsx
import { useEffect, useState } from 'react';
import { useDebate } from '../hooks/useDebate';
import { SpeechRecognition } from '../utils/speechToText';
import { speakText } from '../utils/textToSpeech';

export const DebateRoomPage = () => {
  const { session, startDebate, submitResponse, endDebate } = useDebate();
  const [isRecording, setIsRecording] = useState(false);
  const [speechRecognition] = useState(() => new SpeechRecognition());

  // Start debate on mount
  useEffect(() => {
    startDebate(
      'Artificial Intelligence will replace most human jobs',
      'FOR',
      'AGAINST'
    );
  }, []);

  // Speak AI's opening statement
  useEffect(() => {
    if (session && session.messages.length > 0) {
      const lastMessage = session.messages[session.messages.length - 1];
      if (lastMessage.speaker === 'ai') {
        speakText(lastMessage.content);
      }
    }
  }, [session?.messages.length]);

  const handleStartRecording = async () => {
    setIsRecording(true);
    try {
      const transcript = await speechRecognition.start();
      const aiResponse = await submitResponse(transcript);
      await speakText(aiResponse.ai_message);
    } catch (error) {
      console.error('Recording error:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const handleEndDebate = async () => {
    await endDebate();
    // Navigate to evaluation page
  };

  return (
    <div>
      <h1>{session?.topic}</h1>

      <div>
        {session?.messages.map((msg, idx) => (
          <div key={idx} className={msg.speaker}>
            <strong>{msg.speaker === 'ai' ? 'AI' : 'You'}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleStartRecording}
        disabled={isRecording}
      >
        {isRecording ? 'Recording...' : 'Speak Your Response'}
      </button>

      <button onClick={handleEndDebate}>
        End Debate
      </button>
    </div>
  );
};
```

## Error Handling

```typescript
// src/utils/errorHandling.ts
export const handleApiError = (error: any): string => {
  if (error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
};
```

## CORS Configuration

Make sure your backend allows your frontend origin. Update `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Testing the Integration

1. Start backend: `python run.py`
2. Start frontend: `npm run dev`
3. Test authentication flow
4. Test debate creation and responses
5. Test speech-to-text and text-to-speech
6. Test evaluation generation

## Troubleshooting

### CORS Issues
- Check `allow_origins` in backend
- Ensure credentials are included in requests

### Token Issues
- Check token is stored in localStorage
- Verify token is included in Authorization header
- Check token hasn't expired

### Speech API Issues
- Ensure HTTPS (required for speech APIs)
- Check browser permissions
- Test with Chrome/Edge (best support)

## Production Considerations

1. Use HTTPS for all API calls
2. Implement proper error boundaries
3. Add loading states and skeletons
4. Handle network failures gracefully
5. Add request timeouts
6. Implement retry logic
7. Add analytics and monitoring
8. Cache appropriate data
9. Implement rate limiting feedback
10. Handle session expiry smoothly
