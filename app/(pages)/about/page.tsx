"use client";
import { Github, Twitter, Linkedin, Heart } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AboutMe() {
  const [hovered, setHovered] = useState(false);

  const socialLinks = [
    {
      href: "https://github.com/mohyware",
      icon: Github,
      label: "GitHub"
    },
    {
      href: "https://twitter.com/mohyware",
      icon: Twitter,
      label: "Twitter"
    },
    {
      href: "https://www.linkedin.com/in/mohyware/",
      icon: Linkedin,
      label: "LinkedIn"
    }
  ];

  return (
    <div className="flex flex-col items-center mt-20 min-h-screen py-16 px-4">
      <div className="max-w-3xl w-full">
        <Card className="bg-black bg-opacity-30 backdrop-blur-lg border border-gray-800 border-opacity-30 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-white mb-4">
              {`Hey there, I'm Mohy Khalid`}
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              {`I'm a software developer with a passion for building products that help people.`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Card className="bg-gray-900 bg-opacity-30 backdrop-blur-lg border border-gray-800 border-opacity-30">
              <CardContent className="pt-6">
                <p className="text-gray-300 text-lg">
                  {`I'm currently working on`}{" "}
                  <Badge variant="secondary" className="bg-yellow-300 text-black font-semibold">
                    timeline
                  </Badge>, a
                  browser-based video editor that enables you to edit videos directly
                  from your web browser.
                </p>
                <p className="text-gray-300 mt-3 text-lg">
                  {`Everything including rendering happens right in your browser! It's `}
                  <Badge variant="secondary" className="bg-green-400 text-black font-bold">
                    100% free
                  </Badge> with no
                  watermarks and supports up to 1080p export.
                </p>
              </CardContent>
            </Card>

            <div className="flex justify-center space-x-4">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <Button
                  key={href}
                  variant="ghost"
                  size="icon"
                  asChild
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                    <Icon size={24} />
                  </a>
                </Button>
              ))}
            </div>

            <div className="text-center">
              <Button
                asChild
                className={`bg-pink-600 hover:bg-pink-500 text-white transition-all transform ${
                  hovered ? "scale-105" : "scale-100"
                }`}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                <a
                  href="https://github.com/sponsors/mohyware"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Heart size={20} className="mr-2" />
                  Sponsor on GitHub
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
