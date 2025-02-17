// PersonalDetailsModal.jsx
import Swal from "sweetalert2";

const handleResetPersonalDetail = async (user, type, label, navigate, location) => {
  try {
    const token = localStorage.getItem("token");
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
    // Update user in location state.
    location.state.user = data.updatedUser;
    navigate(location.pathname, { state: location.state });
    Swal.fire("Reset!", data.message, "success");
  } catch (error) {
    Swal.fire("Error", error.message, "error");
  }
};

const handleEditPersonalDetail = async (user, type, label, navigate, location) => {
  try {
    const token = localStorage.getItem("token");
    const getResponse = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/personal/job-seeker-details?email=${encodeURIComponent(
        user.email
      )}&type=${type}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!getResponse.ok) {
      throw new Error("Failed to fetch current detail");
    }
    const getData = await getResponse.json();
    let currentValue = getData[type] || "Not set";
    if (type === "dob" && currentValue !== "Not set") {
      currentValue = new Date(currentValue).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    }
    const inputField =
      type === "dob"
        ? `<input type="date" id="swal-input-new" class="swal2-input" />`
        : `<input id="swal-input-new" class="swal2-input" placeholder="Enter new ${label}" />`;
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
      location.state.user = updateData.updatedUser;
      navigate(location.pathname, { state: location.state });
      Swal.fire("Updated!", `Your ${label} has been updated.`, "success");
    } else if (isDenied) {
      await handleResetPersonalDetail(user, type, label, navigate, location);
    }
  } catch (error) {
    console.error(error);
    Swal.fire("Error", error.message, "error");
  }
};

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
