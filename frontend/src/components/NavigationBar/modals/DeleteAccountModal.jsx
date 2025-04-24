import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Initialize SweetAlert with React Content
const MySwal = withReactContent(Swal);

const DeleteAccountModal = ({ onConfirm, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Add styles when modal opens
  const addStyles = () => {
    const styleElement = document.createElement('style');
    styleElement.id = 'delete-account-modal-styles';
    styleElement.innerHTML = `
      .delete-modal-container {
        backdrop-filter: blur(8px);
      }
      
      .delete-modal-popup {
        border-radius: 20px;
        background: linear-gradient(145deg, #ffffff, #f8f9ff);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05);
        padding: 28px;
        border: 1px solid rgba(230, 230, 250, 0.4);
        max-width: 420px;
      }
      
      .delete-modal-title {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-weight: 700;
        font-size: 1.6rem;
        color: #1a202c;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .delete-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
      }
      
      .delete-warning-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 70px;
        height: 70px;
        background-color: #fff5f5;
        border-radius: 50%;
        margin-bottom: 24px;
        color: #e53e3e;
      }
      
      .delete-warning-icon svg {
        width: 32px;
        height: 32px;
      }
      
      .delete-description {
        text-align: center;
        color: #4a5568;
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 28px;
      }
      
      .delete-btn-group {
        display: flex;
        gap: 12px;
        width: 100%;
        justify-content: center;
      }
      
      .delete-btn-cancel {
        background: white;
        color: #6c757d;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-radius: 14px;
        font-weight: 500;
        padding: 12px 24px;
        font-size: 15px;
        transition: all 0.2s ease;
        border: none;
        min-width: 120px;
      }
      
      .delete-btn-cancel:hover {
        background: #f8f9fa;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      .delete-btn-delete {
        background: linear-gradient(135deg, #f56565, #e53e3e);
        color: white;
        box-shadow: 0 4px 12px rgba(229, 62, 62, 0.25);
        border-radius: 14px;
        font-weight: 500;
        padding: 12px 24px;
        font-size: 15px;
        transition: all 0.2s ease;
        border: none;
        min-width: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      .delete-btn-delete:hover {
        background: linear-gradient(135deg, #e53e3e, #c53030);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(229, 62, 62, 0.35);
      }
      
      .delete-spinner {
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      
      /* Responsive styles */
      @media screen and (max-width: 480px) {
        .delete-btn-cancel, 
        .delete-btn-delete {
          padding: 10px 16px;
          font-size: 14px;
        }
      }
    `;
    document.head.appendChild(styleElement);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 delete-modal-container">
      <div className="delete-modal-popup">
        <div className="delete-container">
          <div className="delete-warning-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h2 className="delete-modal-title">Delete Account</h2>
          <p className="delete-description">
            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
          </p>
          <div className="delete-btn-group">
            <button
              disabled={isLoading}
              onClick={onClose}
              className="delete-btn-cancel"
            >
              Cancel
            </button>
            <button
              disabled={isLoading}
              onClick={handleConfirm}
              className="delete-btn-delete"
            >
              {isLoading ? (
                <>
                  <svg className="delete-spinner" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const showDeleteAccountModal = (onConfirm) => {
  // Create a container element for the modal
  const modal = document.createElement('div');
  
  // Add the modal container to the body
  document.body.appendChild(modal);
  
  // Function to remove the modal from the DOM
  const cleanup = () => {
    // Check if modal still exists before attempting removal
    if (document.body.contains(modal)) {
      ReactDOM.unmountComponentAtNode(modal);
      document.body.removeChild(modal);
      
      // Remove any added styles
      const styles = document.getElementById('delete-account-modal-styles');
      if (styles) {
        styles.remove();
      }
    }
  };

  // Add styles
  const styles = document.createElement('style');
  styles.id = 'delete-account-modal-styles';
  styles.innerHTML = `
    .fixed {
      position: fixed;
    }
    .inset-0 {
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }
    .z-50 {
      z-index: 50;
    }
    .flex {
      display: flex;
    }
    .items-center {
      align-items: center;
    }
    .justify-center {
      justify-content: center;
    }
  `;
  document.head.appendChild(styles);

  // Render the DeleteAccountModal component inside the container
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
  
  // Initialize styles inside the modal
  const modalElement = document.querySelector('.delete-modal-container');
  if (modalElement) {
    const addStyles = () => {
      const styleElement = document.createElement('style');
      styleElement.id = 'delete-account-modal-styles';
      document.head.appendChild(styleElement);
    };
    addStyles();
  }
};

// You can also create a more modern version using SweetAlert directly
export const showDeleteAccountSweetAlert = (onConfirm) => {
  // Add styles
  const addStyles = () => {
    const styleElement = document.createElement('style');
    styleElement.id = 'delete-account-modal-styles';
    styleElement.innerHTML = `
      .delete-modal-container {
        backdrop-filter: blur(8px);
      }
      
      .delete-modal-popup {
        border-radius: 20px;
        background: linear-gradient(145deg, #ffffff, #f8f9ff);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05);
        padding: 28px;
        border: 1px solid rgba(230, 230, 250, 0.4);
        max-width: 420px;
      }
      
      .delete-modal-title {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-weight: 700;
        font-size: 1.6rem;
        color: #1a202c;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .delete-btn-delete {
        background: linear-gradient(135deg, #f56565, #e53e3e);
        color: white;
        box-shadow: 0 4px 12px rgba(229, 62, 62, 0.25);
        border-radius: 14px;
        font-weight: 500;
        padding: 12px 24px;
        font-size: 15px;
        transition: all 0.2s ease;
        border: none;
      }
      
      .delete-btn-delete:hover {
        background: linear-gradient(135deg, #e53e3e, #c53030);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(229, 62, 62, 0.35);
      }
      
      .delete-btn-cancel {
        background: white;
        color: #6c757d;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-radius: 14px;
        font-weight: 500;
        padding: 12px 24px;
        font-size: 15px;
        transition: all 0.2s ease;
        border: none;
      }
      
      .delete-btn-cancel:hover {
        background: #f8f9fa;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    `;
    document.head.appendChild(styleElement);
  };

  // Initialize SweetAlert modal
  MySwal.fire({
    title: 'Delete Account',
    html: `
      <div class="delete-container">
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 10px; text-align: center;">
          Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
        </p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete Account',
    cancelButtonText: 'Cancel',
    customClass: {
      container: 'delete-modal-container',
      popup: 'delete-modal-popup',
      title: 'delete-modal-title',
      confirmButton: 'delete-btn-delete',
      cancelButton: 'delete-btn-cancel',
    },
    buttonsStyling: false,
    showClass: {
      popup: 'animate__animated animate__fadeIn'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOut'
    },
    didOpen: () => {
      addStyles();
    },
    preConfirm: async () => {
      try {
        MySwal.showLoading();
        await onConfirm();
        return true;
      } catch (error) {
        MySwal.showValidationMessage(`Failed to delete account: ${error.message}`);
        return false;
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      MySwal.fire({
        title: 'Account Deleted',
        text: 'Your account has been successfully deleted.',
        icon: 'success',
        customClass: {
          popup: 'delete-modal-popup',
          title: 'delete-modal-title',
          confirmButton: 'delete-btn-delete',
        },
        buttonsStyling: false
      });
    }
  });
};

export default showDeleteAccountSweetAlert; 