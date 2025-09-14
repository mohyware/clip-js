import { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/store';
import { setProjectName } from "../../../store/slices/projectSlice";

export default function ProjectName() {
    const [isEditing, setIsEditing] = useState(false);
    const { projectName } = useAppSelector((state) => state.projectState);
    const dispatch = useAppDispatch();

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setProjectName(e.target.value));
    };

    return (
        <div className="relative">
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={projectName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="text-2xl font-bold mt-4 capitalize tracking-wider bg-background text-foreground border border-border w-full px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                />
            ) : (
                <p
                    onClick={handleClick}
                    className="text-2xl font-bold mt-4 capitalize tracking-wider cursor-pointer hover:bg-muted px-2 py-1 rounded flex items-center text-foreground"
                >
                    {projectName}
                    <svg className="w-4 h-4 ml-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                </p>
            )}
        </div>
    );
}