import "./globals.css";
import type { Metadata } from "next";
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
  title: "timeline",
  description:
    "A free online video editor that enables you to edit videos directly from your web browser.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`min-h-screen flex flex-col font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Header />
          <main className="flex-grow">
            <Toaster
              toastOptions={{
                className: '',
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
