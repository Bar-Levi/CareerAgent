import React, { useState } from "react";

const JobListingCard = ({ jobListing, user, setShowModal}) => {
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
    applicantsCount,
    education,
    skills,
    _id: jobId, // Extract the job ID
    recruiterId,
  } = jobListing;

  const [appliedCounter, setAppliedCounter] = useState(applicantsCount);

  const handleApplyNow = async () => {
    if (!user.cv || user.cv == "") {
      setShowModal(true); // Show modal if CV is missing
      return;
    }
    try {
      console.log("User: " + JSON.stringify(user));
      // Create the new applicant
      const applicantResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/applicants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
            },
            body: JSON.stringify({
              $push: { applicants: applicantData.applicant._id }, // Add the applicant to the applicants array
            }),
          }
        );
        
        if (updateJobResponse.ok) {
          alert("Application submitted successfully!");
          setAppliedCounter(appliedCounter + 1);
        } else {
          alert("Failed to update job listing with the new applicant.");
        }
      } else {
        alert("Failed to create applicant.");
      }
    } catch (error) {
      console.error("Error applying for the job:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col border border-gray-300 rounded-lg shadow-lg bg-gradient-to-r from-white to-gray-200 p-6 max-w-xl hover:shadow-xl transition-shadow duration-300">
      {/* Top Section: Recruiter Info */}
      <div className="flex items-center space-x-4">
        {/* Recruiter Image */}
        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={recruiterProfileImage || "https://via.placeholder.com/48"}
            alt="Recruiter"
            className="w-full h-full object-cover border-2 border-black rounded-full p-1"
          />
        </div>

        {/* Recruiter Name */}
        <p className="flex-grow text-sm text-gray-700">
          Recruited by <span className="font-semibold">{recruiterName || "Unknown Recruiter"}</span>
        </p>

        <button className="px-4 py-2 bg-gradient-to-tr from-blue-300 to-blue-600 text-white font-semibold rounded hover:from-blue-400 hover:to-blue-700 hover:shadow-lg transition-all duration-300">
          Chat with Recruiter
        </button>
      </div>

      {/* Divider */}
      <hr className="border-gray-300 my-4" />

      {/* Middle Section: Job Details */}
      <div className="flex items-start space-x-4">
        {/* Left Side: Logo Placeholder */}
        <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-tr from-gray-200 to-gray-300 rounded-md flex items-center justify-center">
          <span className="text-xl font-bold text-gray-600">Logo</span>
        </div>

        {/* Right Side: Job Details */}
        <div className="flex-grow">
          {/* Job Role */}
          <h3 className="text-xl font-bold text-gray-800">{jobRole || "Unknown Role"}</h3>

          {/* Company and Location */}
          <p className="text-sm text-gray-600 mt-1">
            {company || "Unknown Company"} - {location || "Unknown Location"}
          </p>

          {/* Experience, Type, Remote, Education, Skills */}
          <p className="text-sm text-gray-500 mt-2">
            {experienceLevel && (
              <>
                <span className="font-semibold py-1">Experience:</span> {experienceLevel} <br />
              </>
            )}

            {jobType?.length > 0 && (
              <>
                <span className="font-semibold py-1">Type:</span> {jobType.join(", ")} <br />
              </>
            )}

            {remote && (
              <>
                <span className="font-semibold py-1">Remote:</span> {remote} <br />
              </>
            )}

            {education?.length > 0 && (
              <>
                <span className="font-semibold py-1">Education:</span> {education.join(", ")} <br />
              </>
            )}

            {skills?.length > 0 && (
              <>
                <span className="font-semibold py-1">Skills:</span> {skills.join(", ")}
              </>
            )}
          </p>

          {/* Company Info */}
          <p className="text-sm text-gray-500 mt-2">
            <span className="font-semibold">Company:</span> {company} |{" "}
            <span className="font-semibold">Size:</span> {companySize || "N/A"}{" "}
            {companyWebsite && (
              <a
                href={companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-2"
              >
                Visit Company Website
              </a>
            )}
          </p>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-300 my-4" />

      {/* Bottom Section: Action Buttons */}
      <div className="flex flex-wrap items-center justify-between">
        <button
          className="px-4 py-2 bg-gradient-to-tr from-green-300 to-green-600 text-white font-semibold rounded hover:from-green-400 hover:to-green-700 hover:shadow-lg transition-all duration-300"
          onClick={handleApplyNow}
        >
          Apply Now
        </button>

        <button className="px-4 py-2 bg-gradient-to-tr from-red-300 to-red-600 text-white font-semibold rounded hover:from-red-400 hover:to-red-700 hover:shadow-lg transition-all duration-300">
          Integrate with Chatbot
        </button>

        <span className="px-4 py-2 text-gray-800 font-semibold rounded cursor-default">
          Applied: {appliedCounter || 0}
        </span>
      </div>
    </div>
  );
};

export default JobListingCard;
