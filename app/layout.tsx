import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-family-sans",
});

export const metadata: Metadata = {
  title: "Streak Counter",
  description: "Track your daily streaks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="emerald" data-mode="dark" className={`${montserrat.variable} h-full antialiased`}>
      {/* Inline script runs before paint — prevents theme flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=JSON.parse(localStorage.getItem('streakz-theme')||'{}');var st=s.state||{};var scheme=st.colorScheme||'emerald';var mode=st.mode||'system';var resolved=mode==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):mode;document.documentElement.setAttribute('data-theme',scheme);document.documentElement.setAttribute('data-mode',resolved);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
