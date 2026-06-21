import './globals.css';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { AuthProvider } from '../hooks/useAuth';
import { BlueWillProvider } from '../hooks/useBlueWill';
import { Toaster } from '../components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'BlueWILL - Where Ideas Take Flight',
  description: 'Connect Freely. Trade Globally. Speak Boldly. A hybrid social ecosystem combining free speech social media with friction-free local and international commerce.',
  keywords: ['social media', 'marketplace', 'social network', 'commerce', 'community'],
  openGraph: {
    title: 'BlueWILL - Where Ideas Take Flight',
    description: 'Connect Freely. Trade Globally. Speak Boldly.',
    type: 'website',
    images: [
      {
        url: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
        width: 1200,
        height: 630,
        alt: 'BlueWILL',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlueWILL - Where Ideas Take Flight',
    description: 'Connect Freely. Trade Globally. Speak Boldly.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <AuthProvider>
          <BlueWillProvider>
            {children}
            <Toaster position="top-center" />
          </BlueWillProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
