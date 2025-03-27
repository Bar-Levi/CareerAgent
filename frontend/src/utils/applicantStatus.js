export const updateApplicantStatus = async (applicantId, status, refetchApplicants) => {
    try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/applicants/${applicantId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ status }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to update applicant status"
          );
        }

        // Optionally refetch or refresh the data to see the new status
        if (refetchApplicants) refetchApplicants();

      } catch (error) {
        console.error("Error updating status:", error);
        // Show a user-friendly error message if needed
      }
  };