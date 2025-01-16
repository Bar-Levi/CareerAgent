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
    education,
    skills
  } = jobListing;

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
            {/* Experience */}
            {experienceLevel && (
              <>
                <span className="font-semibold py-1">Experience:</span> {experienceLevel} <br/>
              </>
            )}

            {/* Job Type */}
            {jobType?.length > 0 && (
              <>
                <span className="font-semibold py-1">Type:</span> {jobType.join(", ")} <br/>
              </>
            )}

            {/* Remote */}
            {remote && (
              <>
                <span className="font-semibold py-1">Remote:</span> {remote} <br/>
              </>
            )}

            {/* Education */}
            {education?.length > 0 && (
              <>
                <span className="font-semibold py-1">Education:</span> {education.join(", ")} <br/>
              </>
            )}

            {/* Skills */}
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
        
        <button className="px-4 py-2 bg-gradient-to-tr from-green-300 to-green-600 text-white font-semibold rounded hover:from-green-400 hover:to-green-700 hover:shadow-lg transition-all duration-300">
          Apply Now
        </button>

        <button className="px-4 py-2 bg-gradient-to-tr from-red-300 to-red-600 text-white font-semibold rounded hover:from-red-400 hover:to-red-700 hover:shadow-lg transition-all duration-300">
          Integrate with Chatbot
        </button>

        <span className="px-4 py-2 text-gray-800 font-semibold rounded cursor-default">
          Applied: {applicantsCount || 0}
        </span>

      </div>
    </div>
  );
};

export default JobListingCard;
