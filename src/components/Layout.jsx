import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import Header from "./Header";

const Layout = memo(({ children, activeTab, onTabChange }) => {
  return (
    <div className="flex bg-[var(--color-background)] min-h-screen text-[var(--color-text-main)] font-sans selection:bg-[var(--color-primary)] selection:text-black">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-0 relative flex flex-col min-w-0">
        <Header title={activeTab} onMenuClick={() => {}} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 relative"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <MobileNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
});

Layout.displayName = "Layout";
export default Layout;
