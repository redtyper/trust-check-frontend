import type { Metadata } from "next";
import { Sora, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-code",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Verify360 - Intelligence Platform",
  description: "Zaawansowana weryfikacja podmiotow gospodarczych i cyberbezpieczenstwo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body
        className={`${sora.variable} ${spaceGrotesk.variable} ${jetbrains.variable} bg-navy-900 text-slate-light antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
