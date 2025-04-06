// NotificationBell.jsx
import React, { useEffect, useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationPanel from './NotificationPanel';

const bellVariants = {
  initial: { scale: 1 },
  ring: {
    rotate: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      type: "spring",
      stiffness: 300
    }
  },
  hover: { 
    scale: 1.1,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  tap: { 
    scale: 0.9,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  }
};

const badgeVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25
    }
  },
  exit: { 
    scale: 0, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const NotificationBell = ({
  panelOpen,
  setPanelOpen,
  notifications,
  setNotifications,
  panelRef,
  handleNotificationClick,
}) => {
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [isRinging, setIsRinging] = useState(false);

  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    setUnreadNotificationsCount(unreadCount);
    
    // Trigger bell animation when new notifications arrive
    if (unreadCount > 0) {
      setIsRinging(true);
      setTimeout(() => setIsRinging(false), 1000);
    }
  }, [notifications]);

  return (
    <div className="relative">
      <motion.button
        className="relative flex items-center p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors"
        onClick={() => setPanelOpen(!panelOpen)}
        variants={bellVariants}
        initial="initial"
        animate={isRinging ? "ring" : "initial"}
        whileHover="hover"
        whileTap="tap"
        aria-label={`Notifications ${unreadNotificationsCount > 0 ? `(${unreadNotificationsCount} unread)` : ''}`}
      >
        <FaBell className="text-2xl text-brand-secondary" />
        <AnimatePresence>
          {unreadNotificationsCount > 0 && (
            <motion.span
              variants={badgeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs min-w-[1.25rem] h-5 flex items-center justify-center px-1 font-medium shadow-lg"
            >
              {unreadNotificationsCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {panelOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 25
              }
            }}
            exit={{ 
              opacity: 0, 
              y: 10, 
              scale: 0.95,
              transition: { duration: 0.2 }
            }}
            className="z-30 absolute right-0 mt-2 origin-top-right"
          >
            <NotificationPanel
              notifications={notifications}
              setNotifications={setNotifications}
              closePanel={() => setPanelOpen(false)}
              handleNotificationClick={handleNotificationClick}
              setUnreadNotificationsCount={setUnreadNotificationsCount}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
