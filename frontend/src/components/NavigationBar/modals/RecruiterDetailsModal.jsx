// RecruiterDetailsModal.jsx
import Swal from "sweetalert2";

// This function handles editing a recruiter’s personal detail (like Date of Birth or Company Website)
// It uses the recruiter’s state (instead of fetching it) and updates the state upon success.
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
      currentValue = user.companyWebsite || "Not set";
    }

    // Choose an input field type based on the detail type (date input for dob, text input for company website)
    const inputField =
      type.toLowerCase() === "dob"
        ? `<input type="date" id="swal-input-new" class="swal2-input" />`
        : `<input id="swal-input-new" class="swal2-input" placeholder="Enter new ${label}" />`;

    // Display a SweetAlert modal for updating or resetting the detail
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
            value: newValue,
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
      Swal.fire("Updated!", `Your ${label} has been updated.`, "success");
    } else if (isDenied) {
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
      Swal.fire("Reset!", resetData.message, "success");
    }
  } catch (error) {
    console.error(error);
    Swal.fire("Error", error.message, "error");
  }
};

// This function shows the recruiter details modal with buttons to update details.
// We now pass navigate and location so that we can update the recruiter state on success.
export const showRecruiterDetailsModal = (user, navigate, location) => {
  Swal.fire({
    title: "Change Personal Details",
    html: `
      <div class="flex flex-col space-y-4">
        <button id="recruiter-change-dob" class="flex items-center justify-center p-4 border border-gray-300 rounded hover:bg-blue-100">
          <i class="fas fa-birthday-cake" style="margin-right: 8px;"></i>Change Date of Birth
        </button>
        <button id="recruiter-change-company" class="flex items-center justify-center p-4 border border-gray-300 rounded hover:bg-blue-100">
          <i class="fas fa-globe" style="margin-right: 8px;"></i>Change Company Website
        </button>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Close",
    focusConfirm: false,
    didOpen: () => {
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
      }, 100);
    },
  });
};

// Helper function to trigger the editing modal for a specific recruiter detail
const showEditRecruiterDetail = async (type, label, user, navigate, location) => {
  await handleEditRecruiterPersonalDetail(user, type, label, navigate, location);
};

export default showRecruiterDetailsModal;
