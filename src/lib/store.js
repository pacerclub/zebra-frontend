import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Timer state
      isRunning: false,
      startTime: null,
      currentSession: null,
      lastElapsedTime: 0, // Store the elapsed time when paused

      // Projects state
      projects: [],
      sessions: [],
      records: [],
      
      // Files and audio state
      files: {}, // { recordId: { files: [], audioBlob: Blob } }

      // Timer actions
      startTimer: () => {
        const currentProject = get().getCurrentProject();
        if (!currentProject) return;

        const now = Date.now();
        const session = {
          id: Math.random().toString(36).substr(2, 9),
          projectId: currentProject.id,
          startTime: now,
          duration: 0,
          records: [],
        };

        set({
          isRunning: true,
          startTime: now,
          currentSession: session,
          lastElapsedTime: 0,
        });
      },

      stopTimer: () => {
        const { currentSession, startTime, lastElapsedTime } = get();
        if (!currentSession || !startTime) return;

        const duration = lastElapsedTime + (Date.now() - startTime);
        const updatedSession = {
          ...currentSession,
          duration,
        };

        set((state) => ({
          isRunning: false,
          lastElapsedTime: duration,
          startTime: null,
          currentSession: null,
          sessions: [...state.sessions, updatedSession],
        }));
      },

      // Project actions
      addProject: (name) => {
        const project = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          createdAt: Date.now(),
        };

        set((state) => ({
          projects: [...state.projects, project],
          currentProject: project,
        }));

        return project;
      },

      setCurrentProject: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (project) {
          set({ currentProject: project });
        }
      },

      getCurrentProject: () => {
        const { currentProject, projects } = get();
        if (currentProject) return currentProject;
        if (projects.length > 0) {
          const lastProject = projects[projects.length - 1];
          set({ currentProject: lastProject });
          return lastProject;
        }
        return null;
      },

      getProjectById: (id) => {
        return get().projects.find((p) => p.id === id);
      },

      // Session actions
      getSessionsByProjectId: (projectId) => {
        return get()
          .sessions.filter((s) => s.projectId === projectId)
          .sort((a, b) => b.startTime - a.startTime);
      },

      // Record actions
      addRecord: (record) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const newRecord = {
          ...record,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
        };

        // Store files and audio in the files object
        if ((record.files?.length > 0 || record.audioBlob) && newRecord.id) {
          set((state) => ({
            files: {
              ...state.files,
              [newRecord.id]: {
                files: record.files || [],
                audioBlob: record.audioBlob,
              },
            },
          }));
        }

        set((state) => ({
          currentSession: {
            ...state.currentSession,
            records: [...(state.currentSession.records || []), newRecord],
          },
        }));
      },

      // File and audio actions
      getRecordFiles: (recordId) => {
        return get().files[recordId]?.files || [];
      },

      getRecordAudio: (recordId) => {
        return get().files[recordId]?.audioBlob || null;
      },
    }),
    {
      name: 'zebra-store',
      version: 1,
      partialize: (state) => ({
        projects: state.projects,
        sessions: state.sessions,
        currentProject: state.currentProject,
        files: state.files,
        isRunning: state.isRunning,
        startTime: state.startTime,
        currentSession: state.currentSession,
        lastElapsedTime: state.lastElapsedTime,
      }),
    }
  )
);

export default useStore;
