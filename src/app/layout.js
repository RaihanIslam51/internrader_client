import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "CareerPulse | Career Page Job & Internship Scraper",
    template: "%s | CareerPulse",
  },
  description: "Track company career pages, scrape jobs and internships locally, and manage a clean deduplicated jobs database.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="h-full bg-[#F8FAFC] text-slate-800 font-sans selection:bg-indigo-500/30 selection:text-indigo-600"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
