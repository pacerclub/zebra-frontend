'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import StorageGuide from '@/components/storage-guide';
import { storage } from '@/lib/storage';

export default function StorageSelectionPage() {
  const router = useRouter();

  useEffect(() => {
    // If user is logged in, automatically use cloud storage and redirect
    if (storage.token) {
      storage.setStorageMode('cloud')
        .then(() => router.push('/'))
        .catch(console.error);
      return;
    }

    // If storage mode is already set, redirect to home
    if (storage.mode) {
      router.push('/');
    }
  }, [router]);

  // If user is logged in or storage mode is set, don't render anything
  if (storage.token || storage.mode) {
    return null;
  }

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Choose Your Storage Method</h1>
        <p className="text-muted-foreground">
          Select how you want to store your timer data. You can change this later in settings.
        </p>
      </div>
      <StorageGuide onComplete={() => router.push('/')} />
    </div>
  );
}
