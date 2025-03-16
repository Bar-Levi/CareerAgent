// NotificationBell.jsx
import React, { useEffect, useState } from 'react';
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

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(notifications.length);

  useEffect(() => {
    setUnreadNotificationsCount(
      notifications.filter((notification) => notification.read === false).length
    );
  }, [notifications]);

  return (
    <div className="relative">
      <button
        className="flex items-center px-4 py-2 rounded font-medium transition duration-300 text-brand-secondary"
        onClick={() => setPanelOpen(!panelOpen)}
      >
        <FaBell className="text-xl" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
            {unreadNotificationsCount}
          </span>
        )}
      </button>
      {panelOpen && (
        <div ref={panelRef}>
          <NotificationPanel
            notifications={notifications}
            setNotifications={setNotifications}
            closePanel={() => setPanelOpen(false)}
            handleNotificationClick={handleNotificationClick}
            setUnreadNotificationsCount={setUnreadNotificationsCount}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
