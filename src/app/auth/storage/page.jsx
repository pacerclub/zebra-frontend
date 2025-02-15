'use client';

import { useRouter } from 'next/navigation';
import StorageGuide from '@/components/storage-guide';

export default function StorageSelectionPage() {
  const router = useRouter();

  const handleStorageComplete = () => {
    router.push('/');
  };

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Choose Your Storage Method</h1>
        <p className="text-muted-foreground">
          Select how you want to store your timer data. You can change this later in settings.
        </p>
      </div>
      <StorageGuide onComplete={handleStorageComplete} />
    </div>
  );
}
