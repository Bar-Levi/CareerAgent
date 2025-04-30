// Import SweetAlert2 and its React wrapper
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
// Import our PDF text extraction utility
import { extractTextFromPDF } from "../../../utils/pdfUtils";

// Wrap Swal for React usage
const MySwal = withReactContent(Swal);

// Function to process the CV file by extracting text and sending it to the AI endpoint
const processCV = async (cvFile) => {
  try {
    // Extract text content from the PDF file
    const cvContent = await extractTextFromPDF(cvFile);
    // Send the extracted text to our AI endpoint to generate JSON from the CV
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/ai/generateJsonFromCV`,
      {
        method: "POST",
        body: JSON.stringify({ prompt: cvContent }),
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
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
    return { analyzedContent: prettyJson, rawContent: cvContent };
  } catch (error) {
    console.error("Error processing CV:", error.message);
    throw error;
  }
};

const showUpdateCVModal = async (user, navigate, location) => {
  const token = localStorage.getItem("token");
  
  // Add styles when modal opens
  const addStyles = () => {
    const styleElement = document.createElement('style');
    styleElement.id = 'cv-modal-styles';
    styleElement.innerHTML = `
      .cv-modal-container {
        backdrop-filter: blur(8px);
      }
      
      .cv-modal-popup {
        border-radius: 20px;
        background: linear-gradient(145deg, #ffffff, #f8f9ff);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05);
        padding: 28px;
        border: 1px solid rgba(230, 230, 250, 0.4);
        max-width: 520px;
        width: 100%;
      }
      
      .cv-modal-title {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-weight: 700;
        font-size: 1.6rem;
        color: #1a202c;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .cv-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        margin-bottom: 10px;
      }
      
      .cv-status-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        gap: 12px;
      }
      
      .cv-status-label {
        font-size: 16px;
        font-weight: 600;
        color: #4a5568;
      }
      
      .cv-status {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .cv-status-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
      }
      
      .cv-view-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background-color: #edf2f7;
        color: #4a5568;
        border-radius: 12px;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
      }
      
      .cv-view-button:hover {
        background-color: #e2e8f0;
        transform: translateY(-2px);
      }
      
      .cv-view-button svg {
        color: #4f74e3;
      }
      
      .cv-not-uploaded {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background-color: #f7fafc;
        color: #a0aec0;
        border-radius: 12px;
        padding: 8px 16px;
        font-size: 14px;
      }
      
      .cv-upload-area {
        width: 100%;
        cursor: pointer;
        border: 2px dashed #e2e8f0;
        border-radius: 16px;
        padding: 24px;
        text-align: center;
        transition: all 0.2s ease;
      }
      
      .cv-upload-area:hover {
        border-color: #cbd5e0;
        background-color: #f7fafc;
      }
      
      .cv-upload-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        width: 48px;
        height: 48px;
        background-color: #edf2f7;
        border-radius: 50%;
        color: #4f74e3;
      }
      
      .cv-upload-text {
        font-size: 15px;
        font-weight: 500;
        color: #4a5568;
        margin-bottom: 8px;
      }
      
      .cv-upload-subtext {
        font-size: 13px;
        color: #718096;
      }
      
      .cv-file-name {
        margin-top: 12px;
        font-size: 14px;
        color: #4f74e3;
        font-weight: 500;
        word-break: break-all;
        display: none;
      }
      
      .cv-file-name.visible {
        display: block;
      }
      
      .cv-size-limit {
        margin-top: 16px;
        font-size: 13px;
        color: #718096;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      
      .cv-btn, 
      .cv-btn-delete,
      .cv-btn-cancel {
        border-radius: 14px;
        font-weight: 500;
        padding: 12px 16px;
        font-size: 15px;
        transition: all 0.2s ease;
        border: none;
        outline: none;
        white-space: nowrap;
        min-width: 0;
        flex: 1;
      }
      
      .cv-btn {
        background: linear-gradient(135deg, #4f74e3, #7662e0);
        color: white;
        box-shadow: 0 4px 12px rgba(79, 116, 227, 0.2);
      }
      
      .cv-btn:hover {
        background: linear-gradient(135deg, #3a61d9, #6450d9);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(79, 116, 227, 0.3);
      }
      
      .cv-btn-delete {
        background: white;
        color: #e53e3e;
        border: 1px solid rgba(229, 62, 62, 0.2);
      }
      
      .cv-btn-delete:hover {
        background: #fff5f5;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(229, 62, 62, 0.15);
      }
      
      .cv-btn-cancel {
        background: white;
        color: #6c757d;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .cv-btn-cancel:hover {
        background: #f8f9fa;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      /* Responsive styles */
      @media screen and (max-width: 480px) {
        .cv-btn, 
        .cv-btn-delete,
        .cv-btn-cancel {
          padding: 10px 12px;
          font-size: 13px;
        }
        
        .swal2-actions {
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }
        
        .swal2-actions button {
          margin: 0 !important;
          width: 100%;
        }
      }
      
      /* Additional global button spacing fixes */
      .swal2-actions {
        gap: 10px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: 100%;
      }
      
      .swal2-actions button {
        margin: 0 5px !important;
      }
      
      /* Media query for tablets */
      @media screen and (min-width: 481px) and (max-width: 768px) {
        .cv-btn, 
        .cv-btn-delete,
        .cv-btn-cancel {
          padding: 10px 14px;
          font-size: 14px;
        }
      }
    `;
    document.head.appendChild(styleElement);
  };

  try {
    // use user.cv from the state
    const currentCV = user.cv || "No CV uploaded";
    const currentCVDisplay = currentCV !== "No CV uploaded"
      ? `
        <div class="cv-status">
          <a href="${currentCV}" target="_blank" class="cv-view-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>View CV</span>
          </a>
        </div>
      `
      : `
        <div class="cv-not-uploaded">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>No CV uploaded</span>
        </div>
      `;

    // Show modal with a styled file uploader to update the CV
    const result = await MySwal.fire({
      title: "Resume Management",
      customClass: {
        container: 'cv-modal-container',
        popup: 'cv-modal-popup',
        title: 'cv-modal-title',
        confirmButton: 'cv-btn',
        denyButton: 'cv-btn-delete',
        cancelButton: 'cv-btn-cancel',
      },
      buttonsStyling: false,
      showClass: {
        popup: 'animate__animated animate__fadeIn'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOut'
      },
      html: `
        <div class="cv-container">
          <div class="cv-status-section">
            <p class="cv-status-label">Current Resume Status</p>
            ${currentCVDisplay}
          </div>
          
          <label for="swal-input-cv" class="cv-upload-area">
            <div class="cv-upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p class="cv-upload-text">Upload your Resume</p>
            <p class="cv-upload-subtext">Click to select a PDF file</p>
            <p id="swal-input-cv-name" class="cv-file-name"></p>
            <input type="file" id="swal-input-cv" class="hidden" accept="application/pdf" style="display: none;" />
          </label>
          
          <div class="cv-size-limit">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Maximum file size: 2MB</span>
          </div>
        </div>
      `,
      didOpen: () => {
        addStyles();
        
        // When the modal opens, add a listener to update the label with the file name
        const fileInput = document.getElementById("swal-input-cv");
        const fileName = document.getElementById("swal-input-cv-name");
        fileInput.addEventListener("change", () => {
          if (fileInput.files && fileInput.files.length > 0) {
            // Check file size (2MB limit)
            const MAX_FILE_SIZE_MB = 2;
            const fileSizeMB = fileInput.files[0].size / (1024 * 1024);
            
            if (fileSizeMB > MAX_FILE_SIZE_MB) {
              Swal.showValidationMessage(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
              fileInput.value = null; // Clear the file input
              fileName.textContent = "";
              fileName.classList.remove("visible");
              return;
            }
            
            fileName.textContent = fileInput.files[0].name;
            fileName.classList.add("visible");
          } else {
            fileName.textContent = "";
            fileName.classList.remove("visible");
          }
        });
      },
      focusConfirm: false,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Upload",
      denyButtonText: "Delete",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        // Get the selected file from the file input
        const cvFile = document.getElementById("swal-input-cv").files[0];
        if (!cvFile) {
          Swal.showValidationMessage("Please select a PDF file");
          return false;
        } else if (cvFile.type !== "application/pdf") {
          Swal.showValidationMessage("Only PDF files are allowed");
          return false;
        }
        
        // Check file size (2MB limit)
        const MAX_FILE_SIZE_MB = 2;
        const fileSizeMB = cvFile.size / (1024 * 1024);
        if (fileSizeMB > MAX_FILE_SIZE_MB) {
          Swal.showValidationMessage(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
          return false;
        }
        
        return cvFile;
      },
    });

    if (result.isDenied) {
      // User clicked "Delete CV"
      const confirmDeletion = await MySwal.fire({
        title: "Delete Resume?",
        text: "Are you sure you want to delete your resume?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
        customClass: {
          popup: 'cv-modal-popup',
          title: 'cv-modal-title',
          confirmButton: 'cv-btn-delete',
          cancelButton: 'cv-btn-cancel',
        },
        buttonsStyling: false
      });
      
      if (confirmDeletion.isConfirmed) {
        // Show loading modal while deletion is in progress
        Swal.fire({
          title: "Deleting Resume...",
          html: "Please wait while we delete your resume...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
          customClass: {
            popup: 'cv-modal-popup',
            title: 'cv-modal-title',
          }
        });
        
        // Call the delete endpoint using user's email
        const deleteResponse = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/personal/jobseeker/cv/delete?email=${encodeURIComponent(user.email)}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
        );
        const deleteData = await deleteResponse.json();
        Swal.close();
        
        if (deleteResponse.ok) {
          // On successful deletion, show success message
          Swal.fire({
            icon: "success",
            title: "Resume Deleted",
            text: deleteData.message,
            customClass: {
              popup: 'cv-modal-popup',
              title: 'cv-modal-title',
              confirmButton: 'cv-btn',
            },
            buttonsStyling: false
          }).then(() => {
            // Update the user state by removing the CV and its analyzed content
            const updatedUser = { ...user };
            delete updatedUser.cv;
            delete updatedUser.cvContent;
            delete updatedUser.analyzed_cv_content;
            // Create a new state object with updated user info
            const newState = {
              user: updatedUser,
              isVerified: user.isVerified
            };

            // Remove any stored relevance scores from local storage since the CV was deleted
            const localStorageKey = `relevance_data_${user.id || user._id}`;
            localStorage.removeItem(localStorageKey);

            // Navigate to the current location with the updated user state
            navigate(location.pathname, { state: newState });
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: deleteData.message || "Failed to delete resume",
            customClass: {
              popup: 'cv-modal-popup',
              title: 'cv-modal-title',
              confirmButton: 'cv-btn',
            },
            buttonsStyling: false
          });
        }
      }
    } else if (result.isConfirmed) {
      // User clicked "Upload" and provided a file
      const file = result.value;
      // Immediately show a loading modal while uploading
      Swal.fire({
        title: "Processing Resume...",
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
            <div>Analyzing your resume using our AI...</div>
            <div class="progress-container" style="width: 100%; height: 6px; background-color: #e2e8f0; border-radius: 10px; overflow: hidden;">
              <div class="progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #4f74e3, #7662e0); border-radius: 10px; transition: width 0.5s ease;"></div>
            </div>
          </div>
        `,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
          
          // Animate progress bar to show activity
          const progressBar = document.querySelector('.progress-bar');
          if (progressBar) {
            progressBar.style.width = '15%';
            
            setTimeout(() => {
              progressBar.style.width = '40%';
            }, 2000);
            
            setTimeout(() => {
              progressBar.style.width = '65%';
            }, 5000);
          }
        },
        customClass: {
          popup: 'cv-modal-popup',
          title: 'cv-modal-title',
        }
      });
      
      try {
        // Process the CV file to extract and analyze its content using AI
        const { analyzedContent, rawContent } = await processCV(file);
        
        // Update progress bar to 85%
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
          progressBar.style.width = '85%';
        }
        
        // Prepare form data with the file and its analyzed content
        const formData = new FormData();
        formData.append("cv", file);
        formData.append("analyzed_cv_content", JSON.stringify(analyzedContent));
        formData.append("cvContent", rawContent);
        
        // Call the update CV endpoint using user's email
        const uploadResponse = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/personal/jobseeker/cv/update?email=${encodeURIComponent(user.email)}`,
          { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
        );
        
        // Complete progress bar
        if (progressBar) {
          progressBar.style.width = '100%';
        }
        
        const uploadData = await uploadResponse.json();
        Swal.close();
        
        if (uploadResponse.ok) {
          // On successful upload, show success message
          Swal.fire({
            icon: "success",
            title: "Resume Uploaded",
            text: uploadData.message,
            customClass: {
              popup: 'cv-modal-popup',
              title: 'cv-modal-title',
              confirmButton: 'cv-btn',
            },
            buttonsStyling: false
          }).then(() => {
            // Update user state with new CV URL and analyzed content
            const updatedUser = {
              ...user,
              cv: uploadData.cv,
              analyzed_cv_content: analyzedContent,
              cvContent: rawContent
            };
            // Build the new state object
            const newState = {
              user: updatedUser,
              isVerified: user.isVerified
            };

            // Remove any stored job listings relevance scores from local storage as CV changed
            const localStorageKey = `relevance_data_${user.id || user._id}`;
            localStorage.removeItem(localStorageKey);

            // Navigate to the current location with updated user state
            navigate(location.pathname, { state: newState });
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: uploadData.message || "Failed to update resume",
            customClass: {
              popup: 'cv-modal-popup',
              title: 'cv-modal-title',
              confirmButton: 'cv-btn',
            },
            buttonsStyling: false
          });
        }
      } catch (error) {
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Error Processing Resume",
          text: error.message || "Failed to process your resume. Please try again.",
          customClass: {
            popup: 'cv-modal-popup',
            title: 'cv-modal-title',
            confirmButton: 'cv-btn',
          },
          buttonsStyling: false
        });
      }
    }
  } catch (error) {
    // Show an error alert if something goes wrong
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "An error occurred",
      customClass: {
        popup: 'cv-modal-popup',
        title: 'cv-modal-title',
        confirmButton: 'cv-btn',
      },
      buttonsStyling: false
    });
  }
};

export default showUpdateCVModal;
