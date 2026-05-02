import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'StudyMate LMS',
  description: 'Nền tảng học trực tuyến',
};

import { CartProvider } from '@/contexts/CartContext';
import { UserProvider } from '@/contexts/UserContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <ClerkProvider>
          <UserProvider>
            <NotificationProvider>
              <CartProvider>
                {children}
                <Toaster position="top-right" />
              </CartProvider>
            </NotificationProvider>
          </UserProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}