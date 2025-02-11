"use client"; 

import { ThemeProvider } from "next-themes";
import "./globals.css";
import ThemeToggle from "@/components/ui/theme-toggle";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-full flex flex-col">
        {/* Wrap everything in ThemeProvider */}
        <ThemeProvider attribute="class" defaultTheme="light">
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
                <ThemeToggle /> {/* Theme toggle button */}
              </div>
            </nav>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
