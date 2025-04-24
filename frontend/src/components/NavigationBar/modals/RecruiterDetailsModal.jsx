// RecruiterDetailsModal.jsx
import Swal from "sweetalert2";

// This function handles editing a recruiter's personal detail (like Date of Birth or Company Website)
// It uses the recruiter's state (instead of fetching it) and updates the state upon success.
const handleEditRecruiterPersonalDetail = async (user, type, label, navigate, location) => {
  try {
    const token = localStorage.getItem("token");

    // Get the current value directly from the recruiter state
    let currentValue = "Not set";
    if (type.toLowerCase() === "dob") {
      // Use user.dateOfBirth instead of user.dob
      currentValue = user.dateOfBirth || "Not set";
      if (currentValue !== "Not set") {
        currentValue = new Date(currentValue).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
    } else if (type.toLowerCase() === "companywebsite") {
      // For website URLs, just show a simplified version or placeholder
      const rawValue = user.companyWebsite || "Not set";
      
      // If we have a URL, display it in a simplified form
      if (rawValue !== "Not set") {
        try {
          // Try to create a URL object to parse it
          const url = new URL(rawValue);
          // Just display the hostname without protocol
          currentValue = url.hostname;
        } catch (e) {
          // If URL parsing fails, just use the raw value
          currentValue = rawValue;
        }
      } else {
        currentValue = "Not set";
      }
    } else if (type.toLowerCase() === "companysize") {
      // For company size, display the value directly
      currentValue = user.companySize || "Not set";
    }

    // Add styles for the detail edit modal
    const addDetailEditStyles = () => {
      const styleElement = document.createElement('style');
      styleElement.id = 'recruiter-edit-modal-styles';
      styleElement.innerHTML = `
        .recruiter-edit-modal-container {
          backdrop-filter: blur(8px);
        }
        
        .recruiter-edit-modal-popup {
          border-radius: 20px;
          background: linear-gradient(145deg, #ffffff, #f8f9ff);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05);
          padding: 28px;
          border: 1px solid rgba(230, 230, 250, 0.4);
          max-width: 420px;
        }
        
        .recruiter-edit-modal-title {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 700;
          font-size: 1.6rem;
          color: #1a202c;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .recruiter-edit-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 10px;
        }
        
        .recruiter-current-value {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: #f1f5f9;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 15px;
          color: #475569;
        }
        
        .recruiter-current-value-label {
          font-weight: 500;
          margin-right: 5px;
        }
        
        .recruiter-current-value-text {
          font-weight: 600;
          color: #1e293b;
          word-break: break-word;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .recruiter-edit-input {
          width: 100%;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background-color: #f8faff;
          font-size: 15px;
          transition: all 0.3s ease;
        }
        
        .recruiter-edit-input:focus {
          outline: none;
          border-color: #4f74e3;
          box-shadow: 0 0 0 3px rgba(79, 116, 227, 0.15);
        }
        
        .recruiter-edit-input[type="date"] {
          appearance: none;
          -webkit-appearance: none;
          color: #4a5568;
        }
        
        .recruiter-edit-input[type="number"] {
          appearance: none;
          -webkit-appearance: none;
          color: #4a5568;
        }
        
        .recruiter-edit-input[type="number"]::-webkit-inner-spin-button,
        .recruiter-edit-input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        .recruiter-btn-update, 
        .recruiter-btn-reset, 
        .recruiter-btn-cancel {
          border-radius: 14px;
          font-weight: 500;
          padding: 12px 20px;
          font-size: 14px;
          transition: all 0.2s ease;
          border: none;
          outline: none;
          margin: 0 4px;
        }
        
        .swal2-actions {
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
        }
        
        .recruiter-btn-update {
          background: linear-gradient(135deg, #4f74e3, #7662e0);
          color: white;
          box-shadow: 0 4px 12px rgba(79, 116, 227, 0.2);
        }
        
        .recruiter-btn-update:hover {
          background: linear-gradient(135deg, #3a61d9, #6450d9);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(79, 116, 227, 0.3);
        }
        
        .recruiter-btn-reset {
          background: #fff;
          color: #e11d48;
          border: 1px solid rgba(225, 29, 72, 0.2);
        }
        
        .recruiter-btn-reset:hover {
          background: #fff5f7;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(225, 29, 72, 0.15);
        }
        
        .recruiter-btn-cancel {
          background: white;
          color: #6c757d;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .recruiter-btn-cancel:hover {
          background: #f8f9fa;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        @media screen and (max-width: 480px) {
          .recruiter-btn-update, 
          .recruiter-btn-reset, 
          .recruiter-btn-cancel {
            padding: 10px 16px;
            font-size: 13px;
            margin-bottom: 8px;
            width: auto;
          }
          
          .swal2-actions {
            flex-direction: column;
            width: 100%;
          }
          
          .swal2-styled {
            margin: 4px 0 !important;
          }
        }
      `;
      document.head.appendChild(styleElement);
    };

    // Choose an input field type based on the detail type
    let inputField = "";
    if (type.toLowerCase() === "dob") {
      inputField = `<input type="date" id="swal-input-new" class="recruiter-edit-input" />`;
    } else if (type.toLowerCase() === "companywebsite") {
      inputField = `<input id="swal-input-new" class="recruiter-edit-input" placeholder="Enter new ${label}" />`;
    } else if (type.toLowerCase() === "companysize") {
      // For company size, restrict input to digits only using pattern attribute
      inputField = `<input type="number" min="1" pattern="\\d*" id="swal-input-new" class="recruiter-edit-input" placeholder="Enter new ${label}" />`;
    }

    // Display a SweetAlert modal for updating or resetting the detail
    const { isConfirmed, isDenied, value: newValue } = await Swal.fire({
      title: `Update ${label}`,
      customClass: {
        container: 'recruiter-edit-modal-container',
        popup: 'recruiter-edit-modal-popup',
        title: 'recruiter-edit-modal-title',
        confirmButton: 'recruiter-btn-update',
        denyButton: 'recruiter-btn-reset',
        cancelButton: 'recruiter-btn-cancel',
      },
      buttonsStyling: false,
      showClass: {
        popup: 'animate__animated animate__fadeIn'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOut'
      },
      html: `
        <div class="recruiter-edit-form">
          <div class="recruiter-current-value">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="${type.toLowerCase() === 'dob' ? 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' : type.toLowerCase() === 'companywebsite' ? 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' : 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'}" />
            </svg>
            <span>
              <span class="recruiter-current-value-label">Current:</span>
              <span class="recruiter-current-value-text">${currentValue}</span>
            </span>
          </div>
          ${inputField}
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      showDenyButton: type.toLowerCase() !== "companysize",
      confirmButtonText: "Update",
      denyButtonText: "Reset",
      didOpen: () => {
        addDetailEditStyles();
        
        // Set date field to current value if available
        if (type.toLowerCase() === "dob" && currentValue !== "Not set") {
          try {
            // Convert DD/MM/YYYY to YYYY-MM-DD for the input field
            const parts = currentValue.split('/');
            const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            document.getElementById("swal-input-new").value = isoDate;
          } catch (error) {
            console.error("Error setting date:", error);
          }
        }
        
        // For company size, add input event listener to prevent non-numeric input
        if (type.toLowerCase() === "companysize") {
          const inputElement = document.getElementById("swal-input-new");
          if (inputElement) {
            // Restrict input to only digits
            inputElement.addEventListener('input', function(e) {
              // Replace any non-digit with empty string
              const curValue = e.target.value;
              const newValue = curValue.replace(/[^0-9]/g, '');
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
          Swal.showValidationMessage(`Please enter a valid ${label}`);
          return false;
        }
        
        // URL validation for company website
        if (type.toLowerCase() === "companywebsite" && inputValue) {
          // Define valid URL pattern (must start with https:// and have at least one dot in the domain)
          const urlPattern = /^https:\/\/[a-zA-Z0-9][\w-]*(\.[a-zA-Z0-9][\w-]*)+([\/\?\#].*)?$/;
          
          if (!urlPattern.test(inputValue)) {
            Swal.showValidationMessage(
              `Please enter a valid URL starting with "https://" and containing a domain (example: https://example.com)`
            );
            return false;
          }
        }
        
        // Company size validation
        if (type.toLowerCase() === "companysize" && inputValue) {
          // Basic checking for numbers only - pattern attribute and input event handler already restrict this
          const size = parseInt(inputValue);
          
          if (isNaN(size) || size < 1) {
            Swal.showValidationMessage(`Company size must be at least 1`);
            return false;
          }
        }
        
        return inputValue;
      },
    });

    if (isConfirmed) {
      // Show loading state
      Swal.fire({
        title: "Updating...",
        html: "Please wait while we update your information.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        customClass: {
          popup: 'recruiter-edit-modal-popup',
          title: 'recruiter-edit-modal-title',
        }
      });
      
      // Format the value before sending (ensure website URLs are properly formatted)
      let valueToSend = newValue;
      
      if (type.toLowerCase() === "companywebsite" && newValue) {
        // Ensure the URL is properly formatted
        if (!newValue.startsWith("https://")) {
          valueToSend = `https://${newValue}`;
        }
      }
      
      // If update is confirmed, send a POST request with the new detail value
      const updateResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/recruiter-personal/update-recruiter-details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.email,
            type,
            value: valueToSend,
          }),
        }
      );
      const updateData = await updateResponse.json();
      if (!updateResponse.ok) {
        throw new Error(updateData.message || "Failed to update detail");
      }
      // Update recruiter state in the navigation state and navigate to the current location
      location.state.user = updateData.updatedUser;
      navigate(location.pathname, { state: location.state });
      
      Swal.fire({
        icon: "success",
        title: "Updated Successfully",
        text: `Your ${label} has been updated.`,
        customClass: {
          popup: 'recruiter-edit-modal-popup',
          title: 'recruiter-edit-modal-title',
          confirmButton: 'recruiter-btn-update',
        },
        buttonsStyling: false
      });
    } else if (isDenied) {
      // Show loading state
      Swal.fire({
        title: "Resetting...",
        html: "Please wait while we reset your information.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        customClass: {
          popup: 'recruiter-edit-modal-popup',
          title: 'recruiter-edit-modal-title',
        }
      });
      
      // If reset is chosen, send a POST request to reset the detail
      const resetResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/recruiter-personal/reset-recruiter-details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.email,
            type,
          }),
        }
      );
      const resetData = await resetResponse.json();
      if (!resetResponse.ok) {
        throw new Error(resetData.message || `Failed to reset ${label}`);
      }
      // Update recruiter state and navigate with the updated state
      location.state.user = resetData.updatedUser;
      navigate(location.pathname, { state: location.state });
      
      Swal.fire({
        icon: "info",
        title: "Reset Complete",
        text: resetData.message,
        customClass: {
          popup: 'recruiter-edit-modal-popup',
          title: 'recruiter-edit-modal-title',
          confirmButton: 'recruiter-btn-update',
        },
        buttonsStyling: false
      });
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
      customClass: {
        popup: 'recruiter-edit-modal-popup',
        title: 'recruiter-edit-modal-title',
        confirmButton: 'recruiter-btn-update',
      },
      buttonsStyling: false
    });
  }
};

