import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LibraryButton({ onClick, isActive }: { onClick: () => void; isActive?: boolean }) {
    return (
        <Button
            variant={isActive ? "default" : "ghost"}
            onClick={onClick}
            className="flex items-center gap-2 justify-start w-full"
        >
            <FolderOpen className="h-4 w-4" />
            <span>Library</span>
        </Button>
    );
}