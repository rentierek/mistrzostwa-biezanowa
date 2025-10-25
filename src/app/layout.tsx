import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/ui/Navigation';
import { AdminProvider } from '@/contexts/AdminContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mistrzostwa Bieżanowa',
  description: 'System zarządzania turniejami piłkarskimi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={`${inter.className} transition-colors duration-300`} style={{ background: 'var(--background)', color: 'var(--foreground)' }} suppressHydrationWarning>
        <ThemeProvider>
          <AdminProvider>
            <Navigation />
            <main className="min-h-screen pt-16" style={{ background: 'var(--background)' }}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </div>
            </main>
          </AdminProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
