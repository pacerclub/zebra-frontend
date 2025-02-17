import { v4 as uuidv4 } from 'uuid';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const STORAGE_MODE = {
  LOCAL: 'local',
  CLOUD: 'cloud',
};

function isLocalStorageAvailable() {
  try {
    return typeof window !== 'undefined' && 
           window.localStorage !== undefined && 
           window.localStorage !== null;
  } catch (e) {
    return false;
  }
}

const DEVICE_ID = isLocalStorageAvailable() ? localStorage.getItem('device_id') || uuidv4() : uuidv4();
if (isLocalStorageAvailable()) {
  localStorage.setItem('device_id', DEVICE_ID);
}

class Storage {
  constructor() {
    this.token = null;
    this.email = null;
    this.lastSyncTime = null;
    this.mode = STORAGE_MODE.LOCAL;
    this.pendingChanges = {
      sessions: [],
      projects: [],
      deletedSessions: [],
      deletedProjects: [],
    };

    // Only access localStorage in browser
    if (isLocalStorageAvailable()) {
      this.token = localStorage.getItem('auth_token');
      this.email = localStorage.getItem('user_email');
      this.lastSyncTime = localStorage.getItem('last_sync_time');
      this.mode = localStorage.getItem('storage_mode') || STORAGE_MODE.LOCAL;
      
      const savedPendingChanges = localStorage.getItem('pending_changes');
      if (savedPendingChanges) {
        try {
          this.pendingChanges = JSON.parse(savedPendingChanges);
        } catch (e) {
          console.error('Failed to parse pending changes');
        }
      }
    }

    // Start sync if in cloud mode
    if (this.mode === STORAGE_MODE.CLOUD && this.token) {
      this.startSync();
    }
  }

