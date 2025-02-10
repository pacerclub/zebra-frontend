'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import useStore from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProjectPage() {
  const params = useParams();
  const { getProjectById, getSessionsByProjectId } = useStore();
  const [project, setProject] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const projectData = getProjectById(params.id);
    const sessionData = getSessionsByProjectId(params.id);
    setProject(projectData);
    setSessions(sessionData);
  }, [params.id, getProjectById, getSessionsByProjectId]);

  if (!project) {
    return <div>Project not found</div>;
  }

  const totalTime = sessions.reduce((acc, session) => {
    return acc + (session.duration || 0);
  }, 0);

  const formatDuration = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const hours = Math.floor(ms / 1000 / 60 / 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{project.name}</h1>

      <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono">{formatDuration(totalTime)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">{sessions.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {sessions.length > 0
                ? new Date(
                    Math.max(...sessions.map((s) => s.startTime))
                  ).toLocaleDateString()
                : 'Never'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Sessions</h2>
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-lg font-medium">
                    {new Date(session.startTime).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Duration: {formatDuration(session.duration)}
                  </p>
                </div>
              </div>

              {session.records?.length > 0 && (
                <div className="space-y-4">
                  {session.records.map((record, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 ml-2"
                    >
                      {record.text && (
                        <p className="text-gray-600 mb-2">{record.text}</p>
                      )}
                      {record.gitLink && (
                        <a
                          href={record.gitLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline block mb-2"
                        >
                          View Commit →
                        </a>
                      )}
                      {record.files?.length > 0 && (
                        <div className="text-sm text-gray-500">
                          {record.files.length} attachment(s)
                        </div>
                      )}
                      {record.hasAudio && (
                        <div className="text-sm text-gray-500">
                          Has audio recording
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(record.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
