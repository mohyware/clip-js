"use client";
import Link from 'next/link';
export default function notFound() {
    return (
        <div className='flex items-center justify-center w-full min-h-[70vh] text-muted-foreground my-12 px-4'>
            <div className='flex flex-col items-center w-full gap-8'>
                <h1 className='text-9xl md:text-16xl w-full select-none text-center font-black text-foreground'>
                    404
                </h1>
                <p className='text-3xl font-semibold text-center text-foreground'>Oops! Page not found</p>
                <p className='text-2xl md:px-12 text-center'>
                    {"The page you're looking for doesn't exist or has been moved."}
                </p>
                <div className='flex flex-row justify-between gap-8'>
                    <Link href="/" as={"/"}
                        className="rounded-full bg-primary text-primary-foreground border border-transparent transition-colors flex items-center justify-center gap-2 hover:bg-primary/90 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
                        id="headlessui-menu-button-:r4:" aria-haspopup="true" aria-expanded="false" data-headlessui-state="" type="button">
                        <span >Return To Home</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}