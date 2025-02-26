const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  constructor() {
    this.token = null;
    if (typeof window !== 'undefined') {
      // Get token from localStorage and ensure it's valid
      const token = localStorage.getItem('zebra-token') || document.cookie.split('; ').find(row => row.startsWith('zebra-token='))?.split('=')[1];
      if (token) {
        this.token = token;
        // Ensure both localStorage and cookie are set
        localStorage.setItem('zebra-token', token);
        document.cookie = `zebra-token=${token}; path=/; secure; samesite=strict`;
      } else {
        localStorage.removeItem('zebra-token');
        document.cookie = 'zebra-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('zebra-token', token);
      // Also set cookie for cross-browser support
      document.cookie = `zebra-token=${token}; path=/; secure; samesite=strict`;
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zebra-token');
      // Also clear cookie
      document.cookie = 'zebra-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
  }

  async request(endpoint, options = {}, isBlob = false) {
    // Remove any leading slashes
    endpoint = endpoint.replace(/^\/+/, '');
    console.log(`Making API request to ${endpoint}`, options);
    const headers = {
      ...(options.body && !options.headers?.['Content-Type'] ? { 'Content-Type': 'application/json' } : {}),
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    try {
      const url = `${API_BASE_URL}/${endpoint}`;
      console.log(`Making request to: ${url}`);
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Unauthorized');
        }
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, body:`, errorText);
        throw new Error(`Request failed: ${response.statusText || response.status}`);
      }

      if (isBlob) {
        return await response.blob();
      }

      const text = await response.text();
      console.log(`Response from ${endpoint}:`, text);

      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error('Invalid JSON response from server');
      }

      if (!response.ok) {
        throw new Error(data?.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Error in request to ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth endpoints
  async register(email, password, name) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  // Work log endpoints
  async createWorkLog(title, description, tags = []) {
    return this.request('/logs', {
      method: 'POST',
      body: JSON.stringify({ title, description, tags }),
    });
  }

  async getWorkLogs() {
    return this.request('/logs');
  }

  async getWorkLog(id) {
    return this.request(`/logs/${id}`);
  }

  async updateWorkLog(id, updates) {
    return this.request(`/logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteWorkLog(id) {
    return this.request(`/logs/${id}`, {
      method: 'DELETE',
    });
  }

  // Project endpoints
  async createProject(name, description) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async getProjects() {
    return this.request('/projects');
  }

  async getProject(id) {
    try {
      const project = await this.request(`/projects/${id}`);
      if (!project) return null;

      // Transform the response to match frontend expectations
      const sessions = (project.sessions || []).map(session => ({
        ...session,
        startTime: session.start_time || session.startTime,
        endTime: session.end_time || session.endTime,
        duration: session.duration || (session.end_time && session.start_time ? 
          new Date(session.end_time) - new Date(session.start_time) : 0),
        records: (session.records || []).map(record => ({
          ...record,
          files: (record.files || []).map(file => ({
            ...file,
            id: file.id || file.url?.split('/').pop(),
            url: file.url || (file.id && file.id !== '00000000-0000-0000-0000-000000000000' ? `${API_BASE_URL}/files/${file.id}` : null),
            type: file.type || file.mime_type || 'unknown'
          })).filter(f => f.id && f.id !== '00000000-0000-0000-0000-000000000000'),
          audioUrl: record.audio_url || (record.id && record.id !== '00000000-0000-0000-0000-000000000000' ? `${API_BASE_URL}/audio/${record.id}` : null),
          timestamp: record.timestamp || record.created_at || new Date().toISOString()
        }))
      }));

      return {
        project: {
          ...project,
          sessions
        },
        sessions
      };
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  async getFile(fileId) {
    if (!fileId || fileId === '00000000-0000-0000-0000-000000000000') {
      console.error('Invalid file ID');
      return null;
    }
    try {
      return await this.request(`files/${fileId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream',
        },
      }, true);
    } catch (error) {
      console.error('Error fetching file:', error);
      return null;
    }
  }

  async getAudio(audioId) {
    if (!audioId || audioId === '00000000-0000-0000-0000-000000000000') {
      console.error('Invalid audio ID');
      return null;
    }
    try {
      // Remove any path prefix if present
      audioId = audioId.replace(/^\/audio\//, '').replace(/^audio\//, '');
      return await this.request(`audio/${audioId}`, {
        method: 'GET',
        headers: {
          'Accept': 'audio/*',
        },
      }, true);
    } catch (error) {
      console.error('Error fetching audio:', error);
      return null;
    }
  }

  async updateProject(id, updates) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
export default api;
