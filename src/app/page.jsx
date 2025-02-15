'use client';

import { useEffect, useState } from 'react';
import StorageGuide from '@/components/storage-guide';
import { storage } from '@/lib/storage';
import Timer from '@/components/Timer';
import ProjectSelector from '@/components/ProjectSelector';
import RecordInput from '@/components/RecordInput';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [showGuide, setShowGuide] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check if storage mode has been selected
    const mode = localStorage.getItem('storageMode');
    if (!mode) {
      setShowGuide(true);
    }
    setInitialized(true);
  }, []);

  const handleGuideComplete = () => {
    setShowGuide(false);
  };

  if (!initialized) {
    return null; // Prevent flash of content
  }

  if (showGuide) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <StorageGuide onComplete={handleGuideComplete} />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto py-8 max-w-2xl">
        <div className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <ProjectSelector />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Timer />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <RecordInput />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
