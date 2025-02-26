'use client';

import { ThemeProvider } from "next-themes";

export default function AuthLayout({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <main className="flex-1">
        {children}
      </main>
    </ThemeProvider>
  );
}
