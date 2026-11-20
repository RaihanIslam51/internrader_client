import "./globals.css";
import Providers from "../components/Providers";

export const metadata = {
  title: {
    default: "Meta Ad Library Lead Scraper | Business Intelligence",
    template: "%s | Meta Ad Scraper",
  },
  description: "Meta Ad Library Business Lead Scraper and Cheerio Contact Enrichment Engine.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body 
        className="h-full bg-[#F8FAFC] text-slate-800 font-sans selection:bg-indigo-500/30 selection:text-indigo-600"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
