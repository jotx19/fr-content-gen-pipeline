import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { BRAND } from '@/lib/brand';
import { bricolage, inter, interTight, playfair } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: BRAND.name,
  description: BRAND.description,
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${bricolage.variable} ${interTight.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
