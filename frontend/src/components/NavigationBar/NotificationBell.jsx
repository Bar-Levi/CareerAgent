// NotificationBell.jsx
import React from 'react';
import { FaBell } from 'react-icons/fa';
import NotificationPanel from './NotificationPanel';

const NotificationBell = ({
  panelOpen,
  setPanelOpen,
  notifications,
  setNotifications,
  panelRef,
  handleNotificationClick,
}) => {
  return (
    <div className="relative">
      <button
        className="flex items-center px-4 py-2 rounded font-medium transition duration-300 text-brand-secondary"
        onClick={() => setPanelOpen(!panelOpen)}
      >
        <FaBell className="text-xl" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>
      {panelOpen && (
        <div ref={panelRef}>
          <NotificationPanel
            notifications={notifications}
            setNotifications={setNotifications}
            onClose={() => setPanelOpen(false)}
            handleNotificationClick={handleNotificationClick}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
