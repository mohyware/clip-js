import Link from "next/link";
import Image from "next/image";
import { Ban, ShieldX, UserX, Zap, Scissors, Combine, LucideIcon, Github, Plus } from "lucide-react";
import { featuresGridList } from "./utils/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Helper function to get the icon component
const getIconComponent = (iconName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    Ban,
    ShieldX,
    UserX,
    Zap,
    Scissors,
    Combine
  };
  
  return iconMap[iconName] || Ban; // fallback to Ban icon
};

export default function Home() {

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="mx-auto bg-surfacePrimary max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
        <p className="mx-auto -mt-4 max-w-2xl text-lg tracking-tight text-white-700 sm:mt-6">
          Welcome to
          <span className="border-b border-dotted border-slate-300"></span>
        </p>

        <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-white-900 sm:text-7xl">
          <span className="inline-block">Clip
            <span className="relative whitespace-nowrap text-white-600">
              <svg aria-hidden="true" viewBox="0 0 418 42" className="absolute top-2/3 left-0 h-[0.58em] w-full fill-yellow-300/70" preserveAspectRatio="none"><path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z"></path></svg>
              <span className="relative">JS</span></span>
          </span>
        </h1>

        <p className="mx-auto mt-9 max-w-2xl text-lg tracking-tight text-white-700 sm:mt-6">
          <span className="inline-block">Edit your videos from your PC or phone no downloads, no registration, no watermarks.</span>
          <span className="inline-block">Online, Free and Open Source</span>
        </p>

        <div className="mt-12 flex flex-col justify-center gap-y-5 sm:mt-10 sm:flex-row sm:gap-y-0 sm:gap-x-6">
          <Button asChild size="lg" className="text-gray-800 bg-white hover:bg-gray-100 dark:hover:bg-gray-100">
            <Link href="/projects">
              <Plus />
              Get Started
            </Link>
          </Button>
          
          <Button asChild variant="secondary" size="lg">
            <Link href="https://github.com/mohyware/clip.js" target="_blank">
             <Github/>
              Star on GitHub
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="space-y-10">
        <h2 className="mx-auto max-w-4xl text-center font-display text-5xl font-medium tracking-tight text-white-900 sm:text-4xl">
          <span className="inline-block">What Can it do?</span>
        </h2>

        <div className="grid w-full max-w-[1680px] mx-auto py-4 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {featuresGridList.items.map(({ id, title, description, icon }) => {
            const IconComponent = getIconComponent(icon.name);
            return (
              <Card key={id} className="border border-white border-opacity-10 bg-transparent [box-shadow:_70px_-20px_130px_0px_rgba(255,255,255,0.05)_inset] dark:[box-shadow:_70px_-20px_130px_0px_rgba(255,255,255,0.05)_inset]">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex size-8 md:size-9 items-center justify-center rounded-full bg-surface-secondary p-2 dark:border-dark-border dark:bg-dark-surface-secondary">
                    <IconComponent className="invert" size={18} />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base md:text-lg font-medium mb-2">{title}</CardTitle>
                  <CardDescription className="text-pretty text-sm md:text-base text-text-secondary dark:text-dark-text-secondary">
                    {description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <br />
        <br />
        <br />
      </div>
    </div>
  );
}