import Link from "next/link";
import { 
  Play, 
  Scissors, 
  Layers3, 
  Download, 
  Zap, 
  Shield,
  Github, 
  ArrowRight,
  Video,
  Upload,
  Edit3,
  Share2,
  Star,
  Users,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Shield,
    title: "Privacy First",
    description: "All processing happens in your browser. Your files never leave your device."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Real-time preview with instant feedback. No uploading, no waiting."
  },
  {
    icon: Scissors,
    title: "Professional Tools",
    description: "Trim, cut, merge, and add effects with precision timeline editing."
  },
  {
    icon: Layers3,
    title: "Multi-track Editing",
    description: "Layer videos, audio, images, and text with full control over timing."
  },
  {
    icon: Download,
    title: "Export Quality",
    description: "Export in multiple formats up to 1080p with optimized compression."
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share your creations directly or download for any platform."
  }
];

const stats = [
  { icon: Users, value: "10K+", label: "Active Users" },
  { icon: Video, value: "50K+", label: "Videos Created" },
  { icon: Star, value: "4.8", label: "User Rating" },
  { icon: Clock, value: "0s", label: "Setup Time" }
];

// Structured data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Timeline Video Editor",
  "description": "Professional video editing software that runs entirely in your browser. Create stunning videos with our powerful timeline editor.",
  "url": "https://timeline-editor.com",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "10000"
  },
  "features": [
    "Timeline Video Editing",
    "Real-time Preview",
    "1080p Export",
    "Multi-track Support",
    "No Registration Required",
    "Browser-based Processing"
  ],
  "screenshot": "https://timeline-editor.com/screenshot.jpg",
  "softwareVersion": "1.0.0",
  "datePublished": "2024-01-01",
  "creator": {
    "@type": "Organization",
    "name": "Timeline Team"
  }
};

export default function Home() {
  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden to-muted/20">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative mx-auto max-w-7xl sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
            <div className="text-center">
              <Badge variant="secondary" className="mb-6 px-4 py-2">
                ✨ Now supporting 1080p exports
              </Badge>
              
              <h1 className="mx-auto max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Professional video editing
                <span className="block text-primary mt-2">
                  directly in your browser
                </span>
              </h1>
              
              <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
                Create stunning videos with our powerful timeline editor. No downloads, 
                no accounts, no watermarks. Just pure creative freedom.
              </p>
              
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="default" className="group">
                  <Link href="/projects">
                    <Play className="mr-2 h-4 w-4" />
                    Start Creating
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {/* <section className="border-t bg-muted/30 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="mx-auto h-6 w-6 text-primary mb-2" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* How it Works Section */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
                Edit videos in three simple steps
              </h2>
              <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
                Our intuitive interface makes professional video editing accessible to everyone
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <article className="text-center group">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">1. Upload Media</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your videos, images, and audio files. Support for all major formats.
                </p>
              </article>
              
              <article className="text-center group">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:scale-110 transition-transform">
                  <Edit3 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">2. Edit Timeline</h3>
                <p className="text-sm text-muted-foreground">
                  Use our powerful timeline to trim, arrange, and perfect your content with precision.
                </p>
              </article>
              
              <article className="text-center group">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:scale-110 transition-transform">
                  <Download className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">3. Export & Share</h3>
                <p className="text-sm text-muted-foreground">
                  Export in high quality up to 1080p or share directly to your favorite platforms.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
                Everything you need to create amazing videos
              </h2>
              <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
                Professional-grade features that work entirely in your browser
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <article key={index} className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-lg transition-all duration-300">
                  <div className="mb-3">
                    <feature.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl mb-4">
              Ready to start creating?
            </h2>
            <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators who trust Timeline for their video editing needs. 
              No credit card required, no hidden fees.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="default">
                <Link href="/projects">
                  <Play className="mr-2 h-4 w-4" />
                  Create Your First Video
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}