import { Type } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TextButton({ onClick, isActive }: { onClick: () => void; isActive?: boolean }) {
    return (
        <Button
            variant={isActive ? "default" : "ghost"}
            onClick={onClick}
            className="flex items-center gap-2 justify-start w-full"
        >
            <Type className="h-4 w-4" />
            <span>Text</span>
        </Button>
    );
}