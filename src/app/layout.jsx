"use client"; 

import { Inter } from 'next/font/google';
import { ThemeProvider } from "next-themes";
import { UserProvider } from '@/contexts/user-context';
import "./globals.css";
import ThemeToggle from "@/components/ui/theme-toggle";
import SettingsDialog from "@/components/settings-dialog";
import UserMenu from '@/components/user-menu';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className + " antialiased min-h-full flex flex-col"}>
        {/* Wrap everything in ThemeProvider */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <UserProvider>
            <header className="border-b">
              <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                <a href="/" className="flex items-center gap-2">
                  <span className="text-2xl">🦓</span>
                  <span className="font-semibold text-xl">Zebra</span>
                </a>
                <div className="flex items-center gap-6">
                  <a href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">Dashboard</a>
                  <a href="/" className="text-sm font-medium transition-colors hover:text-primary">Timer</a>
                  <a href="/projects" className="text-sm font-medium transition-colors hover:text-primary">Projects</a>
                </div>
              </nav>
            </header>
            <div className="fixed top-4 right-4 flex items-center gap-2">
              <UserMenu />
              <SettingsDialog />
              <ThemeToggle /> {/* Theme toggle button */}
            </div>
            <main className="flex-1">
              {children}
            </main>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
