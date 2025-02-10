import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Zebra Work Log - Developer Time Tracking & Progress Documentation",
  description: "Track your development time and progress with ease.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col`}>
        <header className="border-b">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl">🦓</span>
              <span className="font-semibold text-xl">Zebra</span>
            </a>
            <div className="flex items-center gap-6">
              <a href="/" className="text-sm font-medium hover:text-gray-900">Timer</a>
              <a href="/projects" className="text-sm font-medium hover:text-gray-900">Projects</a>
            </div>
          </nav>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
