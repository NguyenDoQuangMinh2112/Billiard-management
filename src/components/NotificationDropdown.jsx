import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Trash2, DollarSign, X } from "lucide-react";
import { useGame } from "../context/GameContext";
import { useState, useRef, useEffect } from "react";

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAllAsRead, clearNotifications } =
    useGame();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(date));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon & Badge */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-[var(--color-surface)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 md:w-96 glass-panel border border-[var(--color-border)] rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-white/5 backdrop-blur-sm">
              <h3 className="font-bold text-[var(--color-text-main)] flex items-center gap-2 font-display">
                Notifications
                <span className="text-[10px] font-bold text-[var(--color-text-dim)] bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                  {notifications.length}
                </span>
              </h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-red-500/10 cursor-pointer"
                >
                  <Trash2 size={12} /> Clear all
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-[var(--color-surface)]/95">
              {notifications.length === 0 ? (
                <div className="p-12 text-center text-[var(--color-text-dim)] flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shadow-inner">
                    <Bell size={24} className="opacity-30" />
                  </div>
                  <p className="text-sm font-light">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-border)]">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-[var(--color-highlight)] transition-all group relative cursor-pointer ${
                        !notif.read ? "bg-[var(--color-primary)]/5" : ""
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Icon based on type */}
                        <div
                          className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg ${
                            notif.type === "payment"
                              ? "bg-gradient-to-br from-green-500/20 to-green-900/10 text-green-400 border border-green-500/20"
                              : "bg-gradient-to-br from-blue-500/20 to-blue-900/10 text-blue-400 border border-blue-500/20"
                          }`}
                        >
                          {notif.type === "payment" ? (
                            <DollarSign size={18} />
                          ) : (
                            <Check size={18} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p
                              className={`text-sm font-bold ${
                                !notif.read
                                  ? "text-[var(--color-text-main)]"
                                  : "text-[var(--color-text-dim)]"
                              }`}
                            >
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-[var(--color-text-dim)] whitespace-nowrap ml-2 opacity-70">
                              {formatDate(notif.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--color-text-dim)] leading-relaxed break-words font-light">
                            {notif.message}
                          </p>

                          {/* Context Data Visualization */}
                          {notif.data && notif.data.currentPayer && (
                            <div className="mt-2 text-[10px] flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5 w-fit">
                              <span className="text-gray-300">
                                {notif.data.currentPayer}
                              </span>
                              <span className="text-[var(--color-text-dim)]">
                                →
                              </span>
                              <span className="text-[var(--color-primary)] font-bold">
                                {notif.data.nextPayer}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Unread Indicator */}
                      {!notif.read && (
                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)] animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
