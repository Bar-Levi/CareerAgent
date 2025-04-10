// NotificationPanel.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaUser, FaCalendarCheck, FaTrash, FaBell } from 'react-icons/fa';
import classNames from 'classnames';

const NotificationPanel = ({ 
  notifications, 
  setNotifications, 
  closePanel, 
  handleNotificationClick, 
  setUnreadNotificationsCount 
}) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Function to mark a notification as read
  const markAsReadNotification = async (notification) => {
    if (notification.read)
      return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/mark-as-read-notification/${state.user._id}/${notification._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to mark as read notification with ID ${notification._id}`);
      }
      setUnreadNotificationsCount((prev) => prev - 1);
      const data = await response.json();
      const updatedNotifications = data.notifications;
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error marking as read notification:", error.message);
    }
  };

  // Function to delete a single notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/delete-notification/${state.user._id}/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to delete notification with ID ${notificationId}`);
      }
      // Remove the deleted notification from the state
      const updatedNotifications = notifications.filter(
        (notification) => notification._id !== notificationId
      );
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error deleting notification:", error.message);
    }
  };

  // Function to delete all notifications
  const handleDeleteAllNotifications = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/delete-all-notifications/${state.user._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete all notifications");
      }
      // Clear all notifications from state
      setNotifications([]);
    } catch (error) {
      console.error("Error deleting all notifications:", error.message);
    }
  };

  const getNotificationIcon = (type) => {
    const iconClasses = "w-6 h-6";
    switch (type) {
      case 'chat':
        return <FaComments className={`${iconClasses} text-blue-500`} />;
      case 'apply':
        return <FaUser className={`${iconClasses} text-green-500`} />;
      case 'interview':
        return <FaCalendarCheck className={`${iconClasses} text-purple-500`} />;
      default:
        return <FaBell className={`${iconClasses} text-gray-500`} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-96 bg-white rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center space-x-2">
            <FaBell className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={handleDeleteAllNotifications}
            className="text-white/80 hover:text-white transition-colors"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mt-4">
          {['all', 'unread', 'read'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={classNames(
                'px-3 py-1 rounded-full text-sm transition-colors',
                filter === filterType
                  ? 'bg-white text-blue-600'
                  : 'text-white/70 hover:text-white'
              )}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center text-gray-500"
            >
              <FaBell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No notifications</p>
              <p className="text-sm">
                {filter === 'all'
                  ? "You're all caught up!"
                  : `No ${filter} notifications`}
              </p>
            </motion.div>
          ) : (
            filteredNotifications
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((notification) => (
                <motion.div
                  key={notification._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={classNames(
                    'flex items-start p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer',
                    {
                      'bg-blue-100/75': !notification.read,
                      'bg-white': notification.read,
                    }
                  )}
                  onClick={async () => {
                    closePanel();
                    await markAsReadNotification(notification);
                    handleNotificationClick(notification);
                  }}
                >
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className={classNames('text-sm', {
                      'font-semibold text-gray-900': !notification.read,
                      'text-gray-600': notification.read,
                    })}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.date).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="flex-shrink-0 ml-2 w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification._id);
                    }}
                    className="ml-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default NotificationPanel;
