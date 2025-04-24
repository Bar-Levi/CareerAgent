import Swal from "sweetalert2";
import CryptoJS from "crypto-js";

const showChangePasswordModal = async (user) => {
  const { value: formValues } = await Swal.fire({
    title: "Change Password",
    customClass: {
      container: 'change-password-modal-container',
      popup: 'change-password-modal-popup',
      title: 'change-password-modal-title',
      confirmButton: 'change-password-confirm-btn',
      cancelButton: 'change-password-cancel-btn',
    },
    html: `
      <div class="password-form-container">
        <div class="password-input-group">
          <div class="password-input-wrapper">
            <i id="toggle-old-password" class="fa fa-eye-slash toggle-password-icon"></i>
            <input type="password" id="old-password" class="password-input" placeholder="Old Password">
          </div>
        </div>
        
        <div class="password-input-group">
          <div class="password-input-wrapper">
            <i id="toggle-new-password" class="fa fa-eye-slash toggle-password-icon"></i>
            <input type="password" id="new-password" class="password-input" placeholder="New Password">
          </div>
        </div>
        
        <div class="password-input-group">
          <div class="password-input-wrapper">
            <i id="toggle-confirm-new-password" class="fa fa-eye-slash toggle-password-icon"></i>
            <input type="password" id="confirm-new-password" class="password-input" placeholder="Confirm New Password">
          </div>
        </div>
        
        <div id="password-strength" class="password-strength-container"></div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Change Password',
    buttonsStyling: false,
    showClass: {
      popup: 'animate__animated animate__fadeIn'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOut'
    },
    preConfirm: () => {
      const oldPassword = document.getElementById("old-password")?.value;
      const newPassword = document.getElementById("new-password")?.value;
      const confirmNewPassword = document.getElementById("confirm-new-password")?.value;
      if (!oldPassword || !newPassword || !confirmNewPassword) {
        Swal.showValidationMessage("Please enter old password, new password, and confirm new password");
        return;
      }
      if (oldPassword === newPassword) {
        Swal.showValidationMessage("New password cannot be the same as the old password");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        Swal.showValidationMessage("New password and confirm new password do not match");
        return;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        Swal.showValidationMessage("New password must include uppercase, lowercase, a number, and be at least 8 characters long.");
        return;
      }
      Swal.resetValidationMessage();
      return { oldPassword, newPassword };
    },
    didOpen: () => {
      // Add custom styles to the document
      const styleElement = document.createElement('style');
      styleElement.innerHTML = `
        .change-password-modal-container {
          backdrop-filter: blur(6px);
        }
        
        .change-password-modal-popup {
          border-radius: 16px;
          background: linear-gradient(145deg, #ffffff, #f5f8ff);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08);
          padding: 20px;
          border: 1px solid rgba(230, 230, 250, 0.7);
          max-width: 420px;
          width: 100%;
        }
        
        .change-password-modal-title {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 600;
          font-size: 1.5rem;
          color: #333;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .change-password-confirm-btn,
        .change-password-cancel-btn {
          border-radius: 12px;
          font-weight: 500;
          padding: 12px 24px;
          margin: 0 8px;
          font-size: 15px;
          transition: all 0.2s ease;
          border: none;
          outline: none;
        }
        
        .change-password-confirm-btn {
          background: linear-gradient(135deg, #4f74e3, #7662e0);
          color: white;
          box-shadow: 0 4px 12px rgba(79, 116, 227, 0.2);
        }
        
        .change-password-confirm-btn:hover {
          background: linear-gradient(135deg, #3a61d9, #6450d9);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(79, 116, 227, 0.3);
        }
        
        .change-password-cancel-btn {
          background: white;
          color: #6c757d;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .change-password-cancel-btn:hover {
          background: #f8f9fa;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }
        
        .password-form-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .password-input-group {
          position: relative;
          width: 100%;
        }
        
        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        
        .password-input {
          width: 100%;
          padding: 14px 14px 14px 44px;
          border-radius: 12px;
          border: 1px solid #e0e6fc;
          background-color: #f8faff;
          font-size: 15px;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) inset;
        }
        
        .password-input:focus {
          border-color: #4f74e3;
          background-color: white;
          box-shadow: 0 0 0 3px rgba(79, 116, 227, 0.15);
          outline: none;
        }
        
        .toggle-password-icon {
          position: absolute;
          left: 16px;
          color: #a0aec0;
          cursor: pointer;
          font-size: 16px;
          z-index: 10;
          transition: color 0.3s ease;
        }
        
        .toggle-password-icon:hover {
          color: #4a5568;
        }
        
        .password-strength-container {
          margin-top: 5px;
          width: 100%;
        }
        
        .password-strength-meter {
          position: relative;
          width: 100%;
          height: 8px;
          background-color: #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          margin: 8px 0;
        }
        
        .password-strength-progress {
          height: 100%;
          width: 0;
          transition: width 0.4s cubic-bezier(0.33, 1, 0.68, 1), background-color 0.4s ease;
          border-radius: 10px;
          position: relative;
        }
        
        .password-strength-progress::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
          animation: shimmer 1.5s infinite;
          transform: translateX(-100%);
        }
        
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        
        .password-strength-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          align-items: center;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .password-strength-label.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .password-strength-name {
          color: #4a5568;
          font-weight: 500;
        }
        
        .password-strength-value {
          font-weight: 600;
          transition: color 0.3s ease;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .password-strength-value.level-0 {
          background-color: #f7fafc;
          color: #718096;
        }
        
        .password-strength-value.level-1 {
          background-color: #fff5f5;
          color: #fc8181;
        }
        
        .password-strength-value.level-2 {
          background-color: #fffaf0;
          color: #f6ad55;
        }
        
        .password-strength-value.level-3 {
          background-color: #fffff0;
          color: #d69e2e;
        }
        
        .password-strength-value.level-4 {
          background-color: #f0fff4;
          color: #68d391;
        }
        
        .password-strength-value.level-5 {
          background-color: #e6fffa;
          color: #38a169;
        }
        
        .password-strength-details {
          font-size: 12px;
          color: #718096;
          margin-top: 8px;
          line-height: 1.4;
          transition: opacity 0.3s ease;
        }
        
        .password-strength-requirements {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }
        
        .password-strength-requirement {
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 4px;
          background-color: #f1f5f9;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.3s ease;
          opacity: 0.75;
        }
        
        .password-strength-requirement.met {
          background-color: #f0fff4;
          color: #38a169;
          opacity: 1;
        }
        
        .swal2-validation-message {
          background-color: #fff4f5 !important;
          color: #e53e3e !important;
          border-radius: 8px !important;
          padding: 10px 14px !important;
          margin-top: 16px !important;
          box-shadow: 0 2px 5px rgba(229, 62, 62, 0.1) !important;
          font-size: 14px !important;
        }
      `;
      document.head.appendChild(styleElement);
      
      const oldPasswordInput = document.getElementById("old-password");
      const newPasswordInput = document.getElementById("new-password");
      const confirmNewPasswordInput = document.getElementById("confirm-new-password");
      const strengthDiv = document.getElementById("password-strength");

      const toggleOld = document.getElementById("toggle-old-password");
      const toggleNew = document.getElementById("toggle-new-password");
      const toggleConfirm = document.getElementById("toggle-confirm-new-password");

      const addToggleListener = (toggleElem, inputElem) => {
        if (toggleElem && inputElem) {
          toggleElem.addEventListener("click", () => {
            if (inputElem.type === "password") {
              inputElem.type = "text";
              toggleElem.classList.remove("fa-eye-slash");
              toggleElem.classList.add("fa-eye");
            } else {
              inputElem.type = "password";
              toggleElem.classList.remove("fa-eye");
              toggleElem.classList.add("fa-eye-slash");
            }
          });
        }
      };

      addToggleListener(toggleOld, oldPasswordInput);
      addToggleListener(toggleNew, newPasswordInput);
      addToggleListener(toggleConfirm, confirmNewPasswordInput);

      let oldIndicator = document.getElementById("old-password-indicator");
      if (!oldIndicator && oldPasswordInput) {
        oldIndicator = document.createElement("span");
        oldIndicator.id = "old-password-indicator";
        oldIndicator.className = "password-indicator";
        oldPasswordInput.parentNode.insertBefore(oldIndicator, oldPasswordInput.nextSibling);
      }
      if (oldIndicator) oldIndicator.innerHTML = "&nbsp;";

      let newIndicator = document.getElementById("new-password-indicator");
      if (!newIndicator && newPasswordInput) {
        newIndicator = document.createElement("span");
        newIndicator.id = "new-password-indicator";
        newIndicator.className = "password-indicator";
        newPasswordInput.parentNode.insertBefore(newIndicator, newPasswordInput.nextSibling);
      }
      
      let confirmIndicator = document.getElementById("confirm-new-password-indicator");
      if (!confirmIndicator && confirmNewPasswordInput) {
        confirmIndicator = document.createElement("span");
        confirmIndicator.id = "confirm-new-password-indicator";
        confirmIndicator.className = "password-indicator";
        confirmNewPasswordInput.parentNode.insertBefore(confirmIndicator, confirmNewPasswordInput.nextSibling);
      }

      const calculateStrength = (pwd) => {
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;
        return strength;
      };

      const getStrengthText = (strength) => {
        switch (strength) {
          case 0:
            return "Enter a new password";
          case 1:
            return "Very Weak";
          case 2:
            return "Weak";
          case 3:
            return "Moderate";
          case 4:
            return "Strong";
          case 5:
            return "Very Strong";
          default:
            return "";
        }
      };

      const getStrengthColor = (strength) => {
        switch (strength) {
          case 0:
            return "#cbd5e0";
          case 1:
            return "#fc8181";
          case 2:
            return "#f6ad55";
          case 3:
            return "#f6e05e";
          case 4:
            return "#68d391";
          case 5:
            return "#38a169";
          default:
            return "#cbd5e0";
        }
      };

      const updateStrengthMeter = () => {
        const pwd = newPasswordInput ? newPasswordInput.value : "";
        const strength = calculateStrength(pwd);
        const strengthText = getStrengthText(strength);
        const strengthColor = getStrengthColor(strength);
        
        // Check password requirements
        const hasLength = pwd.length >= 8;
        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasNumber = /[0-9]/.test(pwd);
        
        if (strengthDiv) {
          // Store the previous strength value as a data attribute
          const previousStrength = strengthDiv.getAttribute('data-strength') || '0';
          const strengthChanged = parseInt(previousStrength) !== strength;
          
          // Update the stored strength value
          strengthDiv.setAttribute('data-strength', strength.toString());
          
          strengthDiv.innerHTML = `
            <div class="password-strength-label ${pwd.length > 0 ? 'visible' : ''}">
              <span class="password-strength-name">Password Strength</span>
              <span class="password-strength-value level-${strength}">${strengthText}</span>
            </div>
            
            <div class="password-strength-meter">
              <div class="password-strength-progress" style="width: ${strengthChanged ? '0' : (strength/5)*100}%; background-color: ${strengthColor};"></div>
            </div>
            
            <div class="password-strength-requirements">
              <div class="password-strength-requirement ${hasLength ? 'met' : ''}">
                <i class="fa ${hasLength ? 'fa-check' : 'fa-times'}" aria-hidden="true"></i>
                8+ characters
              </div>
              <div class="password-strength-requirement ${hasUpper ? 'met' : ''}">
                <i class="fa ${hasUpper ? 'fa-check' : 'fa-times'}" aria-hidden="true"></i>
                Uppercase
              </div>
              <div class="password-strength-requirement ${hasLower ? 'met' : ''}">
                <i class="fa ${hasLower ? 'fa-check' : 'fa-times'}" aria-hidden="true"></i>
                Lowercase
              </div>
              <div class="password-strength-requirement ${hasNumber ? 'met' : ''}">
                <i class="fa ${hasNumber ? 'fa-check' : 'fa-times'}" aria-hidden="true"></i>
                Number
              </div>
            </div>
          `;
          
          // Only animate if strength actually changed
          if (strengthChanged) {
            const progressBar = strengthDiv.querySelector('.password-strength-progress');
            if (progressBar) {
              setTimeout(() => {
                progressBar.style.width = `${(strength/5)*100}%`;
              }, 10);
            }
          }
        }
      };

      const updateNewAndConfirmIndicators = () => {
        const newPwd = newPasswordInput ? newPasswordInput.value : "";
        const confirmPwd = confirmNewPasswordInput ? confirmNewPasswordInput.value : "";
        if (!newPwd || !confirmPwd) {
          if(newIndicator) newIndicator.innerHTML = "";
          if(confirmIndicator) confirmIndicator.innerHTML = "";
          return;
        }
        if (newPwd === confirmPwd) {
          if(newIndicator) newIndicator.innerHTML = `<i class="fa fa-check" style="color: #38a169; position: absolute; right: 16px; top: 50%; transform: translateY(-50%);"></i>`;
          if(confirmIndicator) confirmIndicator.innerHTML = `<i class="fa fa-check" style="color: #38a169; position: absolute; right: 16px; top: 50%; transform: translateY(-50%);"></i>`;
        } else {
          if(newIndicator) newIndicator.innerHTML = `<i class="fa fa-times" style="color: #e53e3e; position: absolute; right: 16px; top: 50%; transform: translateY(-50%);"></i>`;
          if(confirmIndicator) confirmIndicator.innerHTML = `<i class="fa fa-times" style="color: #e53e3e; position: absolute; right: 16px; top: 50%; transform: translateY(-50%);"></i>`;
        }
      };

      if(newPasswordInput) {
        newPasswordInput.addEventListener("input", () => {
          Swal.resetValidationMessage();
          updateStrengthMeter();
          updateNewAndConfirmIndicators();
        });
      }
      if(confirmNewPasswordInput) {
        confirmNewPasswordInput.addEventListener("input", () => {
          Swal.resetValidationMessage();
          updateNewAndConfirmIndicators();
        });
      }
      if(oldPasswordInput) {
        oldPasswordInput.addEventListener("input", () => {
          Swal.resetValidationMessage();
          updateNewAndConfirmIndicators();
        });
      }
      updateStrengthMeter();
      updateNewAndConfirmIndicators();
    }
  });

  if (formValues) {
    try {
      const token = localStorage.getItem("token");
      formValues.email = user.email;
      // Encrypt the old and new passwords using AES before sending them
      const secretKey = process.env.REACT_APP_SECRET_KEY;
      formValues.oldPassword = CryptoJS.AES.encrypt(formValues.oldPassword, secretKey).toString();
      formValues.newPassword = CryptoJS.AES.encrypt(formValues.newPassword, secretKey).toString();

      // Show loading screen before making the request
      Swal.fire({
        title: "Changing Password...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        customClass: {
          popup: 'change-password-modal-popup',
          title: 'change-password-modal-title'
        }
      });

      return fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/personal/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formValues),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (!data || data.error) {
            throw new Error(data.message || "Failed to change password");
          }
          Swal.fire({
            icon: "success",
            title: "Password Changed",
            text: data.message,
            customClass: {
              popup: 'change-password-modal-popup',
              title: 'change-password-modal-title',
              confirmButton: 'change-password-confirm-btn'
            },
            buttonsStyling: false
          });
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            customClass: {
              popup: 'change-password-modal-popup',
              title: 'change-password-modal-title',
              confirmButton: 'change-password-confirm-btn'
            },
            buttonsStyling: false
          });
        });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        customClass: {
          popup: 'change-password-modal-popup',
          title: 'change-password-modal-title',
          confirmButton: 'change-password-confirm-btn'
        },
        buttonsStyling: false
      });
    }
  }
};

export default showChangePasswordModal;
