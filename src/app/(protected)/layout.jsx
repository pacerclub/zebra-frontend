'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeProvider } from "next-themes";
import ThemeToggle from "@/components/ui/theme-toggle";
import useAuthStore from '@/lib/authStore';
import useStore from '@/lib/store';

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const { loadProjects } = useStore();

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize auth store
        useAuthStore.getState().init();
        
        // Check if we have a token
        const token = localStorage.getItem('zebra-token');
        if (!token || !isAuthenticated) {
          router.replace('/auth/login');
          return;
        }

        // Try to load projects to verify token is valid
        await loadProjects();

        // If we're on the root page, redirect to dashboard
        if (pathname === '/') {
          router.replace('/dashboard');
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
        if (error.message === 'Unauthorized') {
          useAuthStore.getState().logout();
          router.replace('/auth/login');
        }
      }
    };

    init();
  }, []);

  // Watch for auth state changes
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <header className="border-b">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl">🦓</span>
            <span className="font-semibold text-xl">Zebra</span>
          </a>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push('/dashboard')} 
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/dashboard' ? 'text-primary' : ''}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => router.push('/timer')} 
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/timer' ? 'text-primary' : ''}`}
            >
              Timer
            </button>
            <button 
              onClick={() => router.push('/projects')} 
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/projects' ? 'text-primary' : ''}`}
            >
              Projects
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{user?.name}</span>
              <button
                onClick={() => {
                  useAuthStore.getState().logout();
                  router.replace('/auth/login');
                }}
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Logout
              </button>
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </ThemeProvider>
  );
}