// This function shows the recruiter details modal with buttons to update details.
// We now pass navigate and location so that we can update the recruiter state on success.
export const showRecruiterDetailsModal = (user, navigate, location) => {
  // Add styles for the main modal
  const addMainModalStyles = () => {
    const styleElement = document.createElement('style');
    styleElement.id = 'recruiter-main-modal-styles';
    styleElement.innerHTML = `
      .recruiter-main-modal-container {
        backdrop-filter: blur(8px);
      }
      
      .recruiter-main-modal-popup {
        border-radius: 20px;
        background: linear-gradient(145deg, #ffffff, #f8f9ff);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05);
        padding: 28px;
        border: 1px solid rgba(230, 230, 250, 0.4);
        max-width: 420px;
      }
      
      .recruiter-main-modal-title {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-weight: 700;
        font-size: 1.6rem;
        color: #1a202c;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .recruiter-main-modal-options {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 10px;
      }
      
      .recruiter-option-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        border-radius: 14px;
        background-color: white;
        border: 1px solid #e5e7eb;
        font-size: 15px;
        font-weight: 500;
        color: #4b5563;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      
      .recruiter-option-btn:hover {
        background-color: #f5f7ff;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(79, 116, 227, 0.1);
        border-color: #cbd5e1;
      }
      
      .recruiter-option-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: #f1f5f9;
        color: #3b82f6;
      }
      
      .recruiter-option-content {
        display: flex;
        flex-direction: column;
      }
      
      .recruiter-option-title {
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 2px;
      }
      
      .recruiter-option-desc {
        font-size: 13px;
        color: #64748b;
      }
      
      .recruiter-btn-close {
        border-radius: 14px;
        font-weight: 500;
        padding: 12px 24px;
        font-size: 15px;
        transition: all 0.2s ease;
        border: none;
        outline: none;
        background: white;
        color: #6c757d;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .recruiter-btn-close:hover {
        background: #f8f9fa;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    `;
    document.head.appendChild(styleElement);
  };

  Swal.fire({
    title: "Personal Information",
    customClass: {
      container: 'recruiter-main-modal-container',
      popup: 'recruiter-main-modal-popup',
      title: 'recruiter-main-modal-title',
      confirmButton: 'recruiter-btn-close',
    },
    buttonsStyling: false,
    showClass: {
      popup: 'animate__animated animate__fadeIn'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOut'
    },
    html: `
      <div class="recruiter-main-modal-options">
        <button id="recruiter-change-dob" class="recruiter-option-btn">
          <div class="recruiter-option-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="recruiter-option-content">
            <span class="recruiter-option-title">Date of Birth</span>
            <span class="recruiter-option-desc">Update your date of birth</span>
          </div>
        </button>
        <button id="recruiter-change-company" class="recruiter-option-btn">
          <div class="recruiter-option-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <div class="recruiter-option-content">
            <span class="recruiter-option-title">Company Website</span>
            <span class="recruiter-option-desc">Update your company's website URL</span>
          </div>
        </button>
        <button id="recruiter-change-company-size" class="recruiter-option-btn">
          <div class="recruiter-option-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div class="recruiter-option-content">
            <span class="recruiter-option-title">Company Size</span>
            <span class="recruiter-option-desc">Update your company's employee count</span>
          </div>
        </button>
      </div>
    `,
    showCancelButton: false,
    confirmButtonText: "Close",
    focusConfirm: false,
    didOpen: () => {
      addMainModalStyles();
      
      // Use a short delay to ensure that the buttons are rendered before attaching event listeners
      setTimeout(() => {
        const changeDob = document.getElementById("recruiter-change-dob");
        if (changeDob) {
          changeDob.addEventListener("click", () => {
            showEditRecruiterDetail("dob", "Date of Birth", user, navigate, location);
          });
        }
        const changeCompany = document.getElementById("recruiter-change-company");
        if (changeCompany) {
          changeCompany.addEventListener("click", () => {
            showEditRecruiterDetail("companywebsite", "Company Website", user, navigate, location);
          });
        }
        const changeCompanySize = document.getElementById("recruiter-change-company-size");
        if (changeCompanySize) {
          changeCompanySize.addEventListener("click", () => {
            showEditRecruiterDetail("companysize", "Company Size", user, navigate, location);
          });
        }
      }, 100);
    },
  });
};

// Helper function to trigger the editing modal for a specific recruiter detail
const showEditRecruiterDetail = async (type, label, user, navigate, location) => {
  // Close the main modal first to avoid stacking
  Swal.close();
  
  // Small delay to ensure smooth transition between modals
  setTimeout(async () => {
    await handleEditRecruiterPersonalDetail(user, type, label, navigate, location);
  }, 300);
};

export default showRecruiterDetailsModal;
