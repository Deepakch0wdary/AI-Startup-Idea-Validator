import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Startup Idea Validator - Enterprise SaaS",
  description: "Validate startup concepts, analyze competition, forecast revenue, and draft pitch decks using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full bg-[#0b0f19] text-gray-100 flex flex-col relative overflow-x-hidden antialiased">
        {/* Glow ambient meshes */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
        
        <Navigation />
        
        <main className="flex-1 flex flex-col z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
