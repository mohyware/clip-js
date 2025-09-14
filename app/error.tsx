"use client";
import { startTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function Error({ error, reset }: { error: Error, reset: () => void }) {
    const router = useRouter();
    const Reload = () => {
        startTransition(() => {
            router.refresh();
            reset();
        })
    }
    console.log(error);
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <p className='text-3xl font-semibold text-center text-foreground'>Something went wrong !</p>
            <br />
            <button
                className="rounded-full bg-primary text-primary-foreground border border-transparent transition-colors flex items-center justify-center gap-2 hover:bg-primary/90 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
                onClick={
                    () => Reload()
                }
            >
                Try again
            </button>
        </div>
    );
}