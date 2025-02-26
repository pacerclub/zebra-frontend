import "./globals.css";
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  );
}
