'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/lib/authStore';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Initialize auth store
    useAuthStore.getState().init();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('zebra-token');
    if (!token || !isAuthenticated) {
      router.replace('/auth/login');
    } else {
      router.replace('/timer');
    }
  }, [isAuthenticated, router]);

  return null;
}
