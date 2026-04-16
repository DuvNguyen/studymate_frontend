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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <UserProvider>
        <CartProvider>
          <html lang="vi">
            <body>
                {children}
                <Toaster position="top-right" />
            </body>
          </html>
        </CartProvider>
      </UserProvider>
    </ClerkProvider>
  );
}