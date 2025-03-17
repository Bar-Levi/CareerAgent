// EditRelevancePointsModal.jsx
import Swal from "sweetalert2";

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

  const { value: result } = await Swal.fire({
    title: "Edit Relevance Settings",
    html: `
      <div class="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg">
        <!-- Relevance Points Section -->
        <div class="w-full mb-6 border-b pb-4">
          <h2 class="text-xl font-bold mb-4 text-gray-700">Relevance Points</h2>
          <!-- Job Role Slider -->
          <div class="w-full mb-4">
            <label class="block text-left mb-1 font-medium">
              Job Role Points: <span id="jobRolePointsVal" class="font-bold text-blue-600">${currentPoints.matchedJobRolePoints}</span>
            </label>
            <input id="jobRolePoints" type="range" min="0" max="50" value="${currentPoints.matchedJobRolePoints}"
                   class="w-full h-2 rounded-lg appearance-none bg-blue-200 cursor-pointer transition-all duration-300 hover:bg-blue-300"
                   style="touch-action: auto;"
                   oninput="document.getElementById('jobRolePointsVal').innerText = this.value" />
          </div>
          <!-- Security Clearance Slider -->
          <div class="w-full mb-4">
            <label class="block text-left mb-1 font-medium">
              Security Clearance Points: <span id="securityClearancePointsVal" class="font-bold text-blue-600">${currentPoints.matchedSecurityClearancePoints}</span>
            </label>
            <input id="securityClearancePoints" type="range" min="0" max="50" value="${currentPoints.matchedSecurityClearancePoints}"
                   class="w-full h-2 rounded-lg appearance-none bg-green-200 cursor-pointer transition-all duration-300 hover:bg-green-300"
                   style="touch-action: auto;"
                   oninput="document.getElementById('securityClearancePointsVal').innerText = this.value" />
          </div>
          <!-- Education Slider -->
          <div class="w-full mb-4">
            <label class="block text-left mb-1 font-medium">
              Education Points: <span id="educationPointsVal" class="font-bold text-blue-600">${currentPoints.matchedEducationPoints}</span>
            </label>
            <input id="educationPoints" type="range" min="0" max="50" value="${currentPoints.matchedEducationPoints}"
                   class="w-full h-2 rounded-lg appearance-none bg-purple-200 cursor-pointer transition-all duration-300 hover:bg-purple-300"
                   style="touch-action: auto;"
                   oninput="document.getElementById('educationPointsVal').innerText = this.value" />
          </div>
          <!-- Skill Points Slider -->
          <div class="w-full mb-4">
            <label class="block text-left mb-1 font-medium">
              Skill Points (per skill): <span id="skillPointsVal" class="font-bold text-blue-600">${currentPoints.matchedSkillPoints}</span>
            </label>
            <input id="skillPoints" type="range" min="0" max="10" value="${currentPoints.matchedSkillPoints}"
                   class="w-full h-2 rounded-lg appearance-none bg-yellow-200 cursor-pointer transition-all duration-300 hover:bg-yellow-300"
                   style="touch-action: auto;"
                   oninput="document.getElementById('skillPointsVal').innerText = this.value" />
          </div>
          <!-- Work Experience Slider -->
          <div class="w-full">
            <label class="block text-left mb-1 font-medium">
              Work Experience Points: <span id="workExperiencePointsVal" class="font-bold text-blue-600">${currentPoints.matchedWorkExperiencePoints}</span>
            </label>
            <input id="workExperiencePoints" type="range" min="0" max="50" value="${currentPoints.matchedWorkExperiencePoints}"
                   class="w-full h-2 rounded-lg appearance-none bg-red-200 cursor-pointer transition-all duration-300 hover:bg-red-300"
                   style="touch-action: auto;"
                   oninput="document.getElementById('workExperiencePointsVal').innerText = this.value" />
          </div>
        </div>
        <!-- Minimum Points for Update Section -->
        <div class="w-full mb-4">
          <h2 class="text-xl font-bold mb-4 text-gray-700">Minimum Points for Update</h2>
          <div class="w-full">
            <label class="block text-left mb-1 font-medium">
              Minimum Points: <span id="minPointsVal" class="font-bold text-blue-600">${currentMinPoints}</span>
            </label>
            <input id="minPoints" type="range" min="0" max="200" value="${currentMinPoints}"
                   class="w-full h-2 rounded-lg appearance-none bg-gray-200 cursor-pointer transition-all duration-300 hover:bg-gray-300"
                   style="touch-action: auto;"
                   oninput="document.getElementById('minPointsVal').innerText = this.value" />
          </div>
        </div>
        <!-- Reset Button -->
        <div class="w-full text-center mt-4">
          <button id="resetButton" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded transition-all duration-300">
            Reset Defaults
          </button>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Save",
    didOpen: () => {
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
      Swal.showLoading();

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
          email: updatedUser.email,
          role: updatedUser.role,
          isVerified: location.state?.isVerified || true,
        };

        // Navigate to /dashboard with the updated state
        navigate("/dashboard", { state: updatedState });
        return { updatedPoints, updatedMinPoints };
      } catch (error) {
        Swal.showValidationMessage(`Request failed: ${error}`);
      }
    },
  });

  if (result) {
    Swal.fire("Updated!", "Relevance settings updated successfully.", "success");
  }
};

export default showEditRelevancePointsModal;
