import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const changeMailSubscriptionStatus = async (user, navigate, location) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "Error",
        text: "No token found. Please log in again.",
        icon: "error",
        customClass: {
          popup: 'subscription-modal-popup',
          title: 'subscription-modal-title',
          confirmButton: 'subscription-confirm-btn'
        },
        buttonsStyling: false
      });
      return;
    }

    // Get current subscription status from the user variable
    const isSubscribed = user.isSubscribed;
    const buttonText = isSubscribed ? "Unsubscribe" : "Subscribe";
    const buttonClass = isSubscribed ? "subscription-unsubscribe-btn" : "subscription-subscribe-btn";

    // Add styles when modal opens
    const addStyles = () => {
      const styleElement = document.createElement('style');
      styleElement.id = 'subscription-modal-styles';
      styleElement.innerHTML = `
        .subscription-modal-container {
          backdrop-filter: blur(8px);
        }
        
        .subscription-modal-popup {
          border-radius: 20px;
          background: linear-gradient(145deg, #ffffff, #f8f9ff);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05);
          padding: 24px;
          border: 1px solid rgba(230, 230, 250, 0.4);
          max-width: 420px;
          width: 100%;
        }
        
        .subscription-modal-title {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 700;
          font-size: 1.6rem;
          color: #1a202c;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .subscription-confirm-btn,
        .subscription-cancel-btn,
        .subscription-subscribe-btn,
        .subscription-unsubscribe-btn {
          border-radius: 14px;
          font-weight: 500;
          padding: 12px 24px;
          margin: 0 8px;
          font-size: 15px;
          transition: all 0.2s ease;
          border: none;
          outline: none;
        }
        
        .subscription-confirm-btn {
          background: #3a61d9;
          color: white;
          box-shadow: 0 4px 12px rgba(58, 97, 217, 0.2);
        }
        
        .subscription-confirm-btn:hover {
          background: #2d4eb8;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(58, 97, 217, 0.3);
        }
        
        .subscription-subscribe-btn {
          background: linear-gradient(135deg, #34d399, #10b981);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }
        
        .subscription-subscribe-btn:hover {
          background: linear-gradient(135deg, #10b981, #059669);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
        }
        
        .subscription-unsubscribe-btn {
          background: linear-gradient(135deg, #f87171, #ef4444);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }
        
        .subscription-unsubscribe-btn:hover {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
        }
        
        .subscription-cancel-btn {
          background: white;
          color: #6c757d;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .subscription-cancel-btn:hover {
          background: #f8f9fa;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }
        
        .subscription-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        
        .subscription-status-label {
          font-size: 16px;
          font-weight: 500;
          color: #4a5568;
          margin: 0;
        }
        
        .subscription-status {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          padding: 8px 20px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .subscription-status-subscribed {
          color: #047857;
          background-color: #d1fae5;
        }
        
        .subscription-status-unsubscribed {
          color: #b91c1c;
          background-color: #fee2e2;
        }
        
        .subscription-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .subscription-message {
          font-size: 15px;
          color: #64748b;
          text-align: center;
          margin: 0;
          max-width: 280px;
        }
        
        .subscription-animation {
          margin-top: 10px;
          width: 80px;
          height: 80px;
          background-position: center;
          background-repeat: no-repeat;
          background-size: contain;
          margin-bottom: 10px;
        }
        
        .subscription-animation-subscribed {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981'%3E%3Cpath d='M9 3.5L4.5 8L9 12.5M9 3.5L14.5 9L20 3.5M9 3.5V2M20 3.5V10.5C20 14.09 17.09 17 13.5 17H4.5' stroke='%2310b981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
        }
        
        .subscription-animation-unsubscribed {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ef4444'%3E%3Cpath d='M9.1 4L4.5 8.6L9.1 13.2M9.1 4L14.5 9.4L19.9 4M9.1 4V2.5M19.9 4V10.5C19.9 14.09 17 17 13.4 17H4.5M18 20L14 16M14 20L18 16' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
        }
      `;
      document.head.appendChild(styleElement);
    };

    // Display the modal with the current status and toggle option
    const result = await MySwal.fire({
      title: "Email Notification Settings",
      customClass: {
        container: 'subscription-modal-container',
        popup: 'subscription-modal-popup',
        title: 'subscription-modal-title',
        confirmButton: buttonClass,
        cancelButton: 'subscription-cancel-btn',
      },
      buttonsStyling: false,
      showClass: {
        popup: 'animate__animated animate__fadeIn'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOut'
      },
      html: `
        <div class="subscription-container">
          <div class="subscription-animation ${isSubscribed ? 'subscription-animation-subscribed' : 'subscription-animation-unsubscribed'}"></div>
          <p class="subscription-status-label">Your current status:</p>
          <div class="subscription-status ${isSubscribed ? 'subscription-status-subscribed' : 'subscription-status-unsubscribed'}">
            <span class="subscription-icon">
              ${isSubscribed 
                ? '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>'
              }
            </span>
            <span>${isSubscribed ? "Subscribed" : "Unsubscribed"}</span>
          </div>
          <p class="subscription-message">
            ${isSubscribed 
              ? "You're currently receiving email notifications. Would you like to unsubscribe?" 
              : "You're not receiving email notifications. Would you like to subscribe?"}
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: buttonText,
      cancelButtonText: "Cancel",
      didOpen: () => {
        addStyles();
      },
      preConfirm: async () => {
        // Update the button to show loading state
        Swal.showLoading();
        
        try {
          // Send PUT request to toggle subscription status
          const postResponse = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/personal/subscribeOrUnsubscribe`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ email: user.email }),
            }
          );

          if (!postResponse.ok) {
            const errorData = await postResponse.json();
            Swal.showValidationMessage(`Request failed: ${errorData.message}`);
            return;
          }

          const postData = await postResponse.json();
          return postData;
        } catch (error) {
          Swal.showValidationMessage(`Request failed: ${error.message}`);
          return;
        }
      },
    });

    if (result.isConfirmed) {
      // Show success message
      Swal.fire({
        title: "Success",
        text: result.value.message,
        icon: "success",
        customClass: {
          popup: 'subscription-modal-popup',
          title: 'subscription-modal-title',
          confirmButton: 'subscription-confirm-btn'
        },
        buttonsStyling: false
      });
      
      // Update the user subscription status locally
      user.isSubscribed = !isSubscribed;
      // Navigate to current location with the updated user object
      navigate(location.pathname, { state: { ...location.state, user } });
    }
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: error.message || "An error occurred",
      icon: "error",
      customClass: {
        popup: 'subscription-modal-popup',
        title: 'subscription-modal-title',
        confirmButton: 'subscription-confirm-btn'
      },
      buttonsStyling: false
    });
  }
};

export default changeMailSubscriptionStatus;
