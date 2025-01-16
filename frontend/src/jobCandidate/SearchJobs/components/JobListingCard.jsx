import React from "react";

const JobListingCard = ({ jobListing }) => {
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
  } = jobListing;

  return (
    <div className="flex flex-col border border-gray-300 rounded-lg shadow-lg bg-gradient-to-r from-white to-gray-50 p-6 max-w-xl hover:shadow-xl transition-shadow duration-300">
      {/* Top Section: Job Details */}
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

          {/* Experience, Type, Remote */}
          <p className="text-sm text-gray-500 mt-2">
            <span className="font-semibold">Experience:</span> {experienceLevel || "N/A"} |{" "}
            <span className="font-semibold">Type:</span> {jobType?.join(", ") || "N/A"} |{" "}
            <span className="font-semibold">Remote:</span> {remote || "N/A"}
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

      {/* Middle Section: Recruiter Info */}
      <div className="flex items-center space-x-4">
        {/* Recruiter Image */}
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={recruiterProfileImage || "https://via.placeholder.com/48"}
            alt="Recruiter"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Recruiter Name */}
        <p className="flex-grow text-sm text-gray-700">
          <span className="font-semibold">Posted by:</span> {recruiterName || "Unknown Recruiter"}
        </p>

        {/* Applicants Count */}
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Already applied:</span> {applicantsCount || 0}
        </p>
      </div>

      {/* Divider */}
      <hr className="border-gray-300 my-4" />

      {/* Bottom Section: Action Buttons */}
      <div className="flex flex-wrap items-center justify-between">
        <button className="px-4 py-2 bg-gradient-to-tr from-green-400 to-green-500 text-white font-semibold rounded hover:from-green-500 hover:to-green-600 hover:shadow-lg transition-all duration-300">
          Apply Now
        </button>
        <button className="px-4 py-2 bg-gradient-to-tr from-blue-400 to-blue-500 text-white font-semibold rounded hover:from-blue-500 hover:to-blue-600 hover:shadow-lg transition-all duration-300">
          Chat with Recruiter
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded hover:bg-gray-200 transition-all duration-300">
          Applied: {applicantsCount || 0}
        </button>
      </div>
    </div>
  );
};

export default JobListingCard;
