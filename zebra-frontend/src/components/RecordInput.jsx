import { useState, useRef, useEffect } from 'react';
import useStore from '@/lib/store';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { X, Play, Pause, FileIcon, Image as ImageIcon, FileAudio } from 'lucide-react';

export default function RecordInput() {
  const [text, setText] = useState('');
  const [gitLink, setGitLink] = useState('');
  const [files, setFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);
  const addRecord = useStore(state => state.addRecord);
  const isRunning = useStore(state => state.isRunning);

  useEffect(() => {
    // Cleanup URLs when component unmounts
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      files.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [audioUrl, files]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    
    // Process each file
    Promise.all(
      newFiles.map(file => 
        new Promise((resolve) => {
          if (file.type.startsWith('image/')) {
            // Convert image to base64
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                file,
                id: Math.random().toString(36).substr(2, 9),
                previewUrl: reader.result // base64 data
              });
            };
            reader.readAsDataURL(file);
          } else {
            // Non-image files don't need preview
            resolve({
              file,
              id: Math.random().toString(36).substr(2, 9),
              previewUrl: null
            });
          }
        })
      )
    ).then(processedFiles => {
      setFiles(prev => [...prev, ...processedFiles]);
    });
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/mp3' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        if (audioRef.current) {
          audioRef.current.src = url;
        }
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecorder(mediaRecorder);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      setIsRecording(false);
      setRecorder(null);
    }
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

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const getFileIcon = (file) => {
    if (file.file.type.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
    if (file.file.type.startsWith('audio/')) return <FileAudio className="h-5 w-5" />;
    return <FileIcon className="h-5 w-5" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = () => {
    if (!isRunning) return;

    // Create a new record ID
    const recordId = Math.random().toString(36).substr(2, 9);

    // Convert audio blob to base64 if exists
    if (audioBlob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Add the record with files and base64 audio
        addRecord({
          id: recordId,
          type: 'mixed',
          text,
          gitLink: gitLink || null,
          files: files.map(f => ({
            name: f.file.name,
            type: f.file.type,
            size: f.file.size,
            previewUrl: f.previewUrl // base64 for images
          })),
          hasAudio: true,
          audioData: reader.result // base64 audio data
        });

        // Reset form
        setText('');
        setGitLink('');
        setFiles([]);
        setAudioBlob(null);
        setAudioUrl(null);
        if (audioRef.current) {
          audioRef.current.src = '';
        }
      };
      reader.readAsDataURL(audioBlob);
    } else {
      // Add record without audio
      addRecord({
        id: recordId,
        type: 'mixed',
        text,
        gitLink: gitLink || null,
        files: files.map(f => ({
          name: f.file.name,
          type: f.file.type,
          size: f.file.size,
          previewUrl: f.previewUrl // base64 for images
        })),
        hasAudio: false
      });

      // Reset form
      setText('');
      setGitLink('');
      setFiles([]);
    }
  };

  if (!isRunning) {
    return <div className="text-center text-gray-500">Start the timer to add records</div>;
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What are you working on?"
        className="min-h-[100px]"
      />

      <Input
        type="text"
        placeholder="Git commit link (optional)"
        value={gitLink}
        onChange={(e) => setGitLink(e.target.value)}
      />

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="file"
            multiple
            onChange={handleFileChange}
            className="max-w-[200px]"
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
          />
          
          <Button
            type="button"
            variant={isRecording ? "destructive" : "secondary"}
            onClick={() => isRecording ? stopRecording() : startRecording()}
          >
            {isRecording ? 'Stop Recording' : 'Record Audio'}
          </Button>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-medium mb-2">Attachments</h3>
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-2 flex-1">
                  {getFileIcon(file)}
                  <div>
                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.file.size)}</p>
                  </div>
                </div>
                {file.previewUrl && (
                  <img 
                    src={file.previewUrl} 
                    alt="Preview"
                    className="h-10 w-10 object-cover rounded mr-2"
                  />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Audio Preview */}
        {audioUrl && (
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Audio Recording</h3>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAudioPlayback}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <audio 
                ref={audioRef} 
                onEnded={handleAudioEnded} 
                src={audioUrl}
                className="hidden" 
              />
              <span className="text-sm text-gray-500">
                {isPlaying ? 'Playing...' : 'Click to play'}
              </span>
            </div>
          </div>
        )}
      </div>

      <Button 
        onClick={handleSubmit}
        disabled={!text && !gitLink && files.length === 0 && !audioBlob}
      >
        Add Record
      </Button>
    </div>
  );
}
