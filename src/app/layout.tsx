import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'StudyMate LMS',
  description: 'Nền tảng học trực tuyến',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="vi">
        <body>
            {children}
            <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}