"use client";
import {
  AiOutlineFacebook,
  AiOutlineX,
  AiOutlineGithub,
  AiOutlineLinkedin,
  AiOutlineInstagram,
} from "react-icons/ai";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname.startsWith("/projects/")) {
    return null;
  }

  const socialLinks = [
    {
      href: "https://www.linkedin.com/in/mohyware",
      icon: AiOutlineLinkedin,
      label: "LinkedIn"
    },
    {
      href: "https://www.instagram.com/mohyware",
      icon: AiOutlineInstagram,
      label: "Instagram"
    },
    {
      href: "https://x.com/mohyware",
      icon: AiOutlineX,
      label: "X (formerly Twitter)"
    },
    {
      href: "https://github.com/mohyware",
      icon: AiOutlineGithub,
      label: "GitHub"
    }
  ];

  return (
    <footer className="bg-black border-t border-gray-800 dark:bg-black shadow-sm text-gray-400 py-6 dark:border-t dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center sm:justify-between items-center text-sm">
          <p className="ml-4">
            &copy; {currentYear} timeline. All rights reserved.
          </p>
          <div className="flex space-x-2 mt-2 mr-4 sm:mt-0">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <Button
                key={href}
                variant="ghost"
                size="icon"
                asChild
                className="hover:text-gray-300 h-8 w-8"
              >
                <a
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="w-5 h-5" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
