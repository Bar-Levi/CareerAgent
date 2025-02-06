import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaComments } from 'react-icons/fa';

const NotificationPanel = ({ notifications, setNotifications, onClose, handleNotificationClick }) => {
  const navigate = useNavigate();
  const { state } = useLocation();

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
    <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleDeleteAllNotifications}
            className="text-sm text-red-500 hover:text-red-700 focus:outline-none"
          >
            Delete All
          </button>
          <button onClick={onClose} className="text-gray-600 focus:outline-none">
            X
          </button>
        </div>
      </div>
      <ul className="max-h-80 overflow-y-auto">
        {notifications.map((notification) => (
          <li
            key={notification._id}
            className="flex items-center p-4 border-b hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              if (notification.type === "chat") {
                navigate(notification.extraData.goToRoute, {
                  state: { ...state, ...notification.extraData.stateAddition },
                });
              }
              onClose();
              handleNotificationClick(notification);
            }}
          >
            {/* Left Pane: Chat Icon with 10% width */}
            {notification.type === "chat" && (
              <div className="p-4 w-[10%] flex justify-center">
                <FaComments className="w-8 h-8 text-blue-500 flex-shrink-0" />
              </div>
            )}
            {/* Message Text: 80% width */}
            <div className="p-4 w-[80%] flex flex-col justify-center break-words">
              <p className="text-sm">
                {notification.message.length > 20
                  ? notification.message.slice(0, 20) + "..."
                  : notification.message}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(notification.date).toLocaleString()}
              </p>
            </div>
            {/* Right Pane: Delete Button with 10% width */}
            <div className="p-4 w-[10%] flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering li onClick
                  handleDeleteNotification(notification._id);
                }}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
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
