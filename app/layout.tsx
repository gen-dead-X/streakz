import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-family-display",
});
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-family-sans",
});

export const metadata: Metadata = {
  title: "Streakz",
  description: "Track your daily streaks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-mode="dark" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      {/* Inline script runs before paint — prevents theme flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=JSON.parse(localStorage.getItem('streakz-theme')||'{}');var st=s.state||{};var mode=st.mode||'system';var resolved=mode==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):mode;document.documentElement.setAttribute('data-mode',resolved);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
