import { useRef, useEffect } from 'react';
import NotificationDropdown from './NotificationDropdown';

const Header = ({ title }) => {
    return (
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[var(--color-surface)]/80 backdrop-blur-xl border-b border-[var(--color-border)] shadow-sm">
            <div className="flex items-center gap-4">
                
                {/* Page Title mobile only likely, or standard */}
                <h2 className="text-xl font-bold font-display tracking-wide text-gradient block">
                    {title}
                </h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Notification Center */}
                <NotificationDropdown />
                
                {/* User Avatar */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] p-[1px] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                    <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center relative overflow-hidden group cursor-pointer">
                        <span className="font-bold text-sm text-white group-hover:scale-110 transition-transform">U</span>
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
