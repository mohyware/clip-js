"use client";
import {
  AiOutlineFacebook,
  AiOutlineX,
  AiOutlineGithub,
  AiOutlineLinkedin,
  AiOutlineInstagram,
} from "react-icons/ai";
import { usePathname } from "next/navigation";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname.startsWith("/projects/")) {
    return null;
  }

  return (
    <footer className="bg-black border-t border-gray-800 dark:bg-black shadow-sm text-gray-400 py-6 dark:border-t dark:border-gray-800">
      <div className="container mx-auto px-4 flex flex-wrap justify-center sm:justify-between items-center text-sm">
        <p className="ml-4">
          &copy; {currentYear} timeline. All rights reserved.
        </p>
        <div className="flex space-x-4 mt-2 mr-4 sm:mt-0">
          <a
            href="https://www.linkedin.com/in/mohyware"
            aria-label="LinkedIn"
            className="hover:text-gray-300"
          >
            <AiOutlineLinkedin className="w-5 h-5" />
          </a>
          <a
            href="https://www.instagram.com/mohyware"
            aria-label="Instagram"
            className="hover:text-gray-300"
          >
            <AiOutlineInstagram className="w-5 h-5" />
          </a>
          <a
            href="https://x.com/mohyware"
            aria-label="X (formerly Twitter)"
            className="hover:text-gray-300"
          >
            <AiOutlineX className="w-5 h-5" />
          </a>
          <a
            href="https://github.com/mohyware"
            aria-label="GitHub"
            className="hover:text-gray-300"
          >
            <AiOutlineGithub className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
