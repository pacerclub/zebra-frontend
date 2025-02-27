const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  constructor() {
    this.token = null;
    if (typeof window !== 'undefined') {
      // Try to get token from localStorage first, then from cookie as fallback
      let token = localStorage.getItem('zebra-token');
      if (!token) {
        // Try to get from cookie
        const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('zebra-token='));
        if (tokenCookie) {
          token = tokenCookie.split('=')[1];
        }
      }
      
      if (token) {
        this.token = token;
        // Ensure both localStorage and cookie are set
        localStorage.setItem('zebra-token', token);
        document.cookie = `zebra-token=${token}; path=/; max-age=31536000`;
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
      // Set cookie with more compatible settings
      document.cookie = `zebra-token=${token}; path=/; max-age=31536000`;
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zebra-token');
      // Clear cookie
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
      
      // Add error handling for network issues
      try {
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
          try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || `Request failed with status ${response.status}`);
          } catch (e) {
            throw new Error(`Request failed with status ${response.status}: ${errorText.substring(0, 100)}`);
          }
        }

        if (isBlob) {
          return await response.blob();
        }

        // Check if response is empty
        const text = await response.text();
        if (!text) {
          return null;
        }

        try {
          return JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse JSON response:', e);
          return text;
        }
      } catch (networkError) {
        console.error('Network error:', networkError);
        // Check if the server is running
        throw new Error(`Network error: ${networkError.message}. Please check if the server is running.`);
      }
    } catch (error) {
      console.error(`API request error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth endpoints
  async register(email, password, name) {
    const data = await this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    console.log('Attempting login with:', { email });
    const data = await this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    console.log('Login response:', data);
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
      const sessions = (project.sessions || []).map(session => {
        // Parse dates with timezone handling
        const startTime = new Date(session.start_time || session.startTime);
        const endTime = new Date(session.end_time || session.endTime);
        
        // Use the duration directly from the server if available
        let duration = session.duration;
        
        // If no duration is provided, calculate it in seconds
        if (!duration && startTime && endTime && startTime.getTime() > 0 && endTime.getTime() > 0) {
          duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
        }
        
        return {
          ...session,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration: duration || 0,
          records: (session.records || [])
            .filter(record => record.id && record.id !== '00000000-0000-0000-0000-000000000000')
            .map(record => ({
              ...record,
              files: (record.files || [])
                .filter(file => file.id && file.id !== '00000000-0000-0000-0000-000000000000')
                .map(file => ({
                  ...file,
                  id: file.id,
                  url: file.url || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/files/${file.id}`,
                  type: file.type || file.mime_type || 'unknown'
                })),
              audioUrl: record.audio_url || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/audio/${record.id}`,
              timestamp: record.timestamp || record.created_at || new Date().toISOString()
            }))
        };
      });

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
      // Clean the ID to ensure it's just the UUID
      const cleanId = fileId.toString().replace(/^\/files\//, '').replace(/^files\//, '');
      console.log(`Fetching file with ID: ${cleanId}`);
      
      // Direct fetch approach - using the new route
      const url = `${API_BASE_URL.replace('/api/v1', '')}/files/${cleanId}`;
      console.log(`Making direct request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {})
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch file: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log(`Successfully fetched file, size: ${blob.size} bytes`);
      return blob;
    } catch (error) {
      console.error('Error fetching file:', error);
      throw error;
    }
  }

  async getAudio(recordId) {
    if (!recordId || recordId === '00000000-0000-0000-0000-000000000000') {
      console.error('Invalid record ID');
      return null;
    }
    
    try {
      // Clean the ID to ensure it's just the UUID
      const cleanId = recordId.toString().replace(/^\/audio\//, '').replace(/^audio\//, '');
      console.log(`Fetching audio for record ID: ${cleanId}`);
      
      // Direct fetch approach - using the new route
      const url = `${API_BASE_URL.replace('/api/v1', '')}/audio/${cleanId}`;
      console.log(`Making direct request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'audio/*',
          ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {})
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch audio: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log(`Successfully fetched audio, size: ${blob.size} bytes`);
      return blob;
    } catch (error) {
      console.error('Error fetching audio:', error);
      throw error;
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
