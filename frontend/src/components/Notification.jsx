import React, { useEffect } from 'react';

const Notification = ({ type = 'success', message, onClose }) => {
    useEffect(() => {
        // Auto-close notification after 4 seconds
        const timer = setTimeout(() => {
            onClose();
        }, 4000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor =
        type === 'success'
            ? 'bg-green-500'
            : type === 'error'
            ? 'bg-red-500'
            : 'bg-blue-500';

    return (
        <div className="fixed top-0 left-0 right-0 flex justify-center">
            <div
                className={`inline-block px-6 py-3 ${bgColor} text-white text-sm font-medium rounded-lg shadow-lg animate-slide-down`}
                role="alert"
            >
                {message}
            </div>
        </div>
    );
};

export default Notification;
