// File: showChangePicModal.js
import Swal from "sweetalert2";

/**
 * Single default fallback if you really want them identical.
 * If you prefer different defaults, you can do a small if-else
 * for "profile" vs. "company".
 */
const DEFAULT_IMAGE =
  "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png";

/**
 * Determine which image property to retrieve from user.
 * @param {object} user
 * @param {"profile"|"company"} picType
 * @returns {string} The current image URL or the default
 */
const getCurrentImage = (user, picType) => {
  if (picType === "company") {
    return user.companyLogo || DEFAULT_IMAGE;
  }
  // default to "profile"
  return user.profilePic || DEFAULT_IMAGE;
};

/**
 * This modal changes EITHER the user's profile pic OR company logo,
 * based on the picType param. Uses a SINGLE endpoint for both upload + delete.
 * @param {object} user
 * @param {Function} navigate
 * @param {object} location
 * @param {"profile"|"company"} picType - which pic to change
 */
const showChangePicModal = async (user, navigate, location, picType = "profile") => {
  // Decide which property we are modifying
  const isCompanyLogo = picType === "company";
  const DEFAULT_IMAGE = isCompanyLogo ? "https://res.cloudinary.com/careeragent/image/upload/v1742730089/defaultCompanyLogo_lb5fsj.png" : "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png";
  
  const modalTitle = isCompanyLogo ? "Change Company Logo" : "Change Profile Picture";

  // Single Endpoint: /api/personal/change-pic
  // We'll pass picType as a query param for DELETE, and as formData for POST
  const baseEndpoint = `${process.env.REACT_APP_BACKEND_URL}/api/personal/change-pic`;

  // The current image to display in the modal
  const currentPic = getCurrentImage(user, picType);

  // Launch SweetAlert2 modal
  const { value: result } = await Swal.fire({
    title: modalTitle,
    html: `
      <div class="flex flex-col items-center bg-white p-4 rounded-lg">
        <div class="w-36 h-36 rounded-full overflow-hidden mb-4">
          <img id="pic-preview" src="${currentPic}" alt="${modalTitle}" class="object-cover w-full h-full" style="cursor: pointer;">
        </div>
        <input type="file" id="pic-input" accept="image/*" class="hidden">
        <div class="flex space-x-4">
          <button id="change-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none">Change Picture</button>
          <button id="delete-btn" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded focus:outline-none">Delete Picture</button>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "OK",
    preConfirm: async () => {
      Swal.showLoading();
      const token = localStorage.getItem("token");
      const changeBtn = document.getElementById("change-btn");
      const deleteBtn = document.getElementById("delete-btn");
      const fileInput = document.getElementById("pic-input");

      const changeClicked = changeBtn && changeBtn.dataset.action === "change";
      const deleteClicked = deleteBtn && deleteBtn.dataset.action === "delete";

      // If user wants to DELETE
      if (deleteClicked) {
        const deleteUrl = `${baseEndpoint}?email=${encodeURIComponent(
          user.email
        )}&picType=${picType}`;

        const response = await fetch(deleteUrl, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to delete image");
        }
        return { action: "delete", message: data.message };
      }

      // If user wants to CHANGE (upload new)
      if (changeClicked) {
        if (!fileInput || fileInput.files.length === 0) {
          Swal.showValidationMessage("Please select a file.");
        } else {
          const formData = new FormData();
          formData.append("file", fileInput.files[0]);
          formData.append("email", user.email);
          formData.append("picType", picType);

          const response = await fetch(baseEndpoint, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || "Failed to update image");
          }

          // The backend returns: { message, profilePic, companyLogo }
          // We'll pick whichever we actually changed
          const newUrl = isCompanyLogo ? data.companyLogo : data.profilePic;

          return {
            action: "change",
            message: data.message,
            newUrl,
          };
        }
      }
      // If user didn't do either, return null to skip
      return null;
    },
    didOpen: () => {
      // Attach event listeners to modal elements
      const changeBtn = document.getElementById("change-btn");
      const deleteBtn = document.getElementById("delete-btn");
      const fileInput = document.getElementById("pic-input");
      const previewImg = document.getElementById("pic-preview");

      // "Change Picture" triggers file input
      if (changeBtn) {
        changeBtn.dataset.action = "";
        changeBtn.addEventListener("click", () => {
          if (fileInput) fileInput.click();
        });
      }
      // "Delete Picture"
      if (deleteBtn) {
        deleteBtn.dataset.action = "";
        deleteBtn.addEventListener("click", () => {
          deleteBtn.dataset.action = "delete";
          if (changeBtn) changeBtn.dataset.action = "";
          if (previewImg) previewImg.src = DEFAULT_IMAGE;
        });
      }
      // When user selects a file, preview it
      if (fileInput && previewImg) {
        fileInput.addEventListener("change", () => {
          if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
              previewImg.src = e.target.result;
            };
            reader.readAsDataURL(fileInput.files[0]);
            if (changeBtn) changeBtn.dataset.action = "change";
            if (deleteBtn) deleteBtn.dataset.action = "";
          }
        });
      }
      // Clicking on the preview image opens a full-screen overlay
      if (previewImg) {
        previewImg.addEventListener("click", () => {
          const overlay = document.createElement("div");
          overlay.style.position = "fixed";
          overlay.style.top = "0";
          overlay.style.left = "0";
          overlay.style.width = "100%";
          overlay.style.height = "100%";
          overlay.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
          overlay.style.display = "flex";
          overlay.style.alignItems = "center";
          overlay.style.justifyContent = "center";
          overlay.style.zIndex = "9999";

          const fullImg = document.createElement("img");
          fullImg.src = previewImg.src;
          fullImg.style.maxWidth = "90%";
          fullImg.style.maxHeight = "90%";
          fullImg.style.borderRadius = "10px";

          const closeBtn = document.createElement("button");
          closeBtn.textContent = "Close Preview";
          closeBtn.style.position = "absolute";
          closeBtn.style.top = "20px";
          closeBtn.style.right = "20px";
          closeBtn.style.padding = "10px 20px";
          closeBtn.style.backgroundColor = "#fff";
          closeBtn.style.border = "none";
          closeBtn.style.borderRadius = "5px";
          closeBtn.style.cursor = "pointer";

          closeBtn.addEventListener("click", () => {
            document.body.removeChild(overlay);
          });

          overlay.appendChild(fullImg);
          overlay.appendChild(closeBtn);
          document.body.appendChild(overlay);
        });
      }
    },
  });

  // After user clicks OK
  if (result) {
    let swalPromise;
    if (result.action === "delete") {
      // Reset the relevant property
      if (isCompanyLogo) {
        user.companyLogo = DEFAULT_IMAGE;
      } else {
        user.profilePic = DEFAULT_IMAGE;
      }
      swalPromise = Swal.fire("Deleted!", result.message, "success");
    } else if (result.action === "change") {
      // Update user property with new URL
      if (isCompanyLogo) {
        user.companyLogo = result.newUrl;
      } else {
        user.profilePic = result.newUrl;
      }
      swalPromise = Swal.fire("Updated!", result.message, "success");
    }

    if (swalPromise) {
      swalPromise.then(() => {
        // Re-render or navigate to refresh user data
        navigate(location.pathname, { state: { user } });
      });
    }
  }
};

export default showChangePicModal;
