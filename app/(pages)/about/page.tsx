'use client'
import { Github, Twitter, Linkedin, Heart } from "lucide-react";
import { useState } from "react";

export default function AboutMe() {
    const [hovered, setHovered] = useState(false);

    return (
        <div className="flex flex-col items-center mt-20 min-h-screen py-16 px-4">
            <div className="max-w-3xl w-full bg-black bg-opacity-30 backdrop-blur-lg border border-gray-800 border-opacity-30 rounded-xl shadow-xl p-8 text-center">
                <h1 className="text-4xl font-bold text-white mb-4">{`Hey there, I'm Mohy Khalid`}</h1>

                <p className="text-gray-300 mt-4 text-lg">
                    {`I'm a software developer with a passion for building products that help people.`}
                </p>

                <div className="my-8 p-6 bg-gray-900 bg-opacity-30 backdrop-blur-lg border border-gray-800 border-opacity-30 rounded-lg">
                    <p className="text-gray-300 text-lg">
                        {`I'm currently working on`} <span className="font-semibold text-yellow-300">ClipJS</span>, a browser-based video editor that enables you to edit videos directly from your web browser.
                    </p>
                    <p className="text-gray-300 mt-3 text-lg">
                        {`Everything including rendering happens right in your browser! It's `}<span className="font-bold text-green-400">100% free</span> with no watermarks and supports up to 1080p export.
                    </p>
                </div>

                <div className="flex justify-center space-x-4 mt-8">
                    <a href="https://github.com/mohyware" className="text-gray-300 hover:text-white transition-colors">
                        <Github size={24} />
                    </a>
                    <a href="https://twitter.com/mohyware" className="text-gray-300 hover:text-white transition-colors">
                        <Twitter size={24} />
                    </a>
                    <a href="https://www.linkedin.com/in/mohyware/" className="text-gray-300 hover:text-white transition-colors">
                        <Linkedin size={24} />
                    </a>
                </div>

                <div className="mt-10">
                    <a
                        href="https://github.com/sponsors/mohyware"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center mx-auto px-5 py-3 ${hovered ? "bg-pink-500" : "bg-pink-600"} hover:bg-pink-500 rounded-lg text-gray-900 font-bold transition-all transform ${hovered ? "scale-105" : "scale-100"}`}
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                    >
                        <Heart size={20} className="mr-2" />
                        Sponsor on GitHub
                    </a>

                </div>
            </div>
        </div>
    );
}