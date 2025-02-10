import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Timer state
      isRunning: false,
      startTime: null,
      elapsedTime: 0,
      currentSessionId: null,

      // Projects state
      projects: [],
      currentProjectId: null,

      // Sessions state
      sessions: [],

      // Timer actions
      startTimer: () => {
        const now = Date.now();
        const sessionId = `session_${now}`;
        set({
          isRunning: true,
          startTime: now,
          currentSessionId: sessionId,
          sessions: [...get().sessions, {
            id: sessionId,
            projectId: get().currentProjectId,
            startTime: now,
            records: [],
          }],
        });
      },

      stopTimer: () => {
        const { currentSessionId, sessions, startTime } = get();
        const now = Date.now();
        set({
          isRunning: false,
          elapsedTime: 0,
          startTime: null,
          sessions: sessions.map(session =>
            session.id === currentSessionId
              ? { ...session, endTime: now, duration: now - startTime }
              : session
          ),
          currentSessionId: null,
        });
      },

      // Project actions
      addProject: (name) => {
        const id = `project_${Date.now()}`;
        set(state => ({
          projects: [...state.projects, { id, name, createdAt: Date.now() }],
          currentProjectId: id,
        }));
        return id;
      },

      setCurrentProject: (projectId) => {
        set({ currentProjectId: projectId });
      },

      // Session actions
      addRecord: (record) => {
        const { currentSessionId, sessions } = get();
        if (!currentSessionId) return;

        set({
          sessions: sessions.map(session =>
            session.id === currentSessionId
              ? { ...session, records: [...session.records, { ...record, timestamp: Date.now() }] }
              : session
          ),
        });
      },

      // Utility functions
      getProjectById: (projectId) => {
        return get().projects.find(p => p.id === projectId);
      },

      getSessionsByProjectId: (projectId) => {
        return get().sessions.filter(s => s.projectId === projectId);
      },

      getCurrentSession: () => {
        return get().sessions.find(s => s.id === get().currentSessionId);
      },
    }),
    {
      name: 'zebra-storage',
    }
  )
);

export default useStore;
