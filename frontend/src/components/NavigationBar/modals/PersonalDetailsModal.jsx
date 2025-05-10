// PersonalDetailsModal.jsx
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// Initialize SweetAlert with React Content
const MySwal = withReactContent(Swal);

// Function to reset a personal detail (e.g., phone, DOB, etc.)
const handleResetPersonalDetail = async (user, type, label, navigate, location) => {
  try {
    const token = localStorage.getItem("token");
    // Send a POST request to reset the specific detail
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/personal/reset-job-seeker-details`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: user.email, type }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Failed to reset ${label}`);
    }
    // Update user in the location state with the updated user object from backend
    location.state.user = data.updatedUser;
    // Navigate to the current path with the updated state
    navigate(location.pathname, { state: location.state });
    MySwal.fire({
      title: "Reset!",
      text: data.message,
      icon: "success",
      customClass: {
        popup: 'personal-modal-popup',
        title: 'personal-modal-title',
        confirmButton: 'personal-btn',
      },
      buttonsStyling: false
    });
  } catch (error) {
    MySwal.fire({
      title: "Error",
      text: error.message,
      icon: "error",
      customClass: {
        popup: 'personal-modal-popup',
        title: 'personal-modal-title',
        confirmButton: 'personal-btn',
      },
      buttonsStyling: false
    });
  }
};

