
import Swal from "sweetalert2";

const getCurrentProfilePic = (user) => {
  return user.profilePic || "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png";
};

const showChangeProfilePicModal = async (user, navigate, location) => {
  const currentPic = await getCurrentProfilePic(user);
  const { value: result } = await Swal.fire({
    title: "Change Profile Picture",
    html: `
      <div class="flex flex-col items-center bg-white p-4 rounded-lg">
        <div class="w-36 h-36 rounded-full overflow-hidden mb-4">
          <img id="profile-preview" src="${currentPic}" alt="Profile Picture" class="object-cover w-full h-full" style="cursor: pointer;">
        </div>
        <input type="file" id="profile-input" accept="image/*" class="hidden">
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
      const fileInput = document.getElementById("profile-input");

      const changeClicked = changeBtn && changeBtn.dataset.action === "change";
      const deleteClicked = deleteBtn && deleteBtn.dataset.action === "delete";

      if (deleteClicked) {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/personal/profile-pic?email=${encodeURIComponent(user.email)}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to delete profile picture");
        return { action: "delete", message: data.message };
      }
      if (changeClicked) {
        if (!fileInput || fileInput.files.length === 0) {
          Swal.showValidationMessage("Please select a file.");
        } else {
          const formData = new FormData();
          formData.append("file", fileInput.files[0]);
          formData.append("email", user.email);
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/personal/change-profile-pic`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            }
          );
          const data = await response.json();
          if (!response.ok)
            throw new Error(data.message || "Failed to update profile picture");
          // Return the new profilePic from the response
          return { action: "change", message: data.message, profilePic: data.profilePic };
        }
      }
      return null;
    },
    didOpen: () => {
      const changeBtn = document.getElementById("change-btn");
      const deleteBtn = document.getElementById("delete-btn");
      const fileInput = document.getElementById("profile-input");
      const previewImg = document.getElementById("profile-preview");

      if (changeBtn) {
        changeBtn.dataset.action = "";
        changeBtn.addEventListener("click", () => {
          if (fileInput) fileInput.click();
        });
      }
      if (deleteBtn) {
        deleteBtn.dataset.action = "";
        deleteBtn.addEventListener("click", () => {
          deleteBtn.dataset.action = "delete";
          if (changeBtn) changeBtn.dataset.action = "";
          if (previewImg)
            previewImg.src = "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png";
        });
      }
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

  if (result) {
    let swalPromise;
    if (result.action === "delete") {
      user.profilePic = "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png";
      swalPromise = Swal.fire("Deleted!", result.message, "success");
    } else if (result.action === "change") {
      // Directly update user.profilePic using the profilePic returned from the fetch
      user.profilePic = result.profilePic;
      swalPromise = Swal.fire("Updated!", result.message, "success");
    }
    if (swalPromise) {
      swalPromise.then(() => {
        // Navigate to the current location with the updated user state variable
        navigate(location.pathname, { state: { user } });
      });
    }
  }
};

export default showChangeProfilePicModal;
