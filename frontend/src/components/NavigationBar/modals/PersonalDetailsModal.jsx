// PersonalDetailsModal.jsx
import Swal from "sweetalert2";

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
    Swal.fire("Reset!", data.message, "success");
  } catch (error) {
    Swal.fire("Error", error.message, "error");
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
        ? `<input type="date" id="swal-input-new" class="swal2-input" />`
        : `<input id="swal-input-new" class="swal2-input" placeholder="Enter new ${label}" />`;
    
    // Show a SweetAlert modal with the current value and an input field to update it
    const { isConfirmed, isDenied, value: newValue } = await Swal.fire({
      title: `Change ${label}`,
      html: `
        <div>
          <p>Current ${label}: ${currentValue}</p>
          ${inputField}
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Update",
      denyButtonText: "Reset",
      preConfirm: () => {
        const inputValue = document.getElementById("swal-input-new")?.value;
        if (!inputValue) {
          Swal.showValidationMessage(`Please enter a new ${label}`);
        }
        return inputValue;
      },
    });
    
    if (isConfirmed) {
      // If the user confirmed the update, send a POST request with the new detail value
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
      if (!updateResponse.ok) {
        throw new Error(updateData.message || "Failed to update detail");
      }
      // Update the user state with the updated user object returned from the backend
      location.state.user = updateData.updatedUser;
      navigate(location.pathname, { state: location.state });
      Swal.fire("Updated!", `Your ${label} has been updated.`, "success");
    } else if (isDenied) {
      // If the user chose to reset the detail, call the reset handler
      await handleResetPersonalDetail(user, type, label, navigate, location);
    }
  } catch (error) {
    console.error(error);
    Swal.fire("Error", error.message, "error");
  }
};

// Main function to show the personal details modal for job seekers
export const showJobSeekerPersonalDetailsModal = (user, navigate, location) => {
  Swal.fire({
    title: "Change Personal Details",
    html: `
      <div class="flex flex-col space-y-4">
        <button id="change-dob" class="flex items-center justify-center p-4 border border-gray-300 rounded hover:bg-blue-100">
          <i class="fas fa-birthday-cake" style="margin-right: 8px;"></i>Change Date of Birth
        </button>
        <button id="change-phone" class="flex items-center justify-center p-4 border border-gray-300 rounded hover:bg-blue-100">
          <i class="fas fa-phone" style="margin-right: 8px;"></i>Change Phone Number
        </button>
        <button id="change-github" class="flex items-center justify-center p-4 border border-gray-300 rounded hover:bg-blue-100">
          <i class="fab fa-github" style="margin-right: 8px;"></i>Change Github Link
        </button>
        <button id="change-linkedin" class="flex items-center justify-center p-4 border border-gray-300 rounded hover:bg-blue-100">
          <i class="fab fa-linkedin" style="margin-right: 8px;"></i>Change LinkedIn URL
        </button>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Close",
    focusConfirm: false,
    didOpen: () => {
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
