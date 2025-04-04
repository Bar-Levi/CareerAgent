export const updateApplicantStatus = async (applicant, status, refetchApplicants) => {
    try {
        // First, update the status
        const updateResponse = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/applicants/${applicant._id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ status, interviewId: applicant?.interviewId?._id }),
            }
        );

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || "Failed to update applicant status");
        }

        const data = await updateResponse.json();
        const otherApplicants = data?.otherApplicants;

        // Optionally refetch or refresh the data
        if (refetchApplicants) await refetchApplicants();
        

        // After successful status update, handle the status logic
        const logicResponse = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/applicants/handleEmailUpdates`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ status, interviewId: applicant?.interviewId?._id, otherApplicants, applicant: data.applicant }),
            }
        );

        // Even if the status logic fails, we don't throw an error since the status was updated successfully
        if (!logicResponse.ok) {
            console.error("Status logic handling failed but status was updated");
        }

    } catch (error) {
        console.error("Error updating status:", error);
        throw error;
    }
};