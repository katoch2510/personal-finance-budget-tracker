// API Client for Python FastAPI Backend

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

export interface User {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ForgotPasswordResponse {
  message: string;
  reset_token?: string;
}

export const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
};

async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (error: any) {
    if (error.name === 'TypeError' || error.message?.includes('fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to backend server.');
    }
    throw error;
  }
}


export const apiClient = {
  async register(full_name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await safeFetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Registration failed. Please try again.');
    }
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await safeFetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Login failed. Please check your credentials.');
    }
    return data;
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const res = await safeFetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Request failed. Please try again.');
    }
    return data;
  },

  async resetPassword(token: string, new_password: string): Promise<{ message: string }> {
    const res = await safeFetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Password reset failed.');
    }
    return data;
  },

  async getMe(): Promise<User> {
    const res = await safeFetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to fetch user session.');
    }
    return data;
  }
};

