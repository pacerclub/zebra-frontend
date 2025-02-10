import { useState } from 'react';
import useStore from '@/lib/store';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';

export default function RecordInput() {
  const [text, setText] = useState('');
  const [gitLink, setGitLink] = useState('');
  const [files, setFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const addRecord = useStore(state => state.addRecord);
  const isRunning = useStore(state => state.isRunning);

  const handleFileChange = (e) => {
    const fileList = Array.from(e.target.files);
    setFiles(prev => [...prev, ...fileList]);
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
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Store the mediaRecorder in state to stop it later
      setRecorder(mediaRecorder);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    recorder?.stop();
    setIsRecording(false);
  };

  const handleSubmit = () => {
    if (!isRunning) return;

    // Create FormData for files
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (audioBlob) {
      formData.append('audio', audioBlob);
    }

    // Add the record
    addRecord({
      type: 'mixed',
      text,
      gitLink: gitLink || null,
      files: files.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size
      })),
      hasAudio: !!audioBlob
    });

    // Reset form
    setText('');
    setGitLink('');
    setFiles([]);
    setAudioBlob(null);
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

      <div className="flex items-center gap-4">
        <Input
          type="file"
          multiple
          onChange={handleFileChange}
          className="max-w-[200px]"
        />
        
        <Button
          type="button"
          variant={isRecording ? "destructive" : "secondary"}
          onClick={() => isRecording ? stopRecording() : startRecording()}
        >
          {isRecording ? 'Stop Recording' : 'Record Audio'}
        </Button>
      </div>

      {files.length > 0 && (
        <div className="text-sm text-gray-500">
          {files.length} file(s) selected
        </div>
      )}

      {audioBlob && (
        <div className="text-sm text-gray-500">
          Audio recorded
        </div>
      )}

      <Button 
        onClick={handleSubmit}
        disabled={!text && !gitLink && files.length === 0 && !audioBlob}
      >
        Add Record
      </Button>
    </div>
  );
}
