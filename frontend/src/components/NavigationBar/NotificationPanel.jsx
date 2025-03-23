// NotificationPanel.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaComments, FaUser, FaCheckCircle } from 'react-icons/fa';


const NotificationPanel = ({ notifications, setNotifications, closePanel, handleNotificationClick, setUnreadNotificationsCount }) => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Function to delete a single notification
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

  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-96 bg-white border rounded-lg shadow-lg z-50">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleDeleteAllNotifications}
            className="text-sm text-red-500 hover:text-red-700 focus:outline-none"
          >
            Delete All
          </button>
        </div>
      </div>
      <ul className="max-h-80 overflow-y-auto">
        {notifications.sort((a, b) => new Date(b.date) - new Date(a.date)).map((notification) => (
          <li
          key={notification._id}
          onClick={async () => {
            closePanel();
            await markAsReadNotification(notification);
            handleNotificationClick(notification);
          }}
          className={`
            relative flex items-center p-4 cursor-pointer 
            mb-2 
            ${
              notification.read
                ? "bg-gray-100 text-gray-400 line-through" // read style
                : "bg-orange-50 text-black font-semibold border-l-4 border-orange-400" // unread style
            }
            hover:bg-gray-200
          `}
        >
          {/* Corner Ribbon for UNREAD */}
          {!notification.read && (
            <div className="absolute top-0 left-0">
              <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 transform -rotate-45 translate-y-1/4 -translate-x-1/4 rounded-lg">
                NEW
              </div>
            </div>
          )}
        
          {/* Left Pane: Icon (10% width) */}
          {notification.type === "chat" ? (
            <div className="p-4 w-[10%] flex justify-center">
              <FaComments className="w-8 h-8 text-blue-500 flex-shrink-0" />
            </div>
          ) : notification.type === "apply" ? (
            <div className="p-4 w-[10%] flex justify-center">
              <FaUser className="w-8 h-8 text-green-500 flex-shrink-0" />
            </div>
          ) : null}
        
          {/* Message Text (80% width) */}
          <div
            className={`
              p-4 w-[80%] flex flex-col justify-center break-words
              ${notification.read ? "line-through" : ""}
            `}
          >
            <p className="text-sm">
              {notification.message}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(notification.date).toLocaleString()}
            </p>
          </div>
        
          {/* Right Pane: Delete Button (10% width) */}
          <div className="p-4 w-[10%] flex justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering li onClick
                handleDeleteNotification(notification._id);
              }}
              className="p-1 text-red-500 hover:bg-red-100 focus:outline-none rounded-full"
            >
              X
            </button>
          </div>
        </li>
          
        ))}
      </ul>
    </div>
  );
};

export default NotificationPanel;
