import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google"; // Import fontów
import "./globals.css";

// Konfiguracja fontów
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Verify360 - Intelligence Platform",
  description: "Zaawansowana weryfikacja podmiotów gospodarczych i cyberbezpieczeństwo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${inter.variable} ${jetbrains.variable} bg-navy-900 text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
