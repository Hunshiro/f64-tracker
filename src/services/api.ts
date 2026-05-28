import { io, Socket } from 'socket.io-client';
import { MockAttempt, UserStats, UserProfile, LeaderboardUser, WeakTopicStat } from '../types';

let socket: Socket | null = null;

// Initialize Socket connection
export function initSocket(onUpdate: (type: string, data: any) => void) {
  if (socket) return socket;
  
  socket = io(window.location.origin, {
    transports: ['websocket', 'polling']
  });

  socket.on('connect_error', (err) => {
    console.debug('Real-time WebSocket engine offline (using fallback HTTP pooling and sync):', err.message);
  });

  socket.on('realtimeUpdate', (payload: { type: string; data: any }) => {
    onUpdate(payload.type, payload.data);
  });

  socket.on('announcement', (payload: { message: string }) => {
    onUpdate('announcement', payload);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Token operations
export function setToken(token: string) {
  localStorage.setItem('f64_token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('f64_token');
}

export function clearToken() {
  localStorage.removeItem('f64_token');
}

// HTTP request wrappers
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options.headers || {}),
  } as HeadersInit;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMsg = 'Network request failed';
    try {
      const data = await res.json();
      errMsg = data.error || errMsg;
    } catch (_) {}
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth & Profile
  login: async (credentials: any) => {
    const data = await request<{ token: string; user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setToken(data.token);
    return data;
  },

  register: async (form: any) => {
    const data = await request<{ token: string; user: UserProfile }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    setToken(data.token);
    return data;
  },

  uploadImage: async (image: string) => {
    return request<{ url: string; info?: string }>('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ image }),
    });
  },

  getProfile: async () => {
    return request<{ user: UserProfile; stats: UserStats }>('/api/auth/me');
  },

  updateProfile: async (profileUpdates: Partial<UserProfile>) => {
    return request<{ user: UserProfile }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileUpdates),
    });
  },

  updatePassword: async (passwords: any) => {
    return request<{ success: boolean; message: string }>('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwords),
    });
  },

  // Mocks
  getMocks: async () => {
    return request<MockAttempt[]>('/api/mocks');
  },

  addMock: async (attempt: Omit<MockAttempt, 'id' | 'userId' | 'submittedAt' | 'insights'>) => {
    return request<MockAttempt>('/api/mocks', {
      method: 'POST',
      body: JSON.stringify(attempt),
    });
  },

  deleteMock: async (id: string) => {
    return request<{ success: boolean; message: string }>(`/api/mocks/${id}`, {
      method: 'DELETE',
    });
  },

  // Analytics & Insights
  getLeaderboard: async () => {
    return request<LeaderboardUser[]>('/api/leaderboard');
  },

  getWeakTopics: async () => {
    return request<WeakTopicStat[]>('/api/weak-topics');
  },

  getAIInsights: async () => {
    return request<{ insights: string[]; recommendations: { title: string; suggestion: string }[] }>('/api/insights/ai', {
      method: 'POST',
    });
  }
};
