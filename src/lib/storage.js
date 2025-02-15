import { v4 as uuidv4 } from 'uuid';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const STORAGE_MODE = {
  LOCAL: 'local',
  CLOUD: 'cloud',
};

const DEVICE_ID = typeof window !== 'undefined' ? localStorage.getItem('device_id') || uuidv4() : uuidv4();
if (typeof window !== 'undefined') {
  localStorage.setItem('device_id', DEVICE_ID);
}

class Storage {
  constructor() {
    this.mode = STORAGE_MODE.LOCAL;
    this.token = null;
    this.email = null;
    this.syncInterval = null;
    this.lastSyncTime = null;
    this.pendingChanges = {
      sessions: [],
      projects: [],
      deletedSessions: [],
      deletedProjects: [],
    };

    // Load saved mode and token
    if (typeof window !== 'undefined') {
      this.mode = localStorage.getItem('storage_mode') || STORAGE_MODE.LOCAL;
      this.token = localStorage.getItem('auth_token');
      this.email = localStorage.getItem('user_email');
      this.lastSyncTime = localStorage.getItem('last_sync_time');

      // Load pending changes
      const pendingChanges = localStorage.getItem('pending_changes');
      if (pendingChanges) {
        this.pendingChanges = JSON.parse(pendingChanges);
      }

      // Start sync if in cloud mode
      if (this.mode === STORAGE_MODE.CLOUD && this.token) {
        this.startSync();
      }
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errorMessage = 'Login failed. Please check your credentials.';
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data || !data.token) {
      throw new Error('Invalid response from server');
    }

    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user_email', email);
    this.token = data.token;
    this.mode = STORAGE_MODE.CLOUD;
    return data;
  }

