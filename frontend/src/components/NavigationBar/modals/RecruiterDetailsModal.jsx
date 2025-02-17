// RecruiterDetailsModal.jsx
import Swal from "sweetalert2";

const handleEditRecruiterPersonalDetail = async (user, type, label) => {
  try {
    const token = localStorage.getItem("token");
    const getResponse = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/recruiter-personal/recruiter-details?email=${encodeURIComponent(
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
    let currentValue;
    if (type.toLowerCase() === "dob") {
      currentValue = getData.dob || "Not set";
      if (currentValue !== "Not set") {
        currentValue = new Date(currentValue).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
    } else if (type.toLowerCase() === "companywebsite") {
      currentValue = getData.companyWebsite || "Not set";
    } else {
      currentValue = "Not set";
    }
    const inputField =
      type.toLowerCase() === "dob"
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
      const token = localStorage.getItem("token");
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
      Swal.fire("Updated!", `Your ${label} has been updated.`, "success");
    } else if (isDenied) {
      const token = localStorage.getItem("token");
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
      Swal.fire("Reset!", resetData.message, "success");
    }
  } catch (error) {
    console.error(error);
    Swal.fire("Error", error.message, "error");
  }
};

export const showRecruiterDetailsModal = (user) => {
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
      setTimeout(() => {
        const changeDob = document.getElementById("recruiter-change-dob");
        if (changeDob) {
          changeDob.addEventListener("click", () => {
            showEditRecruiterDetail("dob", "Date of Birth", user);
          });
        }
        const changeCompany = document.getElementById("recruiter-change-company");
        if (changeCompany) {
          changeCompany.addEventListener("click", () => {
            showEditRecruiterDetail("companywebsite", "Company Website", user);
          });
        }
      }, 100);
    },
  });
};

const showEditRecruiterDetail = async (type, label, user) => {
  await handleEditRecruiterPersonalDetail(user, type, label);
};

export default showRecruiterDetailsModal;
