import Swal from "sweetalert2";

export const showChangeProfilePicModal = async (currentPic) => {
  const result = await Swal.fire({
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
    allowOutsideClick: () => !Swal.isLoading(),
    allowEscapeKey: () => !Swal.isLoading(),
    preConfirm: async () => {
      const changeBtn = document.getElementById("change-btn");
      const deleteBtn = document.getElementById("delete-btn");

      if (deleteBtn.dataset.action === "delete") {
        return { action: "delete" };
      }
      if (changeBtn.dataset.action === "change") {
        const fileInput = document.getElementById("profile-input");
        if (fileInput.files.length === 0) {
          Swal.showValidationMessage("Please select a file.");
        } else {
          return { action: "change", file: fileInput.files[0] };
        }
      }
      Swal.showValidationMessage("Please select an action by clicking 'Change Picture' or 'Delete Picture'.");
      return;
    },
    didOpen: () => {
      const changeBtn = document.getElementById("change-btn");
      const deleteBtn = document.getElementById("delete-btn");
      const fileInput = document.getElementById("profile-input");
      const previewImg = document.getElementById("profile-preview");

      // Initialize data-action attributes
      changeBtn.dataset.action = "";
      deleteBtn.dataset.action = "";

      // Trigger file input when "Change Picture" is clicked
      changeBtn.addEventListener("click", () => {
        fileInput.click();
      });

      // Update preview image and mark change action on file selection
      fileInput.addEventListener("change", () => {
        if (fileInput.files && fileInput.files[0]) {
          const reader = new FileReader();
          reader.onload = (e) => {
            previewImg.src = e.target.result;
          };
          reader.readAsDataURL(fileInput.files[0]);
          changeBtn.dataset.action = "change";
          deleteBtn.dataset.action = "";
        }
      });

      // Mark delete action and update preview to default image
      deleteBtn.addEventListener("click", () => {
        deleteBtn.dataset.action = "delete";
        changeBtn.dataset.action = "";
        previewImg.src = "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png";
      });

      // Full-screen overlay preview on clicking the preview image
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
    },
  });
  if (result.isConfirmed) {
    return result.value;
  }
  return null;
};
