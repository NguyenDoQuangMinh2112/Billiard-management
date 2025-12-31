import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Header from './Header';

const Layout = ({ children, activeTab, onTabChange }) => {
    return (
        <div className="flex bg-[var(--color-background)] min-h-screen text-[var(--color-text-main)] font-sans selection:bg-[var(--color-primary)] selection:text-black">
            <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
            <main className="flex-1 overflow-x-hidden pb-24 md:pb-0 relative flex flex-col">
                <Header 
                    title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
                    onMenuClick={() => {}} // TODO: Handle mobile menu
                />
                <div className="flex-1 relative">
                    {children}
                </div>
            </main>
            <MobileNav activeTab={activeTab} onTabChange={onTabChange} />
        </div>
    );
};

export default Layout;
