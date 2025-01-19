import React, { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";

const JobListingCard = ({ jobListing, user, setUser, setShowModal, showNotification }) => {
  const {
    jobRole,
    company,
    location,
    experienceLevel,
    companySize,
    jobType,
    remote,
    companyWebsite,
    recruiterName,
    recruiterProfileImage,
    applicants,
    education,
    skills,
    _id: jobId,
    recruiterId,
    createdAt,
  } = jobListing;

  const [appliedCounter, setAppliedCounter] = useState(applicants?.length || 0);
  const [applyButtonEnabled, setApplyButtonEnabled] = useState(true);

  const handleApplyNow = async () => {
    if (!user.cv || user.cv === "") {
      setShowModal(true); // Show modal if CV is missing
      return;
    }
    try {

      console.log(user.fullName,
        user.email,
        user.phone,
        user.linkedinUrl,
        user.githubUrl,
        user.cv,
        user._id,
        user.profilePic,
        jobId,
        recruiterId,
        jobRole)
      // Create the new applicant
      const applicantResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/applicants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
          body: JSON.stringify({
            name: user.fullName,
            email: user.email,
            phone: user.phone,
            linkedinUrl: user.linkedinUrl,
            githubUrl: user.githubUrl,
            cv: user.cv,
            jobId: jobId,
            recruiterId: recruiterId,
            jobSeekerId: user._id,
            jobTitle: jobRole,
            profilePic: user.profilePic,
          }),
        }
      );

      if (applicantResponse.ok) {
        const applicantData = await applicantResponse.json();
        console.log("Applicant created successfully:", applicantData);

        // Update the job listing's applicants list
        const updateJobResponse = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/joblistings/${jobId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
            body: JSON.stringify({
              $push: {
                applicants: {
                  applicantId: applicantData.applicant._id,
                  jobSeekerId: user._id,
                },
              },
            }),
          }
        );

        if (updateJobResponse.ok) {
          showNotification("success", "Application submitted successfully!");
          setAppliedCounter((prev) => prev + 1); // Increment counter
          setApplyButtonEnabled(false); // Disable the button
        } else {
          showNotification("error", "Failed to update job listing with the new applicant.");
        }
      } else {
        showNotification("error", "Failed to create applicant.");
      }
    } catch (error) {
      console.error("Error applying for the job:", error);
      showNotification("error", "An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    // Check if the current user has already applied for this job
    const existingApplicant = applicants?.find(
      (applicant) => applicant.jobSeekerId === user._id
    );

    if (existingApplicant) {
      setApplyButtonEnabled(false); // Disable the button if already applied
    }
  }, [applicants, user._id]);

  return (
    <div className="flex flex-col border border-gray-300 rounded-lg shadow-lg bg-gradient-to-r from-white to-gray-200 p-6 max-w-xl hover:shadow-xl transition-shadow duration-300">
      {/* Top Section: Recruiter Info */}
      <div className="flex items-center justify-between space-x-4">
        {/* Recruiter Image */}
        <div className="flex-shrink-0">
          <img
            src={recruiterProfileImage || "https://via.placeholder.com/48"}
            alt="Recruiter"
            className="w-16 h-16 object-cover border-2 border-black rounded-full p-1"
          />
        </div>

        {/* Recruiter Info */}
        <div className="flex-grow">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">
              Recruited by {recruiterName || "Unknown Recruiter"}
            </span>
            <br />
            <span className="text-xs text-gray-500">
              Posted on {new Date(createdAt).toLocaleDateString()}
            </span>
          </p>
        </div>

        {/* Chat Button */}
        <div>
          <button className="px-4 py-2 bg-gradient-to-tr from-blue-300 to-blue-600 text-white font-semibold rounded hover:from-blue-400 hover:to-blue-700 hover:shadow-lg transition-all duration-300">
            Chat with Recruiter
          </button>
        </div>
      </div>


      <hr className="border-gray-300 my-4" />

      {/* Middle Section: Job Details */}
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-tr from-gray-200 to-gray-300 rounded-md flex items-center justify-center">
          <span className="text-xl font-bold text-gray-600">Logo</span>
        </div>
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-gray-800">{jobRole || "Unknown Role"}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {company && location ? `${company} - ${location}` : company || location || "Unknown Company/Location"}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {experienceLevel && `Experience: ${experienceLevel}`}
            {jobType?.length > 0 && ` | Type: ${jobType.join(", ")}`}
            {remote && ` | Remote: ${remote}`}
          </p>
          {skills?.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Skills: {skills.join(", ")}
            </p>
          )}
        </div>
      </div>

      <hr className="border-gray-300 my-4" />

      {/* Bottom Section: Action Buttons */}
      <div className="flex flex-wrap items-center justify-between">
        <button
          className={`px-4 py-2 font-semibold rounded transition-all duration-300 ${
            applyButtonEnabled
              ? "bg-gradient-to-tr from-green-300 to-green-600 text-white hover:from-green-400 hover:to-green-700 hover:shadow-lg"
              : "bg-gray-200 text-gray-700 flex items-center justify-center"
          }`}
          onClick={handleApplyNow}
          disabled={!applyButtonEnabled}
        >
          {applyButtonEnabled ? (
            "Apply Now"
          ) : (
            <span className="flex items-center">
              <FaCheck className="mr-2 text-green-600" />
              Applied
            </span>
          )}
        </button>

        <button
          className="px-4 py-2 font-semibold rounded bg-gradient-to-tr from-orange-300 to-orange-600 text-white hover:from-orange-400 hover:to-orange-700 hover:shadow-lg"
        >
          Talk with Chatbot
        </button>

        <span className="px-4 py-2 text-gray-800 font-semibold rounded cursor-default">
          Applied: {appliedCounter || 0}
        </span>
      </div>
    </div>
  );
};

export default JobListingCard;
