import { useState, useRef, useEffect } from 'react';
import useStore from '@/lib/store';
import { Button } from './ui/button';
import { FileIcon, Image as ImageIcon, FileAudio, Play, Pause, ExternalLink } from 'lucide-react';

export default function RecordView({ record }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);
  const { getRecordFiles, getRecordAudio } = useStore();

  useEffect(() => {
    // Load files and audio when component mounts
    const files = getRecordFiles(record.id);
    const audioBlob = getRecordAudio(record.id);

    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      if (audioRef.current) {
        audioRef.current.src = url;
      }
    }

    // Cleanup URLs when component unmounts
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [record.id, getRecordFiles, getRecordAudio]);

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (file.type.startsWith('audio/')) return <FileAudio className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const files = getRecordFiles(record.id);

  return (
    <div className="border-l-2 border-gray-200 pl-4 ml-2">
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

      {files?.length > 0 && (
        <div className="space-y-2 mb-2">
          <p className="text-sm font-medium">Attachments:</p>
          <div className="grid gap-2">
            {files.map((file, fileIndex) => (
              <div
                key={fileIndex}
                className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded"
              >
                {getFileIcon(file)}
                <div className="flex-1">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-gray-500 text-xs">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                {file.type.startsWith('image/') && file.previewUrl && (
                  <img 
                    src={file.previewUrl} 
                    alt={file.name}
                    className="h-10 w-10 object-cover rounded"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {audioUrl && (
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAudioPlayback}
            className="flex items-center gap-1"
          >
            {isPlaying ? (
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
          <audio 
            ref={audioRef} 
            onEnded={handleAudioEnded} 
            src={audioUrl}
            className="hidden" 
          />
          <span className="text-sm text-gray-500">
            {isPlaying ? 'Playing...' : 'Audio recording'}
          </span>
        </div>
      )}

      <div className="text-xs text-gray-400 mt-1">
        {new Date(record.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
