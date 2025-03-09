
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { extractTextFromPDF } from "../../../utils/pdfUtils";

const MySwal = withReactContent(Swal);

const processCV = async (cvFile) => {
  try {
    // Extract text content from the PDF file
    const cvContent = await extractTextFromPDF(cvFile);
    // Send the extracted text to the AI endpoint for JSON generation
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai/generateJsonFromCV`, {
      method: "POST",
      body: JSON.stringify({ prompt: cvContent }),
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error("Failed to generate AI CV.");
    }
    const jsonResponse = await response.json();
    const jsonRaw = jsonResponse.response;
    // Extract JSON between code block markers (```json ... ```)
    const match = jsonRaw.match(/```json\n([\s\S]+?)\n```/);
    if (!match) {
      throw new Error("Invalid JSON format in response.");
    }
    const jsonString = match[1];
    const prettyJson = JSON.parse(jsonString);
    return prettyJson;
  } catch (error) {
    console.error("Error processing CV:", error.message);
    throw error;
  }
};

const showUpdateCVModal = async (user, navigate, location) => {
  const token = localStorage.getItem("token");
  try {
    // Fetch current CV link from the updated route
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/personal/jobseeker/cv?email=${encodeURIComponent(user.email)}`,
      { method: "GET", headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();
    const currentCV = data.cv || "No CV uploaded";
    const currentCVDisplay =
      currentCV !== "No CV uploaded"
        ? `<a href="${currentCV}" target="_blank" class="underline break-words">${currentCV}</a>`
        : `<span class="text-gray-500">${currentCV}</span>`;

    // Show modal with a modern styled file uploader
    const result = await MySwal.fire({
      title: "Update CV",
      html: `
        <div class="flex flex-col items-center space-y-4">
          <p class="text-lg font-semibold">Current CV:</p>
          <p class="text-blue-600">${currentCVDisplay}</p>
          <label for="swal-input-cv" class="cursor-pointer w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition">
            <span id="swal-input-cv-label" class="block text-sm font-medium">Click here to select a PDF file</span>
            <input type="file" id="swal-input-cv" class="hidden" accept="application/pdf" />
          </label>
        </div>
      `,
      didOpen: () => {
        const fileInput = document.getElementById("swal-input-cv");
        const label = document.getElementById("swal-input-cv-label");
        fileInput.addEventListener("change", () => {
          if (fileInput.files && fileInput.files.length > 0) {
            label.textContent = fileInput.files[0].name;
          } else {
            label.textContent = "Click here to select a PDF file";
          }
        });
      },
      focusConfirm: false,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Upload",
      denyButtonText: "Delete CV",
      preConfirm: () => {
        const cvFile = document.getElementById("swal-input-cv").files[0];
        if (!cvFile) {
          Swal.showValidationMessage("Please select a PDF file");
        } else if (cvFile.type !== "application/pdf") {
          Swal.showValidationMessage("Only PDF files are allowed");
        }
        return cvFile;
      },
    });

    if (result.isDenied) {
      // User clicked "Delete CV"
      const confirmDeletion = await MySwal.fire({
        title: "Delete CV?",
        text: "Are you sure you want to delete your CV?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });
      if (confirmDeletion.isConfirmed) {
        Swal.fire({
          title: "Deleting CV...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        const deleteResponse = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/personal/jobseeker/cv/delete?email=${encodeURIComponent(user.email)}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
        );
        const deleteData = await deleteResponse.json();
        Swal.close();
        if (deleteResponse.ok) {
          Swal.fire("Deleted", deleteData.message, "success").then(() => {
            const updatedUser = { ...user };
            delete updatedUser.cv;
            delete updatedUser.analyzed_cv_content;
            const newState = {
              email: user.email,
              role: user.role,
              token: token,
              user: updatedUser,
              refreshToken: 0,
              isVerified: user.isVerified,
            };

            // Remove local storage stored jobListings relevance scores since CV was deleted.
            const localStorageKey = `relevance_data_${user.id || user._id}`;
            localStorage.removeItem(localStorageKey);
      
            navigate(location.pathname, { state: newState });
          });
        } else {
          Swal.fire("Error", deleteData.message || "Failed to delete CV", "error");
        }
      }
    } else if (result.isConfirmed) {
      // User clicked "Upload" and provided a file
      const file = result.value;
      // Immediately show loading modal
      Swal.fire({
        title: "Uploading CV...",
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); },
      });
      // Process the CV file to obtain the analyzed content
      const analyzedContent = await processCV(file);
      // Prepare form data for file upload, including the analyzed content
      const formData = new FormData();
      formData.append("cv", file);
      formData.append("analyzed_cv_content", JSON.stringify(analyzedContent));
      // Make POST request to update the CV (updated route)
      const uploadResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/personal/jobseeker/cv/update?email=${encodeURIComponent(user.email)}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
      );
      const uploadData = await uploadResponse.json();
      Swal.close();
      if (uploadResponse.ok) {
        Swal.fire("Success", uploadData.message, "success").then(() => {
          const updatedUser = {
            ...user,
            cv: uploadData.cv,
            analyzed_cv_content: analyzedContent,
          };
          const newState = {
            email: user.email,
            role: user.role,
            token: token,
            user: updatedUser,
            refreshToken: 0,
            isVerified: user.isVerified,
          };

          // Remove local storage stored jobListings relevance scores since CV was changed.
          const localStorageKey = `relevance_data_${user.id || user._id}`;
          localStorage.removeItem(localStorageKey);

          navigate(location.pathname, { state: newState });
        });
      } else {
        Swal.fire("Error", uploadData.message || "Failed to update CV", "error");
      }
    }
  } catch (error) {
    Swal.fire("Error", error.message || "An error occurred", "error");
  }
};

export default showUpdateCVModal;
