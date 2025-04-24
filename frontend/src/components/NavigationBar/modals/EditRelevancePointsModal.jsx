// EditRelevancePointsModal.jsx
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// Initialize SweetAlert with React Content
const MySwal = withReactContent(Swal);

const showEditRelevancePointsModal = async (user, navigate, location) => {
  // Current relevance points for matching criteria (state variable)
  const currentPoints = user.relevancePoints || {
    matchedJobRolePoints: 10,
    matchedSecurityClearancePoints: 20,
    matchedEducationPoints: 20,
    matchedSkillPoints: 3,
    matchedWorkExperiencePoints: 30,
  };

  // Default values for relevance points (used in reset)
  const defaultPoints = {
    matchedJobRolePoints: 10,
    matchedSecurityClearancePoints: 20,
    matchedEducationPoints: 20,
    matchedSkillPoints: 3,
    matchedWorkExperiencePoints: 30,
  };

  // Use the nullish coalescing operator so that a value of 0 is valid
  const currentMinPoints = user.minPointsForUpdate ?? 50;
  const defaultMinPoints = 50;
  
  // Add styles when modal opens
  const addStyles = () => {
    const styleElement = document.createElement('style');
    styleElement.id = 'relevance-modal-styles';
    styleElement.innerHTML = `
      .relevance-modal-container {
        backdrop-filter: blur(8px);
      }
      
      .relevance-modal-popup {
        border-radius: 20px;
        background: linear-gradient(145deg, #ffffff, #f8f9ff);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05);
        padding: 28px;
        border: 1px solid rgba(230, 230, 250, 0.4);
        max-width: 480px;
        width: 100%;
      }
      
      .relevance-modal-title {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-weight: 700;
        font-size: 1.6rem;
        color: #1a202c;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .relevance-container {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      
      .relevance-section {
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e2e8f0;
      }
      
      .relevance-section:last-of-type {
        border-bottom: none;
      }
      
      .relevance-section-title {
        font-size: 18px;
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 16px;
        padding-left: 4px;
      }
      
      .relevance-slider-group {
        margin-bottom: 16px;
      }
      
      .relevance-slider-group:last-child {
        margin-bottom: 0;
      }
      
      .relevance-slider-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      
      .relevance-slider-text {
        font-size: 15px;
        font-weight: 500;
        color: #4a5568;
      }
      
      .relevance-slider-value {
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 12px;
        background: linear-gradient(135deg, #4f74e3, #7662e0);
        color: white;
        font-size: 14px;
      }
      
      .relevance-slider {
        -webkit-appearance: none;
        width: 100%;
        height: 8px;
        border-radius: 8px;
        outline: none;
        transition: all 0.2s;
      }
      
      .relevance-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: white;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        border: 2px solid #4f74e3;
        transition: all 0.2s;
      }
      
      .relevance-slider::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
      }
      
      .relevance-slider-job {
        background: linear-gradient(90deg, #e6efff, #4f74e3);
      }
      
      .relevance-slider-security {
        background: linear-gradient(90deg, #e6fff0, #38b2ac);
      }
      
      .relevance-slider-education {
        background: linear-gradient(90deg, #f0e6ff, #9f7aea);
      }
      
      .relevance-slider-skill {
        background: linear-gradient(90deg, #fffde6, #ecc94b);
      }
      
      .relevance-slider-work {
        background: linear-gradient(90deg, #ffe6e6, #f56565);
      }
      
      .relevance-slider-min {
        background: linear-gradient(90deg, #f2f2f2, #718096);
      }
      
      .relevance-reset-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        background-color: #fff5f5;
        color: #e53e3e;
        border: 1px solid rgba(229, 62, 62, 0.2);
        border-radius: 14px;
        padding: 12px 24px;
        font-weight: 500;
        font-size: 15px;
        transition: all 0.2s ease;
        margin-top: 16px;
        cursor: pointer;
      }
      
      .relevance-reset-btn:hover {
        background-color: #fed7d7;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(229, 62, 62, 0.15);
      }
      
      .relevance-btn-save {
        background: linear-gradient(135deg, #4f74e3, #7662e0);
        color: white;
        box-shadow: 0 4px 12px rgba(79, 116, 227, 0.2);
        border-radius: 14px;
        font-weight: 500;
        padding: 12px 24px;
        font-size: 15px;
        transition: all 0.2s ease;
        border: none;
      }
      
      .relevance-btn-save:hover {
        background: linear-gradient(135deg, #3a61d9, #6450d9);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(79, 116, 227, 0.3);
      }
      
      .relevance-btn-cancel {
        background: white;
        color: #6c757d;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-radius: 14px;
        font-weight: 500;
        padding: 12px 24px;
        font-size: 15px;
        transition: all 0.2s ease;
        border: none;
      }
      
      .relevance-btn-cancel:hover {
        background: #f8f9fa;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      /* Responsive styles */
      @media screen and (max-width: 480px) {
        .relevance-modal-popup {
          padding: 20px;
        }
        
        .relevance-btn-save, 
        .relevance-btn-cancel {
          padding: 10px 16px;
          font-size: 14px;
        }
      }
    `;
    document.head.appendChild(styleElement);
  };

  const { value: result } = await MySwal.fire({
    title: "Relevance Settings",
    html: `
      <div class="relevance-container">
        <!-- Relevance Points Section -->
        <div class="relevance-section">
          <h2 class="relevance-section-title">Matching Criteria Points</h2>
          
          <!-- Job Role Slider -->
          <div class="relevance-slider-group">
            <div class="relevance-slider-label">
              <span class="relevance-slider-text">Job Role</span>
              <span id="jobRolePointsVal" class="relevance-slider-value">${currentPoints.matchedJobRolePoints}</span>
            </div>
            <input 
              id="jobRolePoints" 
              type="range" 
              min="0" 
              max="50" 
              value="${currentPoints.matchedJobRolePoints}"
              class="relevance-slider relevance-slider-job"
              oninput="document.getElementById('jobRolePointsVal').innerText = this.value" 
            />
          </div>
          
          <!-- Security Clearance Slider -->
          <div class="relevance-slider-group">
            <div class="relevance-slider-label">
              <span class="relevance-slider-text">Security Clearance</span>
              <span id="securityClearancePointsVal" class="relevance-slider-value">${currentPoints.matchedSecurityClearancePoints}</span>
            </div>
            <input 
              id="securityClearancePoints" 
              type="range" 
              min="0" 
              max="50" 
              value="${currentPoints.matchedSecurityClearancePoints}"
              class="relevance-slider relevance-slider-security"
              oninput="document.getElementById('securityClearancePointsVal').innerText = this.value" 
            />
          </div>
          
          <!-- Education Slider -->
          <div class="relevance-slider-group">
            <div class="relevance-slider-label">
              <span class="relevance-slider-text">Education</span>
              <span id="educationPointsVal" class="relevance-slider-value">${currentPoints.matchedEducationPoints}</span>
            </div>
            <input 
              id="educationPoints" 
              type="range" 
              min="0" 
              max="50" 
              value="${currentPoints.matchedEducationPoints}"
              class="relevance-slider relevance-slider-education"
              oninput="document.getElementById('educationPointsVal').innerText = this.value" 
            />
          </div>
          
          <!-- Skill Points Slider -->
          <div class="relevance-slider-group">
            <div class="relevance-slider-label">
              <span class="relevance-slider-text">Skills (per match)</span>
              <span id="skillPointsVal" class="relevance-slider-value">${currentPoints.matchedSkillPoints}</span>
            </div>
            <input 
              id="skillPoints" 
              type="range" 
              min="0" 
              max="10" 
              value="${currentPoints.matchedSkillPoints}"
              class="relevance-slider relevance-slider-skill"
              oninput="document.getElementById('skillPointsVal').innerText = this.value" 
            />
          </div>
          
          <!-- Work Experience Slider -->
          <div class="relevance-slider-group">
            <div class="relevance-slider-label">
              <span class="relevance-slider-text">Work Experience</span>
              <span id="workExperiencePointsVal" class="relevance-slider-value">${currentPoints.matchedWorkExperiencePoints}</span>
            </div>
            <input 
              id="workExperiencePoints" 
              type="range" 
              min="0" 
              max="50" 
              value="${currentPoints.matchedWorkExperiencePoints}"
              class="relevance-slider relevance-slider-work"
              oninput="document.getElementById('workExperiencePointsVal').innerText = this.value" 
            />
          </div>
        </div>
        
        <!-- Minimum Points Section -->
        <div class="relevance-section">
          <h2 class="relevance-section-title">Update Threshold</h2>
          <div class="relevance-slider-group">
            <div class="relevance-slider-label">
              <span class="relevance-slider-text">Minimum Points Required</span>
              <span id="minPointsVal" class="relevance-slider-value">${currentMinPoints}</span>
            </div>
            <input 
              id="minPoints" 
              type="range" 
              min="0" 
              max="200" 
              value="${currentMinPoints}"
              class="relevance-slider relevance-slider-min"
              oninput="document.getElementById('minPointsVal').innerText = this.value" 
            />
          </div>
        </div>
        
        <!-- Reset Button -->
        <button id="resetButton" class="relevance-reset-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
          Reset to Defaults
        </button>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Save Changes",
    cancelButtonText: "Cancel",
    customClass: {
      container: 'relevance-modal-container',
      popup: 'relevance-modal-popup',
      title: 'relevance-modal-title',
      confirmButton: 'relevance-btn-save',
      cancelButton: 'relevance-btn-cancel',
    },
    buttonsStyling: false,
    showClass: {
      popup: 'animate__animated animate__fadeIn'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOut'
    },
    didOpen: () => {
      addStyles();
      
      const resetButton = document.getElementById("resetButton");
      if (resetButton) {
        resetButton.addEventListener("click", () => {
          // Reset relevance points sliders
          const jobRoleInput = document.getElementById("jobRolePoints");
          const securityInput = document.getElementById("securityClearancePoints");
          const educationInput = document.getElementById("educationPoints");
          const skillInput = document.getElementById("skillPoints");
          const workExpInput = document.getElementById("workExperiencePoints");
          // Reset minimum points slider
          const minPointsInput = document.getElementById("minPoints");

          jobRoleInput.value = defaultPoints.matchedJobRolePoints;
          document.getElementById("jobRolePointsVal").innerText = defaultPoints.matchedJobRolePoints;

          securityInput.value = defaultPoints.matchedSecurityClearancePoints;
          document.getElementById("securityClearancePointsVal").innerText = defaultPoints.matchedSecurityClearancePoints;

          educationInput.value = defaultPoints.matchedEducationPoints;
          document.getElementById("educationPointsVal").innerText = defaultPoints.matchedEducationPoints;

          skillInput.value = defaultPoints.matchedSkillPoints;
          document.getElementById("skillPointsVal").innerText = defaultPoints.matchedSkillPoints;

          workExpInput.value = defaultPoints.matchedWorkExperiencePoints;
          document.getElementById("workExperiencePointsVal").innerText = defaultPoints.matchedWorkExperiencePoints;

          minPointsInput.value = defaultMinPoints;
          document.getElementById("minPointsVal").innerText = defaultMinPoints;
        });
      }
    },
    preConfirm: async () => {
      MySwal.showLoading();

      const jobRolePoints = document.getElementById("jobRolePoints").value;
      const securityClearancePoints = document.getElementById("securityClearancePoints").value;
      const educationPoints = document.getElementById("educationPoints").value;
      const skillPoints = document.getElementById("skillPoints").value;
      const workExperiencePoints = document.getElementById("workExperiencePoints").value;
      const minPoints = document.getElementById("minPoints").value;

      const updatedPoints = {
        matchedJobRolePoints: Number(jobRolePoints),
        matchedSecurityClearancePoints: Number(securityClearancePoints),
        matchedEducationPoints: Number(educationPoints),
        matchedSkillPoints: Number(skillPoints),
        matchedWorkExperiencePoints: Number(workExperiencePoints),
      };

      const updatedMinPoints = Number(minPoints);
      const token = localStorage.getItem("token");

      try {
        // Update relevance points in the database
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/personal/set-relevance-points`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email: user.email, relevancePoints: updatedPoints }),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to update relevance points");
        }

        // Update minimum points for update in the database
        const responseMin = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/personal/set-min-points-for-update`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email: user.email, minPointsForUpdate: updatedMinPoints }),
          }
        );
        const dataMin = await responseMin.json();
        if (!responseMin.ok) {
          throw new Error(dataMin.message || "Failed to update minimum points for update");
        }

        // Merge both updated points into one object and save to local storage
        const relevanceData = { ...updatedPoints, minPointsForUpdate: updatedMinPoints };
        localStorage.setItem("relevancePoints", JSON.stringify(relevanceData));

        // Clear cached relevance data so that new calculations are done
        const localStorageKey = `relevance_data_${user.id || user._id}`;
        localStorage.removeItem(localStorageKey);

        // Update the user state variable with the new relevance points and minPointsForUpdate
        const updatedUser = {
          ...user,
          relevancePoints: { ...updatedPoints, minPointsForUpdate: updatedMinPoints },
          minPointsForUpdate: updatedMinPoints,
        };

        // Prepare the updated state with the expected keys
        const updatedState = {
          user: updatedUser,
          isVerified: location.state?.isVerified || true,
        };

        // Navigate to current location with the updated state
        navigate(location.pathname, { state: updatedState });
        return { updatedPoints, updatedMinPoints };
      } catch (error) {
        MySwal.showValidationMessage(`Request failed: ${error}`);
      }
    },
  });

  if (result) {
    MySwal.fire({
      title: "Updated!",
      text: "Relevance settings updated successfully.",
      icon: "success",
      customClass: {
        popup: 'relevance-modal-popup',
        title: 'relevance-modal-title',
        confirmButton: 'relevance-btn-save',
      },
      buttonsStyling: false
    });
  }
};

export default showEditRelevancePointsModal;
