const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

export interface DataSource {
  id: number;
  name: string;
  api_url: string;
  is_active: boolean;
  last_synced?: string;
  created_at: string;
  updated_at: string;
}

export interface QueryResponse {
  answer: string;
  sources: string[];
  num_contexts: number;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async googleAuth(token: string): Promise<{ user: User; message: string }> {
    return this.request('/api/auth/google/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request('/api/auth/logout/', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request('/api/auth/me/');
  }

  async getDataSources(): Promise<DataSource[]> {
    return this.request('/api/datasources/');
  }

  async createDataSource(data: {
    name: string;
    api_url: string;
    api_key?: string;
  }): Promise<DataSource> {
    return this.request('/api/datasources/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDataSource(
    id: number,
    data: Partial<DataSource>
  ): Promise<DataSource> {
    return this.request(`/api/datasources/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDataSource(id: number): Promise<void> {
    return this.request(`/api/datasources/${id}/`, {
      method: 'DELETE',
    });
  }

  async syncDataSource(id: number): Promise<{ message: string; indexed_count: number }> {
    return this.request(`/api/datasources/${id}/sync/`, {
      method: 'POST',
    });
  }

  async query(
    datasource_id: number,
    question: string,
    top_k: number = 5
  ): Promise<QueryResponse> {
    return this.request('/api/rag/query/', {
      method: 'POST',
      body: JSON.stringify({ datasource_id, question, top_k }),
    });
  }
}

export const api = new ApiClient();
