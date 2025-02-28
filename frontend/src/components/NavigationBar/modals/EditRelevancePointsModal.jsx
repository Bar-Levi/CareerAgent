// EditRelevancePointsModal.jsx
import Swal from "sweetalert2";

const showEditRelevancePointsModal = async (user, navigate, location) => {
  const currentPoints = user.relevancePoints || {
    matchedJobRolePoints: 10,
    matchedSecurityClearancePoints: 20,
    matchedEducationPoints: 20,
    matchedSkillPoints: 3,
    matchedWorkExperiencePoints: 30,
  };

  const { value: result } = await Swal.fire({
    title: "Edit Relevance Points",
    html: `
      <div class="flex flex-col items-center bg-white p-4 rounded-lg">
        <div class="w-full mb-3">
          <label class="block text-left mb-1">
            Job Role Points: <span id="jobRolePointsVal">${currentPoints.matchedJobRolePoints}</span>
          </label>
          <input id="jobRolePoints" type="range" min="0" max="50" value="${currentPoints.matchedJobRolePoints}" class="swal2-input" oninput="document.getElementById('jobRolePointsVal').innerText = this.value" />
        </div>
        <div class="w-full mb-3">
          <label class="block text-left mb-1">
            Security Clearance Points: <span id="securityClearancePointsVal">${currentPoints.matchedSecurityClearancePoints}</span>
          </label>
          <input id="securityClearancePoints" type="range" min="0" max="50" value="${currentPoints.matchedSecurityClearancePoints}" class="swal2-input" oninput="document.getElementById('securityClearancePointsVal').innerText = this.value" />
        </div>
        <div class="w-full mb-3">
          <label class="block text-left mb-1">
            Education Points: <span id="educationPointsVal">${currentPoints.matchedEducationPoints}</span>
          </label>
          <input id="educationPoints" type="range" min="0" max="50" value="${currentPoints.matchedEducationPoints}" class="swal2-input" oninput="document.getElementById('educationPointsVal').innerText = this.value" />
        </div>
        <div class="w-full mb-3">
          <label class="block text-left mb-1">
            Skill Points (per skill): <span id="skillPointsVal">${currentPoints.matchedSkillPoints}</span>
          </label>
          <input id="skillPoints" type="range" min="0" max="10" value="${currentPoints.matchedSkillPoints}" class="swal2-input" oninput="document.getElementById('skillPointsVal').innerText = this.value" />
        </div>
        <div class="w-full mb-3">
          <label class="block text-left mb-1">
            Work Experience Points: <span id="workExperiencePointsVal">${currentPoints.matchedWorkExperiencePoints}</span>
          </label>
          <input id="workExperiencePoints" type="range" min="0" max="50" value="${currentPoints.matchedWorkExperiencePoints}" class="swal2-input" oninput="document.getElementById('workExperiencePointsVal').innerText = this.value" />
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Save",
    preConfirm: async () => {
      Swal.showLoading();

      const jobRolePoints = document.getElementById("jobRolePoints").value;
      const securityClearancePoints = document.getElementById("securityClearancePoints").value;
      const educationPoints = document.getElementById("educationPoints").value;
      const skillPoints = document.getElementById("skillPoints").value;
      const workExperiencePoints = document.getElementById("workExperiencePoints").value;

      const updatedPoints = {
        matchedJobRolePoints: Number(jobRolePoints),
        matchedSecurityClearancePoints: Number(securityClearancePoints),
        matchedEducationPoints: Number(educationPoints),
        matchedSkillPoints: Number(skillPoints),
        matchedWorkExperiencePoints: Number(workExperiencePoints),
      };

      const token = localStorage.getItem("token");

      try {
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
        localStorage.setItem("relevancePoints", JSON.stringify(updatedPoints));

        // Clear cached relevance data so that new calculations are done
        const localStorageKey = `relevance_data_${user.id || user._id}`;
        localStorage.removeItem(localStorageKey);

        // Update the user object if needed
        location.state.user.relevancePoints = updatedPoints;
        location.state.refreshToken = 0;

        // Optionally, re-navigate to force a refresh:
        navigate(location.pathname, { state: location.state });
        return updatedPoints;
      } catch (error) {
        Swal.showValidationMessage(`Request failed: ${error}`);
      }
    },
  });

  if (result) {
    Swal.fire("Updated!", "Relevance points updated successfully.", "success");
  }
};

export default showEditRelevancePointsModal;
