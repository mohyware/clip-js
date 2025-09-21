import type { Metadata } from "next";
import Home from "./Home";

export const metadata: Metadata = {
  title: "Timeline - Professional Video Editor | Free Online Video Editing",
  description: "Create stunning videos with Timeline's powerful browser-based video editor. Professional timeline editing, real-time preview, 1080p export. No downloads, no watermarks, completely free.",
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
    "video editing tool"
  ],
  authors: [{ name: "Timeline Team" }],
  creator: "Timeline",
  publisher: "Timeline",
  applicationName: "Timeline Video Editor",
  category: "productivity",
  classification: "Video Editing Software",
  openGraph: {
    title: "Timeline - Professional Video Editor",
    description: "Create stunning videos with our powerful browser-based editor. Professional timeline editing, real-time preview, 1080p export.",
    url: "https://timeline-editor.com",
    siteName: "Timeline",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Timeline Video Editor - Professional video editing in your browser",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Timeline - Professional Video Editor",
    description: "Create stunning videos with our powerful browser-based editor. No downloads, no watermarks, completely free.",
    images: ["/twitter-image.jpg"],
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
  },
  alternates: {
    canonical: "https://timeline-editor.com",
  },
  other: {
    "application-name": "Timeline",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Timeline",
    "format-detection": "telephone=no",
  },
};

export default function Page() {
  return <Home />
}
