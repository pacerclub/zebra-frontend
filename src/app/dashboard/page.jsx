'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useStore from '@/lib/store';
import TimeHeatmap from '@/components/TimeHeatmap';
import { format, subDays } from 'date-fns';

export default function DashboardPage() {
  const store = useStore();
  const [stats, setStats] = useState({
    totalTime: 0,
    totalSessions: 0,
    avgSessionTime: 0,
    activeProjects: 0,
  });

  useEffect(() => {
    // Get all projects from the store's projects array
    const projects = store.projects;
    
    // Gather all sessions
    const sessions = projects.flatMap(project => 
      store.getSessionsByProjectId(project.id)
    );

    // Calculate stats
    const totalTime = sessions.reduce((acc, session) => acc + (session.duration || 0), 0);
    const totalSessions = sessions.length;
    const avgSessionTime = totalSessions > 0 ? totalTime / totalSessions : 0;
    const activeProjects = new Set(sessions.map(s => s.projectId)).size;

    setStats({
      totalTime,
      totalSessions,
      avgSessionTime,
      activeProjects,
    });
  }, [store]);

  const formatDuration = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const hours = Math.floor(ms / 1000 / 60 / 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono">{formatDuration(stats.totalTime)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">{stats.totalSessions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Session Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono">{formatDuration(stats.avgSessionTime)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">{stats.activeProjects}</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Heatmap */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <TimeHeatmap 
            sessions={store.projects.flatMap(project => 
              store.getSessionsByProjectId(project.id)
            )} 
          />
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <h2 className="text-2xl font-semibold mb-4">Recent Projects</h2>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {store.projects
          .sort((a, b) => {
            const aLastSession = Math.max(...(store.getSessionsByProjectId(a.id).map(s => s.startTime) || [0]));
            const bLastSession = Math.max(...(store.getSessionsByProjectId(b.id).map(s => s.startTime) || [0]));
            return bLastSession - aLastSession;
          })
          .slice(0, 6)
          .map(project => {
            const projectSessions = store.getSessionsByProjectId(project.id);
            const totalTime = projectSessions.reduce((acc, session) => acc + (session.duration || 0), 0);
            const lastActive = Math.max(...projectSessions.map(s => s.startTime));

            return (
              <Card key={project.id}>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2">
                    <a href={`/projects/${project.id}`} className="hover:text-blue-600">
                      {project.name}
                    </a>
                  </h3>
                  <div className="space-y-1 text-sm text-gray-500">
                    <p>Total Time: {formatDuration(totalTime)}</p>
                    <p>Sessions: {projectSessions.length}</p>
                    <p>Last Active: {format(lastActive, 'MMM d, yyyy')}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
