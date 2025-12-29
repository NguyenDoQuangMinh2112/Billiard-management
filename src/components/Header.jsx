import { useRef, useEffect } from 'react';
import NotificationDropdown from './NotificationDropdown';

const Header = ({ title }) => {
    return (
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center gap-4">
                
                {/* Page Title */}
                <h2 className="text-xl font-bold font-display tracking-tight text-white block">
                    {title}
                </h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Notification Center */}
                <NotificationDropdown />
                
                {/* User Avatar (Placeholder) */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] p-[2px]">
                    <div className="w-full h-full rounded-full bg-[#1a1a2e] flex items-center justify-center">
                        <span className="font-bold text-xs text-white">U</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
