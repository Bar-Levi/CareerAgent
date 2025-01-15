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
    description,
    companyWebsite,
    securityClearance,
    education,
    workExperience,
    skills,
    languages,
  } = jobListing;

  return (
    <div className="flex items-start p-4 border rounded-md shadow-md bg-white max-w-lg">
      {/* Left Side: Logo Placeholder */}
      <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded-md mr-4 flex items-center justify-center">
        <span className="text-xl font-bold text-gray-500">Logo</span>
      </div>

      {/* Right Side: Job Details */}
      <div className="flex-grow">
        {/* Job Role */}
        <h3 className="text-lg font-semibold">{jobRole || "Unknown Role"}</h3>

        {/* Company and Location */}
        <p className="text-sm text-gray-600">
          {company || "Unknown Company"} - {location || "Unknown Location"}
        </p>

        {/* Experience, Type, Remote */}
        <p className="text-sm text-gray-600 mt-1">
          <span className="font-semibold">Experience:</span>{" "}
          {experienceLevel || "N/A"} |{" "}
          <span className="font-semibold">Type:</span> {jobType?.join(", ") || "N/A"} |{" "}
          <span className="font-semibold">Remote:</span> {remote || "N/A"}
        </p>

        {/* Description */}
        <p className="text-sm text-gray-700 mt-2 line-clamp-3">{description || "No description provided."}</p>

        {/* Optional Links */}
        {companyWebsite && (
          <p className="mt-2">
            <a
              href={companyWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Visit Company Website
            </a>
          </p>
        )}

        {/* Skills & Languages */}
        <div className="mt-2">
          {skills && skills.length > 0 && (
            <p className="text-sm">
              <span className="font-semibold">Skills:</span> {skills.join(", ")}
            </p>
          )}
          {languages && languages.length > 0 && (
            <p className="text-sm">
              <span className="font-semibold">Languages:</span> {languages.join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListingCard;
