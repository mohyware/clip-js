'use client';
import { Link, Home } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function HomeButton() {
    const router = useRouter();

    return (
        <Button
            variant="secondary"
            onClick={() => router.push('/')}
            className="flex flex-col h-auto py-2 px-2 sm:px-5 bg-white text-gray-800 hover:bg-gray-100"
        >
            <Home
                className="h-auto w-auto max-w-[30px] max-h-[30px]"
                size={30}
            />
            <span className="text-xs mt-1">Home</span>
        </Button>
    );
}