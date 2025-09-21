import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { Providers } from "./providers";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Timeline Video Editor",
    default: "Timeline - Professional Video Editor | Free Online Video Editing",
  },
  description:
    "Create stunning videos with Timeline's powerful browser-based video editor. Professional timeline editing, real-time preview, 1080p export. No downloads, no watermarks, completely free.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "icon",
        url: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  keywords: [
    "video editor",
    "online video editing",
    "free video editor",
    "browser video editor",
    "timeline editor",
    "video editing software",
    "professional video editing",
    "video maker",
    "video creation",
    "video editing tool",
    "no download video editor",
    "web-based video editor",
  ],
  authors: [{ name: "Timeline Team" }],
  creator: "Timeline",
  publisher: "Timeline",
  applicationName: "Timeline Video Editor",
  category: "productivity",
  classification: "Video Editing Software",
  metadataBase: new URL("https://timeline-editor.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Timeline Video Editor",
    title: "Timeline - Professional Video Editor",
    description: "Create stunning videos with our powerful browser-based editor. Professional timeline editing, real-time preview, 1080p export.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@timeline_editor",
    creator: "@timeline_editor",
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
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  other: {
    "application-name": "Timeline Video Editor",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Timeline",
    "format-detection": "telephone=no",
    "msapplication-TileColor": "#000000",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#000000",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Timeline Video Editor",
    description: "Professional browser-based video editor with timeline editing, real-time preview, and 1080p export capabilities.",
    url: "https://timeline-editor.com",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Timeline-based video editing",
      "Real-time preview",
      "1080p video export",
      "No watermarks",
      "Browser-based editing",
      "No downloads required"
    ],
    creator: {
      "@type": "Organization",
      name: "Timeline Team",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`min-h-screen flex flex-col font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
				<div className="absolute inset-0 z-0 pointer-events-none grid-background" />
        <Providers>
          <Header />
          <main className="flex-grow">
            <Toaster
              toastOptions={{
                className: "",
                style: {
                  borderRadius: "var(--radius)",
                  background: "hsl(var(--card))",
                  color: "hsl(var(--card-foreground))",
                  border: "1px solid hsl(var(--border))",
                },
              }}
            />
            {children}
            <Analytics />
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
