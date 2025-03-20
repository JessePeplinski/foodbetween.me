// src/app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import RateLimitIndicator from '@/components/RateLimitIndicator';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Food Between Me',
  description: 'Find places near the midpoint of two addresses',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {/* Header with Rate Limit Indicator */}
          <header className="py-2 px-4 border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
            <div className="container mx-auto flex justify-between items-center">
              <div className="text-sm font-medium">Food Between Me</div>
              <RateLimitIndicator />
            </div>
          </header>
          
          {/* Main content */}
          <main className="flex-grow">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="py-4 px-4 border-t border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
            <div className="container mx-auto text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>API usage is rate limited. See the API Limits indicator for your current status.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}