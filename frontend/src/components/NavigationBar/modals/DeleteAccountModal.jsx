import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FaExclamationTriangle } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const DeleteAccountModal = ({ onConfirm, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-brand-secondary p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-center mb-4">
          <FaExclamationTriangle className="text-red-500 text-4xl" />
        </div>
        <h2 className="text-2xl font-bold text-brand-primary text-center mb-4">Delete Account</h2>
        <p className="text-brand-primary text-center mb-6">
          Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            disabled={isLoading}
            onClick={onClose}
            className={`px-4 py-2 bg-brand-primary text-brand-secondary rounded hover:bg-opacity-90 transition duration-300 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Cancel
          </button>
          <button
            disabled={isLoading}
            onClick={handleConfirm}
            className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300 flex items-center justify-center min-w-[120px] ${
              isLoading ? 'opacity-90 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              'Delete Account'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const showDeleteAccountModal = (onConfirm) => {
  const modal = document.createElement('div');
  document.body.appendChild(modal);

  const cleanup = () => {
    document.body.removeChild(modal);
  };

  const app = (
    <DeleteAccountModal
      onConfirm={async () => {
        await onConfirm();
        cleanup();
      }}
      onClose={cleanup}
    />
  );

  ReactDOM.render(app, modal);
};

export default showDeleteAccountModal; 