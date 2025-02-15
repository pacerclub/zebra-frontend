'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/user-context';
import { storage } from '@/lib/storage';

export default function StorageGuide({ onComplete }) {
  const { user, login, register } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let result;
      if (isRegistering) {
        result = await register(email, password);
      } else {
        result = await login(email, password);
      }
      if (result && result.token) {
        if (onComplete) {
          onComplete();
        }
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const handleLocalStorage = () => {
    storage.logout();
    if (onComplete) {
      onComplete();
    }
  };

  if (user) {
    return null;
  }

  return (
    <Card className="w-[420px] mx-auto mt-8">
      <CardHeader>
        <CardTitle>Choose Your Storage Method</CardTitle>
        <CardDescription>
          Select how you want to store your timer data. You can change this later in settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Local Storage</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Store data on this device only. Perfect for personal use on a single device.
            </p>
            <Button variant="outline" onClick={handleLocalStorage}>
              Use Local Storage
            </Button>
          </div>
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Cloud Storage</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sync your data across all your devices. Great for accessing your timers anywhere.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full">
                {isRegistering ? 'Create Account' : 'Sign In'}
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering
            ? 'Already have an account? Sign in'
            : "Don't have an account? Create one"}
        </Button>
      </CardFooter>
    </Card>
  );
}
