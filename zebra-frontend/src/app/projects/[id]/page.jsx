'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import useStore from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileIcon, Image as ImageIcon, FileAudio, Play, Pause, ExternalLink, Download } from 'lucide-react';
import ImagePreviewModal from '@/components/ImagePreviewModal';
import TimeHeatmap from '@/components/TimeHeatmap';

export default function ProjectPage() {
  const params = useParams();
  const { getProjectById, getSessionsByProjectId } = useStore();
  const [project, setProject] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [playingRecordId, setPlayingRecordId] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const projectData = getProjectById(params.id);
    const sessionData = getSessionsByProjectId(params.id);
    setProject(projectData);
    setSessions(sessionData);
  }, [params.id, getProjectById, getSessionsByProjectId]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePlayAudio = (recordId, audioData) => {
    // Stop current audio if playing
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
      if (playingRecordId === recordId) {
        setPlayingRecordId(null);
        setAudioElement(null);
        return;
      }
    }

    // Create and play new audio
    const audio = new Audio(audioData);
    audio.play();
    setAudioElement(audio);
    setPlayingRecordId(recordId);

    // Reset when done playing
    audio.onended = () => {
      setPlayingRecordId(null);
      setAudioElement(null);
    };
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.previewUrl || file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <ImagePreviewModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageData={selectedImage?.previewUrl}
        fileName={selectedImage?.name}
      />

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

        <Card className="mb-8">
          <CardContent className="pt-6">
            <TimeHeatmap sessions={sessions} />
          </CardContent>
        </Card>

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
                        key={record.id || index}
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
                            className="flex items-center gap-2 text-blue-500 hover:underline mb-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Commit
                          </a>
                        )}

                        {record.files?.length > 0 && (
                          <div className="space-y-2 mb-2">
                            <p className="text-sm font-medium text-gray-600">Attachments:</p>
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                              {record.files.map((file, fileIndex) => (
                                <div
                                  key={fileIndex}
                                  className="group relative flex flex-col gap-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
                                >
                                  {file.type.startsWith('image/') ? (
                                    <div 
                                      className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-gray-50"
                                      onClick={() => setSelectedImage(file)}
                                    >
                                      <img 
                                        src={file.previewUrl}
                                        alt={file.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                                          <Button variant="secondary" size="sm" className="shadow-lg">
                                            View Full Size
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="aspect-[4/3] flex items-center justify-center bg-gray-50 p-4">
                                      {file.type.startsWith('audio/') ? (
                                        <FileAudio className="h-12 w-12 text-gray-400" />
                                      ) : (
                                        <FileIcon className="h-12 w-12 text-gray-400" />
                                      )}
                                    </div>
                                  )}
                                  
                                  <div className="p-3 flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm text-gray-900 truncate">
                                        {file.name}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {formatFileSize(file.size)}
                                      </p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDownload(file)}
                                      className="shrink-0 text-gray-500 hover:text-gray-900"
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {record.hasAudio && record.audioData && (
                          <div className="flex items-center gap-2 mb-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePlayAudio(record.id, record.audioData)}
                              className="flex items-center gap-1"
                            >
                              {playingRecordId === record.id ? (
                                <>
                                  <Pause className="h-4 w-4" />
                                  <span>Pause</span>
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4" />
                                  <span>Play</span>
                                </>
                              )}
                            </Button>
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
    </>
  );
}