  async setStorageMode(mode) {
    if (mode !== STORAGE_MODE.LOCAL && mode !== STORAGE_MODE.CLOUD) {
      throw new Error('Invalid storage mode');
    }

    this.mode = mode;
    
    if (isLocalStorageAvailable()) {
      localStorage.setItem('storage_mode', mode);
    }

    // If we have a token, update the server with the new storage mode
    if (this.token) {
      try {
        const response = await fetch(`${API_URL}/api/auth/preferences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
          body: JSON.stringify({
            storage_mode: mode,
            is_onboarded: true,
          }),
        });

        if (!response.ok) {
          console.error('Failed to update storage mode on server');
        }
      } catch (error) {
        console.error('Error updating storage mode:', error);
      }
    }

    if (mode === STORAGE_MODE.CLOUD && this.token) {
      await this.startSync();
    } else {
      await this.stopSync();
    }
  }

  async login(email, password) {
    console.log('Attempting login with:', { email, device_id: DEVICE_ID });
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password,
        device_id: DEVICE_ID 
      }),
    });

    const data = await response.json();
    console.log('Login response:', { status: response.status, data });

    if (!response.ok) {
      throw new Error(data.error || 'Failed to login');
    }

    this.token = data.token;
    this.email = email;
    this.mode = STORAGE_MODE.CLOUD;

    if (isLocalStorageAvailable()) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_email', email);
      localStorage.setItem('storage_mode', this.mode);
      localStorage.setItem('device_id', DEVICE_ID);
    }

    // Start sync immediately after login
    await this.startSync();

    return data;
  }

  async register(email, password) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password,
        device_id: DEVICE_ID 
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to register';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    this.token = data.token;
    this.email = email;

    if (isLocalStorageAvailable()) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_email', email);
      this.setStorageMode(STORAGE_MODE.CLOUD);
    }

    return data;
  }

  async logout() {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_email');
      localStorage.removeItem('last_sync_time');
      localStorage.removeItem('pending_changes');
      localStorage.setItem('storage_mode', STORAGE_MODE.LOCAL);
    }

    this.token = null;
    this.email = null;
    this.lastSyncTime = null;
    this.mode = STORAGE_MODE.LOCAL;
    this.pendingChanges = {
      sessions: [],
      projects: [],
      deletedSessions: [],
      deletedProjects: [],
    };

    // Stop sync process
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    return Promise.resolve();
  }

  // Sync methods
  async startSync() {
    if (!this.token || this.mode !== STORAGE_MODE.CLOUD) {
      console.log('Cannot start sync: no token or not in cloud mode');
      return;
    }

    console.log('Starting sync...');
    
    // First do an immediate sync
    try {
      await this.sync();
    } catch (error) {
      console.error('Initial sync failed:', error);
    }

    // Then set up periodic sync
    if (!this.syncInterval) {
      this.syncInterval = setInterval(async () => {
        try {
          await this.sync();
        } catch (error) {
          console.error('Periodic sync failed:', error);
        }
      }, 30000); // Sync every 30 seconds
    }
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async sync() {
    if (!this.token || this.mode !== STORAGE_MODE.CLOUD) {
      console.log('Skipping sync: no token or not in cloud mode');
      return;
    }

    console.log('Syncing with server...');

    try {
      // First, get server data
      const response = await fetch(`${API_URL}/api/sync?device_id=${DEVICE_ID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch server data');
      }

      const serverData = await response.json();
      console.log('Received server data:', serverData);

      // Then send local changes
      if (this.pendingChanges.sessions.length > 0 || 
          this.pendingChanges.projects.length > 0 ||
          this.pendingChanges.deletedSessions.length > 0 ||
          this.pendingChanges.deletedProjects.length > 0) {
        
        const syncResponse = await fetch(`${API_URL}/api/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
          body: JSON.stringify({
            device_id: DEVICE_ID,
            last_sync_time: this.lastSyncTime || new Date(0).toISOString(),
            sessions: this.pendingChanges.sessions,
            projects: this.pendingChanges.projects,
            deleted_sessions: this.pendingChanges.deletedSessions,
            deleted_projects: this.pendingChanges.deletedProjects,
          }),
        });

        if (!syncResponse.ok) {
          throw new Error('Failed to sync local changes');
        }

        // Clear pending changes after successful sync
        this.pendingChanges = {
          sessions: [],
          projects: [],
          deletedSessions: [],
          deletedProjects: [],
        };

        if (isLocalStorageAvailable()) {
          localStorage.setItem('pending_changes', JSON.stringify(this.pendingChanges));
        }
      }

      // Update last sync time
      this.lastSyncTime = new Date().toISOString();
      if (isLocalStorageAvailable()) {
        localStorage.setItem('last_sync_time', this.lastSyncTime);
      }

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  // Session methods
  async saveSession(session) {
    // Add to pending changes
    if (this.mode === STORAGE_MODE.CLOUD) {
      this.pendingChanges.sessions.push(session);
      if (isLocalStorageAvailable()) {
        localStorage.setItem('pending_changes', JSON.stringify(this.pendingChanges));
      }
      // Trigger immediate sync
      await this.sync();
    }

    // Save locally
    const sessions = this.getLocalSessions();
    sessions.push(session);
    if (isLocalStorageAvailable()) {
      localStorage.setItem('sessions', JSON.stringify(sessions));
    }

    return session;
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
          if (isLocalStorageAvailable()) {
            localStorage.setItem(`session_${session.id}`, JSON.stringify(session));
          }
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
    if (isLocalStorageAvailable()) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('session_')) {
          const session = JSON.parse(localStorage.getItem(key));
          sessions.push(session);
        }
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
        if (isLocalStorageAvailable()) {
          localStorage.setItem(`project_${savedProject.id}`, JSON.stringify(savedProject));
        }
        return savedProject;
      } catch (error) {
        // Store in pending changes if save fails
        this.pendingChanges.projects.push(projectWithId);
        if (isLocalStorageAvailable()) {
          localStorage.setItem('pending_changes', JSON.stringify(this.pendingChanges));
        }
        throw error;
      }
    } else {
      if (isLocalStorageAvailable()) {
        localStorage.setItem(`project_${projectWithId.id}`, JSON.stringify(projectWithId));
      }
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
          if (isLocalStorageAvailable()) {
            localStorage.setItem(`project_${project.id}`, JSON.stringify(project));
          }
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
    if (isLocalStorageAvailable()) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('project_')) {
          const project = JSON.parse(localStorage.getItem(key));
          projects.push(project);
        }
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

        if (isLocalStorageAvailable()) {
          localStorage.removeItem(`session_${sessionId}`);
        }
      } catch (error) {
        // Add to deleted sessions for sync
        this.pendingChanges.deletedSessions.push(sessionId);
        if (isLocalStorageAvailable()) {
          localStorage.setItem('pending_changes', JSON.stringify(this.pendingChanges));
        }
        throw error;
      }
    } else {
      if (isLocalStorageAvailable()) {
        localStorage.removeItem(`session_${sessionId}`);
      }
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

        if (isLocalStorageAvailable()) {
          localStorage.removeItem(`project_${projectId}`);
        }
      } catch (error) {
        // Add to deleted projects for sync
        this.pendingChanges.deletedProjects.push(projectId);
        if (isLocalStorageAvailable()) {
          localStorage.setItem('pending_changes', JSON.stringify(this.pendingChanges));
        }
        throw error;
      }
    } else {
      if (isLocalStorageAvailable()) {
        localStorage.removeItem(`project_${projectId}`);
      }
    }
  }
}

export const storage = new Storage();
export { STORAGE_MODE };
