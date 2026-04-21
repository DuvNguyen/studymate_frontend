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
    <ClerkProvider>
      <UserProvider>
        <NotificationProvider>
          <CartProvider>
            <html lang="vi">
              <body>
                  {children}
                  <Toaster position="top-right" />
              </body>
            </html>
          </CartProvider>
        </NotificationProvider>
      </UserProvider>
    </ClerkProvider>
  );
}