  async register(email, password) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errorMessage = 'Registration failed. Please try again.';
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data || !data.token) {
      throw new Error('Invalid response from server');
    }

    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user_email', email);
    this.token = data.token;
    this.mode = STORAGE_MODE.CLOUD;
    return data;
  }

  logout() {
    // Clear authentication data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('last_sync_time');
    
    // Clear pending changes
    this.pendingChanges = {
      sessions: [],
      projects: [],
      deletedSessions: [],
      deletedProjects: [],
    };
    localStorage.removeItem('pending_changes');

    // Reset instance variables
    this.token = null;
    this.email = null;
    this.lastSyncTime = null;
    this.mode = STORAGE_MODE.LOCAL;
    localStorage.setItem('storage_mode', STORAGE_MODE.LOCAL);

    // Stop sync process
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Sync methods
  startSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncInterval = setInterval(() => this.sync(), 30000); // Sync every 30 seconds
    this.sync(); // Initial sync
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async sync() {
    if (this.mode !== STORAGE_MODE.CLOUD || !this.token) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          device_id: DEVICE_ID,
          last_sync_time: this.lastSyncTime,
          local_sessions: this.pendingChanges.sessions,
          local_projects: this.pendingChanges.projects,
          deleted_sessions: this.pendingChanges.deletedSessions,
          deleted_projects: this.pendingChanges.deletedProjects,
        }),
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const data = await response.json();

      // Update local storage with server data
      if (data.server_sessions) {
        data.server_sessions.forEach(session => {
          localStorage.setItem(`session_${session.id}`, JSON.stringify(session));
        });
      }

      if (data.server_projects) {
        data.server_projects.forEach(project => {
          localStorage.setItem(`project_${project.id}`, JSON.stringify(project));
        });
      }

      // Clear pending changes after successful sync
      this.pendingChanges = {
        sessions: [],
        projects: [],
        deletedSessions: [],
        deletedProjects: [],
      };
      localStorage.setItem('pending_changes', JSON.stringify(this.pendingChanges));

      // Update last sync time
      this.lastSyncTime = data.last_sync_time;
      localStorage.setItem('last_sync_time', this.lastSyncTime);
    } catch (error) {
      console.error('Sync failed:', error);
      // Keep pending changes for next sync attempt
    }
  }

  // Session methods
  async saveSession(session) {
    const sessionWithId = {
      ...session,
      id: session.id || uuidv4(),
      device_id: DEVICE_ID,
    };

    if (this.mode === STORAGE_MODE.CLOUD) {
      try {
        const response = await fetch(`${API_URL}/api/sessions`, {
          method: session.id ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
          body: JSON.stringify(sessionWithId),
        });

        if (!response.ok) {
          throw new Error('Failed to save session');
        }

        const savedSession = await response.json();
        localStorage.setItem(`session_${savedSession.id}`, JSON.stringify(savedSession));
        return savedSession;
      } catch (error) {
        // Store in pending changes if save fails
        this.pendingChanges.sessions.push(sessionWithId);
        localStorage.setItem('pending_changes', JSON.stringify(this.pendingChanges));
        throw error;
      }
    } else {
      localStorage.setItem(`session_${sessionWithId.id}`, JSON.stringify(sessionWithId));
      return sessionWithId;
    }
  }

  async getSessions() {
    if (this.mode === STORAGE_MODE.CLOUD) {
      try {
        const response = await fetch(`${API_URL}/api/sessions`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }

        const sessions = await response.json();
        sessions.forEach(session => {
          localStorage.setItem(`session_${session.id}`, JSON.stringify(session));
        });
        return sessions;
      } catch (error) {
        // Fall back to local sessions if fetch fails
        return this.getLocalSessions();
      }
    } else {
      return this.getLocalSessions();
    }
  }

  getLocalSessions() {
    const sessions = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('session_')) {
        const session = JSON.parse(localStorage.getItem(key));
        sessions.push(session);
      }
    }
    return sessions;
  }

  // Project methods
  async saveProject(project) {
    const projectWithId = {
      ...project,
      id: project.id || uuidv4(),
      device_id: DEVICE_ID,
    };

    if (this.mode === STORAGE_MODE.CLOUD) {
      try {
        const response = await fetch(`${API_URL}/api/projects`, {
          method: project.id ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
          body: JSON.stringify(projectWithId),
        });

        if (!response.ok) {
          throw new Error('Failed to save project');
        }

        const savedProject = await response.json();
        localStorage.setItem(`project_${savedProject.id}`, JSON.stringify(savedProject));
        return savedProject;
      } catch (error) {
        // Store in pending changes if save fails
        this.pendingChanges.projects.push(projectWithId);
        localStorage.setItem('pending_changes', JSON.stringify(this.pendingChanges));
        throw error;
      }
    } else {
      localStorage.setItem(`project_${projectWithId.id}`, JSON.stringify(projectWithId));
      return projectWithId;
    }
  }

  async getProjects() {
    if (this.mode === STORAGE_MODE.CLOUD) {
      try {
        const response = await fetch(`${API_URL}/api/projects`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const projects = await response.json();
        projects.forEach(project => {
          localStorage.setItem(`project_${project.id}`, JSON.stringify(project));
        });
        return projects;
      } catch (error) {
        // Fall back to local projects if fetch fails
        return this.getLocalProjects();
      }
    } else {
      return this.getLocalProjects();
    }
  }

  getLocalProjects() {
    const projects = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('project_')) {
        const project = JSON.parse(localStorage.getItem(key));
        projects.push(project);
      }
    }
    return projects;
  }

  // Delete methods with sync support
  async deleteSession(sessionId) {
    if (this.mode === STORAGE_MODE.CLOUD) {
      try {
        const response = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete session');
        }

        localStorage.removeItem(`session_${sessionId}`);
      } catch (error) {
        // Add to deleted sessions for sync
        this.pendingChanges.deletedSessions.push(sessionId);
        localStorage.setItem('pending_changes', JSON.stringify(this.pendingChanges));
        throw error;
      }
    } else {
      localStorage.removeItem(`session_${sessionId}`);
    }
  }

  async deleteProject(projectId) {
    if (this.mode === STORAGE_MODE.CLOUD) {
      try {
        const response = await fetch(`${API_URL}/api/projects/${projectId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete project');
        }

        localStorage.removeItem(`project_${projectId}`);
      } catch (error) {
        // Add to deleted projects for sync
        this.pendingChanges.deletedProjects.push(projectId);
        localStorage.setItem('pending_changes', JSON.stringify(this.pendingChanges));
        throw error;
      }
    } else {
      localStorage.removeItem(`project_${projectId}`);
    }
  }
}

export const storage = new Storage();
