'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { storage, STORAGE_MODE } from '@/lib/storage';

export default function StorageGuide({ onComplete }) {
  const router = useRouter();

  const handleLocalStorage = async () => {
    await storage.setStorageMode(STORAGE_MODE.LOCAL);
    onComplete?.();
  };

  const handleCloudStorage = async () => {
    if (storage.token) {
      await storage.setStorageMode(STORAGE_MODE.CLOUD);
      onComplete?.();
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Local Storage</CardTitle>
          <CardDescription>
            Store data on this device only. Perfect for personal use on a single device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your timer data will be stored locally on this device. You won't be able to access it from other devices.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLocalStorage} className="w-full">
            Use Local Storage
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cloud Storage</CardTitle>
          <CardDescription>
            Sync your data across all your devices. Great for accessing your timers anywhere.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your timer data will be synced to the cloud, allowing you to access it from any device. 
            {!storage.token && " Requires an account."}
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCloudStorage} variant="outline" className="w-full">
            Use Cloud Storage
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}