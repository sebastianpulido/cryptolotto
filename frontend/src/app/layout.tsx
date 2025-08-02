import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CryptoLotto - Lotería Blockchain Transparente',
  description:
    'La lotería más transparente del mundo construida en Solana. Compra tickets en 1 click y participa en sorteos verificables.',
  keywords: 'lotería, blockchain, solana, cripto, transparente, sorteo',
  authors: [{ name: 'CryptoLotto Team' }],
  openGraph: {
    title: 'CryptoLotto - Lotería Blockchain',
    description: 'Lotería 100% transparente en blockchain',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
