import Swal from "sweetalert2";
import CryptoJS from "crypto-js";

const showChangePasswordModal = async (user) => {
  const { value: formValues } = await Swal.fire({
    title: "Change Password",
    html: `
      <div style="position: relative;">
        <i id="toggle-old-password" class="fa fa-eye-slash" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); cursor: pointer;"></i>
        <input type="password" id="old-password" class="swal2-input" placeholder="Old Password" style="padding-left: 2.5rem;">
      </div>
      <div style="position: relative;">
        <i id="toggle-new-password" class="fa fa-eye-slash" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); cursor: pointer;"></i>
        <input type="password" id="new-password" class="swal2-input" placeholder="New Password" style="padding-left: 2.5rem;">
      </div>
      <div style="position: relative;">
        <i id="toggle-confirm-new-password" class="fa fa-eye-slash" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); cursor: pointer;"></i>
        <input type="password" id="confirm-new-password" class="swal2-input" placeholder="Confirm New Password" style="padding-left: 2.5rem;">
      </div>
      <div id="password-strength" style="margin-top:10px; text-align:left; font-size:0.9rem;"></div>
    `,
    focusConfirm: false,
    showCancelButton: true,
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
        oldIndicator.style.marginLeft = "8px";
        oldIndicator.style.display = "inline-block";
        oldIndicator.style.width = "20px";
        oldPasswordInput.parentNode.insertBefore(oldIndicator, oldPasswordInput.nextSibling);
      }
      if (oldIndicator) oldIndicator.innerHTML = "&nbsp;";

      let newIndicator = document.getElementById("new-password-indicator");
      if (!newIndicator && newPasswordInput) {
        newIndicator = document.createElement("span");
        newIndicator.id = "new-password-indicator";
        newIndicator.style.marginLeft = "8px";
        newIndicator.style.display = "inline-block";
        newIndicator.style.width = "20px";
        newPasswordInput.parentNode.insertBefore(newIndicator, newPasswordInput.nextSibling);
      }
      let confirmIndicator = document.getElementById("confirm-new-password-indicator");
      if (!confirmIndicator && confirmNewPasswordInput) {
        confirmIndicator = document.createElement("span");
        confirmIndicator.id = "confirm-new-password-indicator";
        confirmIndicator.style.marginLeft = "8px";
        confirmIndicator.style.display = "inline-block";
        confirmIndicator.style.width = "20px";
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
            return "bg-gray-300";
          case 1:
            return "bg-red-500";
          case 2:
            return "bg-orange-500";
          case 3:
            return "bg-yellow-500";
          case 4:
            return "bg-green-400";
          case 5:
            return "bg-green-600";
          default:
            return "bg-gray-300";
        }
      };

      const updateStrengthMeter = () => {
        const pwd = newPasswordInput ? newPasswordInput.value : "";
        const strength = calculateStrength(pwd);
        const strengthText = getStrengthText(strength);
        const strengthColor = getStrengthColor(strength);
        if (strengthDiv) {
          strengthDiv.innerHTML = `
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-700">${strengthText}</span>
            </div>
            <div class="w-full h-2 bg-gray-200 rounded">
              <div class="h-2 rounded transition-all duration-300 ${strengthColor}" style="width: ${(strength/5)*100}%"></div>
            </div>
          `;
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
          if(newIndicator) newIndicator.innerHTML = `<i class="fa fa-check" style="color: green;"></i>`;
          if(confirmIndicator) confirmIndicator.innerHTML = `<i class="fa fa-check" style="color: green;"></i>`;
        } else {
          if(newIndicator) newIndicator.innerHTML = `<i class="fa fa-times" style="color: red;"></i>`;
          if(confirmIndicator) confirmIndicator.innerHTML = `<i class="fa fa-times" style="color: red;"></i>`;
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
          });
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
          });
        });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  }
};

export default showChangePasswordModal;
