import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaComments } from 'react-icons/fa';


const NotificationPanel = ({ notifications, onClose, handleNotificationClick }) => {
    const navigate = useNavigate();
    const { state } = useLocation();
    return (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
        <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <button onClick={onClose} className="text-gray-600">X</button>
        </div>
        <ul className="max-h-80 overflow-y-auto">
        {notifications.map((notification) => (
            <li
            key={notification._id}
            className="flex items-center p-4 border-b hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              if (notification.type === "chat") {
                navigate(notification.extraData.goToRoute, {
                  state: { ...state, ...notification.extraData.stateAddition }
                });
              }
              onClose();
              handleNotificationClick(notification);
            }}
          >
            {notification.type === "chat" && (
              <FaComments className="w-8 h-8 text-blue-500 mr-4 flex-shrink-0" />
            )}
            <div className="flex flex-col justify-center">
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs text-gray-500">{new Date(notification.date).toLocaleString()}</p>
            </div>
          </li>
          
          
        ))}
        </ul>

        </div>
    );
};

export default NotificationPanel;
