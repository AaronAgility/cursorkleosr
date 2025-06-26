import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Kairo - Multi-Agent Development Platform",
  description: "AI-powered development platform with specialized agents for web development",
  keywords: ['AI', 'development', 'multi-agent', 'platform', 'Next.js', 'React'],
};

// Client-side runtime indicator component
function RuntimeIndicator() {
  const runtimeMode = 'web'; // Default fallback
  
  return (
    <div 
      id="runtime-indicator" 
      data-mode={runtimeMode} 
      className="hidden" 
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <RuntimeIndicator />
        {children}
      </body>
    </html>
  );
}
