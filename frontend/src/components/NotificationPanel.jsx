import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
            <li key={notification._id} className="p-4 border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                if (notification.type === "chat") {
                    // Redirect to chat
                    const newState = { ...state, ...notification.extraData.stateAddition };
                    navigate(notification.extraData.goToRoute, {
                        state: { ...state, ...notification.extraData.stateAddition }
                      });
                }
                onClose();
                handleNotificationClick(notification.extraData.stateAddition);
                }}
            >
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-gray-500">{new Date(notification.date).toLocaleString()}</p>
            </li>
            ))}
        </ul>
        </div>
    );
};

export default NotificationPanel;
