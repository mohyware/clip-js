'use client'
import Link from "next/link";
import ThemeSwitch from "../buttons/ThemeSwitch";
import { usePathname } from "next/navigation";
export default function Header() {
    const pathname = usePathname();

    if (pathname.startsWith("/projects/")) {
        return null;
    }

    return (
        <header className="bg-black border-b border-gray-800 shadow-sm">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center">
                    <Link href="/" className="text-3xl dark:text-gray-100">ClipJS</Link>
                </div>
                <nav className="flex items-center">
                    <ul className="flex space-x-2 mr-2">
                        <li>
                            <Link
                                href="/"
                                className="text-md text-white hover:text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/projects"
                                className="text-md text-white hover:text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                Projects
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/about"
                                className="text-md text-white hover:text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                About Me
                            </Link>
                        </li>
                    </ul>
                    {/* <ThemeSwitch /> */}
                </nav>
            </div>
        </header>
    );
}
