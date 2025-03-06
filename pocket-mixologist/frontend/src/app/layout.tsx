import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

// Load fonts
const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap'
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: "Pocket Mixologist | Craft Your Perfect Cocktail",
  description: "Your personal AI-powered cocktail assistant. Get personalized cocktail recipes based on your preferences.",
  keywords: "cocktails, mixology, drinks, bartender, AI assistant"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} bg-mixology-dark text-white`}>
        <div className="cocktail-ambience min-h-screen">
          {/* Dark cocktail bar background with subtle gradients */}
          <div className="fixed inset-0 bg-mixology-dark bg-opacity-90 z-0 
              bg-[radial-gradient(ellipse_at_center,rgba(42,42,42,0.5),rgba(18,18,18,0.9))]" />
          
          {/* App Container */}
          <div className="relative z-10 min-h-screen px-4 py-8">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
