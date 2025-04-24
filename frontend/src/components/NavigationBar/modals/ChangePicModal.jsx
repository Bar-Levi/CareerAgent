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
    customClass: {
      container: 'change-pic-modal-container',
      popup: 'change-pic-modal-popup',
      title: 'change-pic-modal-title',
      confirmButton: 'change-pic-confirm-btn',
      cancelButton: 'change-pic-cancel-btn',
    },
    buttonsStyling: false,
    showClass: {
      popup: 'animate__animated animate__fadeIn'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOut'
    },
    html: `
      <div class="pic-modal-content">
        <div class="pic-preview-container">
          <div class="pic-preview-wrapper">
            <img id="pic-preview" src="${currentPic}" alt="${modalTitle}" class="pic-preview-image">
            <div class="pic-preview-overlay">
              <span class="pic-preview-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              </span>
            </div>
          </div>
        </div>
        <input type="file" id="pic-input" accept="image/*" class="pic-file-input">
        <div class="pic-info-bar">
          <div class="pic-info-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>Max: 2MB</span>
          </div>
          <div class="pic-info-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span>Best format: square</span>
          </div>
        </div>
        <div class="pic-button-group">
          <button id="change-btn" class="pic-button pic-button-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="18" height="18">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span>Upload Image</span>
          </button>
          <button id="delete-btn" class="pic-button pic-button-danger">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="18" height="18">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            <span>Remove</span>
          </button>
        </div>
        <div id="swal-upload-status" class="pic-upload-status"></div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Save Changes",
    cancelButtonText: "Cancel",
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
          return false;
        } 
        
        // Double-check file size before upload
        const fileSizeMB = fileInput.files[0].size / (1024 * 1024);
        const MAX_FILE_SIZE_MB = 2;
        if (fileSizeMB > MAX_FILE_SIZE_MB) {
          Swal.showValidationMessage(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
          return false;
        }
        
        // Show upload status message for all files
        Swal.showLoading();
        // Create upload status message
        const uploadStatusId = 'swal-upload-status';
        const existingStatus = document.getElementById(uploadStatusId);
        
        if (!existingStatus) {
          // Create a new status element if it doesn't exist
          const statusElement = document.createElement('div');
          statusElement.id = uploadStatusId;
          statusElement.className = 'pic-upload-status pic-upload-status-active';
          
          // Calculate expected upload time based on file size
          const expectedTime = fileSizeMB < 0.5 ? 'a few seconds' : 
                              fileSizeMB < 1 ? 'about 10 seconds' :
                              fileSizeMB < 1.5 ? 'about 15 seconds' : 
                              'up to 30 seconds';
          
          // Add progress indicator
          statusElement.innerHTML = `
            <div class="pic-upload-progress-container">
              <div class="pic-upload-progress-bar"></div>
            </div>
            <div class="pic-upload-progress-text">
              Uploading file (${fileSizeMB.toFixed(2)}MB)... Please wait ${expectedTime}
            </div>
          `;
          
          // Append to SweetAlert container
          const container = document.querySelector('.swal2-html-container');
          if (container) {
            const existingStatus = document.getElementById(uploadStatusId);
            if (existingStatus) {
              existingStatus.innerHTML = statusElement.innerHTML;
              existingStatus.className = statusElement.className;
            } else {
              container.appendChild(statusElement);
            }
          }
          
          // Animate progress bar at different speeds based on file size
          setTimeout(() => {
            const progressBar = document.querySelector('.pic-upload-progress-bar');
            if (progressBar) {
              // Smaller files move faster to 90%
              const initialWidth = fileSizeMB < 1 ? '50%' : 
                                  fileSizeMB < 1.5 ? '40%' : '30%';
              progressBar.style.width = initialWidth;
              
              // Second stage of progress
              setTimeout(() => {
                if (progressBar) {
                  const secondWidth = fileSizeMB < 1 ? '80%' : 
                                     fileSizeMB < 1.5 ? '65%' : '50%';
                  progressBar.style.width = secondWidth;
                  
                  // Third stage for larger files to show continued progress
                  if (fileSizeMB > 1) {
                    setTimeout(() => {
                      if (progressBar) progressBar.style.width = '75%';
                    }, 2000);
                  }
                }
              }, fileSizeMB < 1 ? 1000 : 2000);
            }
          }, 100);
        }
        
        const formData = new FormData();
        formData.append("file", fileInput.files[0]);
        formData.append("email", user.email);
        formData.append("picType", picType);

        try {
          // Define update status function first so it's available throughout the try block
          const updateUploadStatus = (message) => {
            const statusText = document.querySelector('.pic-upload-progress-text');
            if (statusText) statusText.textContent = message;
          };
          
          // For larger files (> 1MB), compress the image before uploading
          const fileSizeMB = fileInput.files[0].size / (1024 * 1024);
          
          // For files over 1MB, we'll compress them before uploading
          if (fileSizeMB > 1) {
            updateUploadStatus(`File is large (${fileSizeMB.toFixed(2)}MB). Compressing before upload...`);
            
            try {
              // Create a new compressed version of the image using canvas
              const img = new Image();
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // Set up promise to handle image loading
              const compressImage = new Promise((resolve, reject) => {
                img.onload = function() {
                  // Calculate new dimensions (maintain aspect ratio)
                  let width = img.width;
                  let height = img.height;
                  const MAX_WIDTH = 1200;
                  const MAX_HEIGHT = 1200;
                  
                  if (width > height) {
                    if (width > MAX_WIDTH) {
                      height = Math.round(height * (MAX_WIDTH / width));
                      width = MAX_WIDTH;
                    }
                  } else {
                    if (height > MAX_HEIGHT) {
                      width = Math.round(width * (MAX_HEIGHT / height));
                      height = MAX_HEIGHT;
                    }
                  }
                  
                  // Resize image
                  canvas.width = width;
                  canvas.height = height;
                  ctx.drawImage(img, 0, 0, width, height);
                  
                  // Get compressed image as blob with reduced quality
                  const quality = fileSizeMB > 1.5 ? 0.6 : 0.7;
                  canvas.toBlob(
                    (blob) => {
                      if (blob) {
                        const newSizeMB = blob.size / (1024 * 1024);
                        updateUploadStatus(`Compressed from ${fileSizeMB.toFixed(2)}MB to ${newSizeMB.toFixed(2)}MB. Uploading...`);
                        
                        // Create a new file from the blob
                        const compressedFile = new File(
                          [blob],
                          fileInput.files[0].name,
                          { type: 'image/jpeg', lastModified: Date.now() }
                        );
                        
                        // Replace the file in the form data
                        formData.delete('file');
                        formData.append('file', compressedFile);
                        
                        resolve();
                      } else {
                        reject(new Error('Failed to compress image'));
                      }
                    },
                    'image/jpeg',
                    quality
                  );
                };
                
                img.onerror = function() {
                  reject(new Error('Failed to load image for compression'));
                };
              });
              
              // Set the source to start loading
              img.src = URL.createObjectURL(fileInput.files[0]);
              
              // Wait for compression to complete
              await compressImage;
              
            } catch (compressionError) {
              console.error('Image compression failed:', compressionError);
              updateUploadStatus(`Compression failed. Uploading original file (${fileSizeMB.toFixed(2)}MB)...`);
              // Continue with original file if compression fails
            }
          }
          
          // Set a timeout for the fetch request - increase for larger files
          const controller = new AbortController();
          const timeoutDuration = fileSizeMB < 1 ? 20000 : 
                                 fileSizeMB < 1.5 ? 40000 : 60000; // More time for larger files
          const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
          
          // Start upload status updates
          const uploadStartTime = Date.now();
          const statusInterval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - uploadStartTime) / 1000);
            if (elapsedSeconds > 3) {
              updateUploadStatus(`Uploading... ${elapsedSeconds}s elapsed`);
            }
          }, 1000);
          
          // Create a fetch with upload progress tracking
          const sendFileWithProgress = async () => {
            return new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              
              xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                  const percentComplete = (event.loaded / event.total) * 100;
                  
                  // Update progress bar
                  const progressBar = document.querySelector('.pic-upload-progress-bar');
                  if (progressBar) {
                    progressBar.style.width = `${percentComplete}%`;
                  }
                  
                  // Update status text with percentage
                  updateUploadStatus(`Uploading: ${Math.round(percentComplete)}% complete`);
                }
              });
              
              xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  resolve({
                    ok: true,
                    json: () => Promise.resolve(JSON.parse(xhr.responseText))
                  });
                } else {
                  reject(new Error(`HTTP error: ${xhr.status}`));
                }
              });
              
              xhr.addEventListener('error', () => {
                reject(new Error('Network error occurred'));
              });
              
              xhr.addEventListener('abort', () => {
                reject(new Error('Upload aborted'));
              });
              
              xhr.addEventListener('timeout', () => {
                reject(new Error('Upload timed out'));
              });
              
              xhr.open('POST', baseEndpoint);
              xhr.setRequestHeader('Authorization', `Bearer ${token}`);
              xhr.timeout = timeoutDuration;
              xhr.send(formData);
            });
          };
          
          // Use custom XMLHttpRequest with progress tracking instead of fetch
          const response = await sendFileWithProgress();
          
          // Clear intervals and timeouts
          clearTimeout(timeoutId);
          clearInterval(statusInterval);
          
          // Complete the progress bar if not already at 100%
          const progressBar = document.querySelector('.pic-upload-progress-bar');
          if (progressBar) {
            progressBar.style.width = '100%';
          }
          
          // Update status
          updateUploadStatus('Upload complete! Processing image...');
          
          if (!response.ok) {
            throw new Error('Server responded with an error');
          }
          
          const data = await response.json();

          // Update status to success
          updateUploadStatus('Success! Image uploaded and processed.');

          // The backend returns: { message, profilePic, companyLogo }
          // We'll pick whichever we actually changed
          const newUrl = isCompanyLogo ? data.companyLogo : data.profilePic;

          return {
            action: "change",
            message: data.message,
            newUrl,
          };
        } catch (error) {
          console.error("Image upload error:", error);
          if (error.name === 'AbortError') {
            Swal.showValidationMessage("Upload timed out. Please try a smaller image or check your connection.");
          } else {
            Swal.showValidationMessage(`Upload failed: ${error.message}`);
          }
          return false;
        }
      }
      
      // If user didn't do either, return null to skip
      return null;
    },
    didOpen: () => {
      // Add custom styles to the document
      const styleElement = document.createElement('style');
      styleElement.innerHTML = `
        .change-pic-modal-container {
          backdrop-filter: blur(6px);
        }
        
        .change-pic-modal-popup {
          border-radius: 20px;
          background: linear-gradient(145deg, #ffffff, #f5f8ff);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05);
          padding: 24px;
          border: 1px solid rgba(220, 220, 250, 0.3);
          max-width: 440px;
          width: 100%;
        }
        
        .change-pic-modal-title {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 700;
          font-size: 1.5rem;
          color: #1a202c;
          margin-bottom: 24px;
          text-align: center;
        }
        
        .pic-modal-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
        }
        
        .pic-preview-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }
        
        .pic-preview-wrapper {
          position: relative;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          overflow: hidden;
          background-color: #f0f4f8;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .pic-preview-wrapper:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }
        
        .pic-preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: filter 0.3s ease;
        }
        
        .pic-preview-wrapper:hover .pic-preview-image {
          filter: brightness(0.8);
        }
        
        .pic-preview-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(0, 0, 0, 0.3);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .pic-preview-wrapper:hover .pic-preview-overlay {
          opacity: 1;
        }
        
        .pic-preview-icon {
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pic-file-input {
          display: none;
        }
        
        .pic-info-bar {
          display: flex;
          justify-content: center;
          gap: 24px;
          font-size: 13px;
          color: #64748b;
        }
        
        .pic-info-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .pic-button-group {
          display: flex;
          gap: 12px;
          margin-top: 4px;
        }
        
        .pic-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 14px;
          font-weight: 500;
          font-size: 15px;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }
        
        .pic-button:focus {
          outline: none;
        }
        
        .pic-button-primary {
          background: linear-gradient(135deg, #4f74e3, #7662e0);
          color: white;
          box-shadow: 0 4px 10px rgba(79, 116, 227, 0.2);
        }
        
        .pic-button-primary:hover, .pic-button-primary:focus {
          background: linear-gradient(135deg, #3a61d9, #6450d9);
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(79, 116, 227, 0.3);
        }
        
        .pic-button-danger {
          background: white;
          color: #e53e3e;
          border: 1px solid rgba(229, 62, 62, 0.3);
        }
        
        .pic-button-danger:hover, .pic-button-danger:focus {
          background: #fff5f5;
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(229, 62, 62, 0.1);
        }
        
        .change-pic-confirm-btn,
        .change-pic-cancel-btn {
          border-radius: 12px;
          font-weight: 500;
          padding: 12px 20px;
          margin: 0 8px;
          font-size: 15px;
          transition: all 0.2s ease;
          border: none;
          outline: none;
        }
        
        .change-pic-confirm-btn {
          background: #3a61d9;
          color: white;
          box-shadow: 0 4px 12px rgba(58, 97, 217, 0.2);
        }
        
        .change-pic-confirm-btn:hover {
          background: #2d4eb8;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(58, 97, 217, 0.3);
        }
        
        .change-pic-cancel-btn {
          background: white;
          color: #6c757d;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .change-pic-cancel-btn:hover {
          background: #f8f9fa;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }
        
        .pic-upload-status {
          margin-top: 5px;
          display: none;
        }
        
        .pic-upload-status-active {
          display: block;
        }
        
        .pic-upload-progress-container {
          width: 100%;
          height: 6px;
          background-color: #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        
        .pic-upload-progress-bar {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #4f74e3, #7662e0);
          border-radius: 10px;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .pic-upload-progress-text {
          font-size: 13px;
          color: #4a5568;
          text-align: center;
        }
        
        /* Full screen preview */
        .pic-fullscreen-preview {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        
        .pic-fullscreen-preview.active {
          opacity: 1;
          visibility: visible;
        }
        
        .pic-fullscreen-image {
          max-width: 90%;
          max-height: 90%;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .pic-fullscreen-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.9);
          color: #1a202c;
          border: none;
          border-radius: 12px;
          padding: 12px 20px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          backdrop-filter: blur(5px);
        }
        
        .pic-fullscreen-close:hover {
          background: white;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        @media (max-width: 768px) {
          .pic-preview-wrapper {
            width: 140px;
            height: 140px;
          }
          
          .pic-button-group {
            flex-direction: column;
          }
          
          .change-pic-confirm-btn,
          .change-pic-cancel-btn {
            padding: 10px 16px;
            font-size: 14px;
          }
        }
      `;
      document.head.appendChild(styleElement);

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
            // Check file size (2MB limit)
            const fileSizeMB = fileInput.files[0].size / (1024 * 1024);
            const MAX_FILE_SIZE_MB = 2;
            
            if (fileSizeMB > MAX_FILE_SIZE_MB) {
              Swal.showValidationMessage(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
              fileInput.value = null; // Clear the file input
              return;
            }
            
            // Show file size info for files approaching the limit
            if (fileSizeMB > 1.5) {
              const fileSizeWarning = document.createElement('div');
              fileSizeWarning.className = 'pic-size-warning';
              fileSizeWarning.innerHTML = `
                <div class="pic-size-warning-content">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <span>Large file (${fileSizeMB.toFixed(2)}MB of 2MB limit). Upload may take longer.</span>
                </div>
              `;
              
              // Add warning to DOM if not already there
              const existingWarning = document.querySelector('.pic-size-warning');
              if (!existingWarning) {
                const buttonGroup = document.querySelector('.pic-button-group');
                if (buttonGroup && buttonGroup.parentNode) {
                  buttonGroup.parentNode.insertBefore(fileSizeWarning, buttonGroup.nextSibling);
                }
              } else {
                existingWarning.innerHTML = fileSizeWarning.innerHTML;
              }
              
              // Update styles to include this warning
              const additionalStyle = document.createElement('style');
              additionalStyle.innerHTML = `
                .pic-size-warning {
                  margin-top: 10px;
                  padding: 8px 12px;
                  background-color: #fffbeb;
                  border: 1px solid #fde68a;
                  border-radius: 8px;
                  color: #d97706;
                }
                
                .pic-size-warning-content {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  font-size: 13px;
                }
              `;
              document.head.appendChild(additionalStyle);
            }
            
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
      
      // Clicking the preview image opens a full-screen overlay
      if (previewImg) {
        const previewWrapper = document.querySelector('.pic-preview-wrapper');
        
        // Make sure we attach the event to both the image and wrapper
        const handlePreviewClick = () => {
          // Add animation classes to Swal for the document first
          if (!document.querySelector('.animate-css-styles')) {
            const animationStyles = document.createElement('style');
            animationStyles.className = 'animate-css-styles';
            animationStyles.textContent = `
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
              }
              .animate__fadeIn {
                animation: fadeIn 0.3s ease-in-out forwards;
              }
              .animate__fadeOut {
                animation: fadeOut 0.3s ease-in-out forwards;
              }
            `;
            document.head.appendChild(animationStyles);
          }
          
          // Create fullscreen preview container
          const previewContainer = document.createElement('div');
          previewContainer.className = 'pic-fullscreen-preview';
          document.body.appendChild(previewContainer);
          
          // Create image element
          const fullImg = document.createElement('img');
          fullImg.className = 'pic-fullscreen-image';
          fullImg.src = previewImg.src;
          fullImg.alt = 'Full-size preview';
          previewContainer.appendChild(fullImg);
          
          // Create close button
          const closeBtn = document.createElement('button');
          closeBtn.className = 'pic-fullscreen-close';
          closeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="18" height="18">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Close Preview</span>
          `;
          previewContainer.appendChild(closeBtn);
          
          // Handle close button click
          closeBtn.addEventListener('click', () => {
            previewContainer.classList.remove('active');
            setTimeout(() => {
              if (previewContainer.parentNode) {
                previewContainer.parentNode.removeChild(previewContainer);
              }
            }, 300);
          });
          
          // Also close on click outside the image
          previewContainer.addEventListener('click', (event) => {
            if (event.target === previewContainer) {
              closeBtn.click();
            }
          });
          
          // Add extra styles specifically for this instance
          const previewStyles = document.createElement('style');
          previewStyles.innerHTML = `
            .pic-fullscreen-preview {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.85);
              backdrop-filter: blur(5px);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 10000;
              opacity: 0;
              visibility: hidden;
              transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            
            .pic-fullscreen-preview.active {
              opacity: 1;
              visibility: visible;
            }
            
            .pic-fullscreen-image {
              max-width: 90%;
              max-height: 90%;
              border-radius: 12px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
              object-fit: contain;
              transition: transform 0.3s ease;
            }
            
            .pic-fullscreen-close {
              position: absolute;
              top: 20px;
              right: 20px;
              background: rgba(255, 255, 255, 0.9);
              color: #1a202c;
              border: none;
              border-radius: 12px;
              padding: 10px 18px;
              font-weight: 500;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 8px;
              transition: all 0.2s ease;
              backdrop-filter: blur(5px);
              font-size: 14px;
            }
            
            .pic-fullscreen-close:hover {
              background: white;
              transform: translateY(-2px);
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
            
            @media (max-width: 768px) {
              .pic-fullscreen-close {
                padding: 8px 12px;
                font-size: 12px;
                top: 10px;
                right: 10px;
              }
            }
          `;
          document.head.appendChild(previewStyles);
          
          // Add active class after small delay to trigger transition
          requestAnimationFrame(() => {
            previewContainer.classList.add('active');
          });
        };
        
        // Attach event handlers to both image and wrapper
        if (previewWrapper) {
          previewWrapper.addEventListener('click', handlePreviewClick);
        }
        previewImg.addEventListener('click', handlePreviewClick);
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
      swalPromise = Swal.fire({
        icon: "success",
        title: "Image Removed",
        text: result.message,
        customClass: {
          popup: 'change-pic-modal-popup',
          title: 'change-pic-modal-title',
          confirmButton: 'change-pic-confirm-btn'
        },
        buttonsStyling: false
      });
    } else if (result.action === "change") {
      // Update user property with new URL
      if (isCompanyLogo) {
        user.companyLogo = result.newUrl;
      } else {
        user.profilePic = result.newUrl;
      }
      swalPromise = Swal.fire({
        icon: "success",
        title: "Image Updated",
        text: result.message,
        customClass: {
          popup: 'change-pic-modal-popup',
          title: 'change-pic-modal-title',
          confirmButton: 'change-pic-confirm-btn'
        },
        buttonsStyling: false
      });
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
