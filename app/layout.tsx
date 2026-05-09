import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';

export const metadata: Metadata = {
  title: 'Global Digital Currency Simulation',
  description: 'Macroeconomic model comparing fiat and digital currency architectures — IS-LM, Armington trade, Fisher debt-deflation, log-normal inequality',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="min-h-screen bg-[#FAFAF7] text-[#1A1A1A]">{children}</body>
    </html>
  );
}
