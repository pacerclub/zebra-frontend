'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import StorageGuide from '@/components/storage-guide';
import { useUser } from '@/contexts/user-context';

export default function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();

  const handleStorageComplete = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your storage preferences
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {!user && <StorageGuide onComplete={handleStorageComplete} />}
          {user && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Storage Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Currently using cloud storage. Your data is synced across all your devices.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Account</h3>
                <p className="text-sm text-muted-foreground">
                  Logged in as {user.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
