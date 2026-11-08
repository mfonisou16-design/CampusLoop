import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Campus Loop', description: 'Tap, Move, Arrive. Campus keke rides.' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