// Function to edit a personal detail using the user state variable
const handleEditPersonalDetail = async (user, type, label, navigate, location) => {
  try {
    const token = localStorage.getItem("token");
    
    // Instead of fetching from the backend, use the user state directly
    let currentValue = "Not set";
    if (type === "dob") {
      currentValue = user.dateOfBirth
        ? new Date(user.dateOfBirth).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          })
        : "Not set";
    } else if (type === "phone") {
      currentValue = user.phone || "Not set";
    } else if (type === "github") {
      currentValue = user.githubUrl || "Not set";
    } else if (type === "linkedin") {
      currentValue = user.linkedinUrl || "Not set";
    }
    
    // Choose input type based on the detail type (date for DOB, text for others)
    const inputField =
      type === "dob"
        ? `<input type="date" id="swal-input-new" class="swal2-input personal-input" />`
        : type === "phone"
        ? `<input id="swal-input-new" class="swal2-input personal-input" placeholder="Enter new ${label}" type="tel" />`
        : `<input id="swal-input-new" class="swal2-input personal-input" placeholder="Enter new ${label}" />`;
    
    // Show a SweetAlert modal with the current value and an input field to update it
    const { isConfirmed, isDenied, value: newValue } = await MySwal.fire({
      title: `Change ${label}`,
      html: `
        <div class="personal-detail-edit">
          <div class="personal-current-value">
            <span class="personal-label">Current ${label}:</span>
            <span class="personal-value">${currentValue}</span>
          </div>
          ${inputField}
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Update",
      denyButtonText: "Reset",
      customClass: {
        popup: 'personal-modal-popup',
        title: 'personal-modal-title',
        confirmButton: 'personal-btn',
        denyButton: 'personal-btn-reset',
        cancelButton: 'personal-btn-cancel',
      },
      buttonsStyling: false,
      didOpen: () => {
        // For phone number input, add validation to allow only numbers and + at beginning
        if (type === "phone") {
          const phoneInput = document.getElementById("swal-input-new");
          if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
              const curValue = e.target.value;
              
              // Only allow + at the beginning and digits elsewhere
              let newValue = '';
              
              // Check each character
              for (let i = 0; i < curValue.length; i++) {
                // Allow + only at the beginning
                if (curValue[i] === '+' && i === 0) {
                  newValue += '+';
                } 
                // Allow digits anywhere
                else if (/\d/.test(curValue[i])) {
                  newValue += curValue[i];
                }
              }
              
              // Update input value if it changed
              if (curValue !== newValue) {
                e.target.value = newValue;
              }
            });
          }
        }
      },
      preConfirm: () => {
        const inputValue = document.getElementById("swal-input-new")?.value;
        if (!inputValue) {
          Swal.showValidationMessage(`Please enter a new ${label}`);
        }
        
        // Age validation for date of birth
        if (type === "dob" && inputValue) {
          const birthDate = new Date(inputValue);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          // Adjust age if birthday hasn't occurred yet this year
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          if (age < 18) {
            Swal.showValidationMessage('You must be at least 18 years old');
            return false;
          }
        }
        
        // Additional validation for phone numbers
        if (type === "phone" && inputValue) {
          // Ensure it contains only digits and possibly a + at the start
          const phoneRegex = /^\+?\d+$/;
          if (!phoneRegex.test(inputValue)) {
            Swal.showValidationMessage(`Phone number must contain only digits, with an optional + at the beginning`);
            return false;
          }
        }
        
        return inputValue;
      },
    });
    
    if (isConfirmed) {
      // If the user confirmed the update, send a POST request with the new detail value
      MySwal.fire({
        title: "Updating...",
        text: `Updating your ${label}`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        customClass: {
          popup: 'personal-modal-popup',
          title: 'personal-modal-title',
        }
      });
      
      const updateResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/personal/update-job-seeker-details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.email,
            type,
            value: newValue,
          }),
        }
      );
      const updateData = await updateResponse.json();
      
      MySwal.close();
      
      if (!updateResponse.ok) {
        throw new Error(updateData.message || "Failed to update detail");
      }
      // Update the user state with the updated user object returned from the backend
      location.state.user = updateData.updatedUser;
      navigate(location.pathname, { state: location.state });
      MySwal.fire({
        title: "Updated!",
        text: `Your ${label} has been updated.`,
        icon: "success",
        customClass: {
          popup: 'personal-modal-popup',
          title: 'personal-modal-title',
          confirmButton: 'personal-btn',
        },
        buttonsStyling: false
      });
    } else if (isDenied) {
      // If the user chose to reset the detail, call the reset handler
      await handleResetPersonalDetail(user, type, label, navigate, location);
    }
  } catch (error) {
    console.error(error);
    MySwal.fire({
      title: "Error",
      text: error.message,
      icon: "error",
      customClass: {
        popup: 'personal-modal-popup',
        title: 'personal-modal-title',
        confirmButton: 'personal-btn',
      },
      buttonsStyling: false
    });
  }
};

// Main function to show the personal details modal for job seekers
export const showJobSeekerPersonalDetailsModal = (user, navigate, location) => {
  // Add styles when modal opens
  const addStyles = () => {
    const styleElement = document.createElement('style');
    styleElement.id = 'personal-modal-styles';
    styleElement.innerHTML = `
      .personal-modal-container {
        backdrop-filter: blur(8px);
      }
      
      .personal-modal-popup {
        border-radius: 20px;
        background: linear-gradient(145deg, #ffffff, #f8f9ff);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05);
        padding: 28px;
        border: 1px solid rgba(230, 230, 250, 0.4);
        max-width: 420px;
      }
      
      .personal-modal-title {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-weight: 700;
        font-size: 1.6rem;
        color: #1a202c;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .personal-detail-option {
        display: flex;
        align-items: center;
        padding: 14px 16px;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        background-color: #f8fafc;
        margin-bottom: 12px;
        transition: all 0.2s ease;
        cursor: pointer;
      }
      
      .personal-detail-option:hover {
        background-color: #f1f5f9;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        border-color: #cbd5e0;
      }
      
      .personal-detail-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #f0f4ff, #e6eeff);
        border-radius: 8px;
        margin-right: 12px;
        color: #4f74e3;
      }
      
      .personal-detail-text {
        font-weight: 500;
        font-size: 15px;
        color: #4a5568;
      }
      
      .personal-detail-edit {
        padding: 16px;
        border-radius: 12px;
        background-color: #f8fafc;
        margin-bottom: 16px;
      }
      
      .personal-current-value {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 16px;
      }
      
      .personal-label {
        font-size: 14px;
        color: #718096;
      }
      
      .personal-value {
        font-size: 16px;
        font-weight: 500;
        color: #4a5568;
        word-break: break-all;
      }
      
      .personal-input {
        width: 100% !important;
        border-radius: 12px !important;
        border: 1px solid #e2e8f0 !important;
        padding: 12px 16px !important;
        font-size: 15px !important;
        transition: all 0.2s ease !important;
        margin: 0 !important;
        box-shadow: none !important;
      }
      
      .personal-input:focus {
        border-color: #4f74e3 !important;
        box-shadow: 0 0 0 2px rgba(79, 116, 227, 0.1) !important;
      }
      
      .personal-btn, 
      .personal-btn-reset,
      .personal-btn-cancel {
        border-radius: 14px;
        font-weight: 500;
        padding: 12px 24px;
        font-size: 15px;
        transition: all 0.2s ease;
        border: none;
        outline: none;
        margin: 0 5px; /* Add margin between buttons to prevent overflow */
      }
      
      .personal-btn {
        background: linear-gradient(135deg, #4f74e3, #7662e0);
        color: white;
        box-shadow: 0 4px 12px rgba(79, 116, 227, 0.2);
      }
      
      .personal-btn:hover {
        background: linear-gradient(135deg, #3a61d9, #6450d9);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(79, 116, 227, 0.3);
      }
      
      .personal-btn-reset {
        background: white;
        color: #e53e3e;
        border: 1px solid rgba(229, 62, 62, 0.2);
      }
      
      .personal-btn-reset:hover {
        background: #fff5f5;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(229, 62, 62, 0.15);
      }
      
      .personal-btn-cancel {
        background: white;
        color: #6c757d;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .personal-btn-cancel:hover {
        background: #f8f9fa;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .personal-btn-close {
        background: #f3f4f6;
        color: #4b5563;
        border: 1px solid #e5e7eb;
      }

      .personal-btn-close:hover {
        background: #e5e7eb;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      /* Add styles to fix the button container */
      .swal2-actions {
        flex-wrap: nowrap !important;
        margin: 1.25em auto 0 !important;
        width: 100% !important;
        justify-content: center !important;
        gap: 0.625em !important;
      }
      
      /* Responsive styles */
      @media screen and (max-width: 480px) {
        .personal-btn, 
        .personal-btn-reset,
        .personal-btn-cancel,
        .personal-btn-close {
          padding: 10px 16px;
          font-size: 14px;
          /* For very small screens, allow buttons to wrap */
          margin: 0 0 5px 0;
        }
        
        .swal2-actions {
          flex-wrap: wrap !important;
        }
      }
    `;
    document.head.appendChild(styleElement);
  };

  MySwal.fire({
    title: "Personal Details",
    html: `
      <div class="personal-details-container">
        <div class="personal-detail-option" id="change-dob">
          <div class="personal-detail-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <span class="personal-detail-text">Date of Birth</span>
        </div>
        
        <div class="personal-detail-option" id="change-phone">
          <div class="personal-detail-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <span class="personal-detail-text">Phone Number</span>
        </div>
        
        <div class="personal-detail-option" id="change-github">
          <div class="personal-detail-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </div>
          <span class="personal-detail-text">GitHub URL</span>
        </div>
        
        <div class="personal-detail-option" id="change-linkedin">
          <div class="personal-detail-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </div>
          <span class="personal-detail-text">LinkedIn URL</span>
        </div>
      </div>
    `,
    showCancelButton: false,
    confirmButtonText: "Close",
    focusConfirm: false,
    customClass: {
      container: 'personal-modal-container',
      popup: 'personal-modal-popup',
      title: 'personal-modal-title',
      confirmButton: 'personal-btn-cancel',
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
      
      // Use a short timeout to ensure the elements have rendered before attaching event listeners
      setTimeout(() => {
        const changeDob = document.getElementById("change-dob");
        if (changeDob) {
          changeDob.addEventListener("click", () => {
            handleEditPersonalDetail(user, "dob", "Date of Birth", navigate, location);
          });
        }
        const changePhone = document.getElementById("change-phone");
        if (changePhone) {
          changePhone.addEventListener("click", () => {
            handleEditPersonalDetail(user, "phone", "Phone Number", navigate, location);
          });
        }
        const changeGithub = document.getElementById("change-github");
        if (changeGithub) {
          changeGithub.addEventListener("click", () => {
            handleEditPersonalDetail(user, "github", "Github URL", navigate, location);
          });
        }
        const changeLinkedin = document.getElementById("change-linkedin");
        if (changeLinkedin) {
          changeLinkedin.addEventListener("click", () => {
            handleEditPersonalDetail(user, "linkedin", "LinkedIn URL", navigate, location);
          });
        }
      }, 100);
    },
  });
};

export default showJobSeekerPersonalDetailsModal;
