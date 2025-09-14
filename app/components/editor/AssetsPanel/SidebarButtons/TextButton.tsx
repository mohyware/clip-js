import Image from 'next/image';
import { Type } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TextButton({ onClick }: { onClick: () => void }) {
    return (
        <Button
            variant="secondary"
            onClick={onClick}
            className="flex flex-col h-auto py-2 px-2 sm:px-5 bg-white text-gray-800 hover:bg-gray-100"
        >
            <Type
                className="h-auto w-auto max-w-[30px] max-h-[30px]"
                size={30}
            />
            <span className="text-xs mt-1">Text</span>
        </Button>
    );
}