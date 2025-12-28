import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const Layout = ({ children, activeTab, onTabChange }) => {
    return (
        <div className="flex bg-[var(--color-background)] min-h-screen text-[var(--color-text-main)] font-sans selection:bg-[var(--color-primary)] selection:text-black">
            <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
            <main className="flex-1 overflow-x-hidden pb-24 md:pb-0">
                {children}
            </main>
            <MobileNav activeTab={activeTab} onTabChange={onTabChange} />
        </div>
    );
};

export default Layout;
