import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeSync } from "@/components/theme-sync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800"], // Reduced from 7 to 4 weights (300,500,900 removed - rarely used)
});

export const metadata: Metadata = {
  title: {
    default: "نبض المدينة | Nabd Al-Madina — متجرك الإلكتروني الليبي",
    template: "%s | نبض المدينة",
  },
  description: "متجرك الإلكتروني الليبي - أدوات المطبخ، المنزل، الموضة وأكثر. تسوق الآن بأفضل الأسعار مع التوصيل لجميع مدن ليبيا | Your Libyan E-Commerce Store - Kitchenware, Home, Fashion & More. Shop now with delivery across Libya",
  keywords: [
    "نبض المدينة", "Nabd Al-Madina", "ليبيا", "Libya", "تسوق", "Shopping",
    "أدوات المطبخ", "Kitchenware", "LYD", "متجرك الإلكتروني", "e-commerce Libya",
    "تسوق اونلاين", "online shopping Libya", "توصيل ليبيا", "delivery Libya",
    "أدوات منزلية", "home goods", "موضة", "fashion",
  ],
  authors: [{ name: "Nabd Al-Madina" }],
  creator: "Nabd Al-Madina",
  publisher: "Nabd Al-Madina",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://nabd-almadina.ly"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ar_LY",
    alternateLocale: "en_US",
    url: "https://nabd-almadina.ly",
    title: "نبض المدينة | Nabd Al-Madina",
    description: "متجرك الإلكتروني الليبي - تسوق بأفضل الأسعار مع التوصيل لجميع مدن ليبيا",
    siteName: "نبض المدينة",
    images: [
      {
        url: "/logo-512.png",
        width: 512,
        height: 512,
        alt: "نبض المدينة - Nabd Al-Madina",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "نبض المدينة | Nabd Al-Madina",
    description: "متجرك الإلكتروني الليبي - تسوق بأفضل الأسعار",
    images: ["/logo-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/logo-192.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||((!t||t==='system')&&matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        {/* Permanently remove Next.js dev overlay (issues badge, dev tools) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var p=document.querySelector('nextjs-portal');if(p)p.remove();if(document.body){new MutationObserver(function(m){m.forEach(function(n){n.addedNodes.forEach(function(e){if(e.nodeName==='NEXTJS-PORTAL')e.remove()})})}).observe(document.body,{childList:true})}})()`,
          }}
        />
        {/* JSON-LD Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "نبض المدينة",
              "alternateName": "Nabd Al-Madina",
              "url": "https://nabd-almadina.ly",
              "logo": "https://nabd-almadina.ly/logo-512.png",
              "description": "متجرك الإلكتروني الليبي - تسوق بأفضل الأسعار مع التوصيل لجميع مدن ليبيا",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Tripoli",
                "addressCountry": "LY"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+218-XX-XXXXXXX",
                "contactType": "customer service",
                "availableLanguage": ["Arabic", "English"]
              },
              "sameAs": [
                "https://facebook.com/nabdalmadina",
                "https://instagram.com/nabdalmadina"
              ]
            }),
          }}
        />
        {/* JSON-LD Structured Data - WebSite with Search Action */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "نبض المدينة",
              "alternateName": "Nabd Al-Madina",
              "url": "https://nabd-almadina.ly",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://nabd-almadina.ly/?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />
        {/* JSON-LD Structured Data - Store */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              "name": "نبض المدينة",
              "alternateName": "Nabd Al-Madina",
              "url": "https://nabd-almadina.ly",
              "image": "https://nabd-almadina.ly/logo-512.png",
              "priceRange": "LYD",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Tripoli",
                "addressCountry": "LY"
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
                "opens": "00:00",
                "closes": "23:59"
              }
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
        >
          <ThemeSync />
          <a href="#main-content" className="skip-to-content">
            تخطي إلى المحتوى الرئيسي
          </a>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
