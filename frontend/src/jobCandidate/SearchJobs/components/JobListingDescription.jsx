import React from "react";
import { parseJobDescription } from '../../../utils/parseJobDescription';

/**
 * Displays job listing information to a candidate.
 * 
 * @param {Object} props
 * @param {Object} props.jobListing - The job listing object from the database.
 * 
 * Example usage:
 *   <JobListingDescription jobListing={jobListingData} />
 */
const JobListingDescription = ({ jobListing }) => {
  if (!jobListing) {
    return <div className="text-center py-8">No job listing found.</div>;
  }

  // Destructure relevant fields from the jobListing
  const {
    jobRole,
    location,
    company,
    companyWebsite,
    experienceLevel,
    jobType,
    remote,
    description,
    securityClearance,
    education,
    workExperience,
    skills,
    languages,
    recruiterName,
    recruiterProfileImage,
    status,
    closingTime,
    isFeatured,
    isArchived,
  } = jobListing;

  return (
    <div className="bg-white text-gray-800 max-w-2xl mx-auto my-8 rounded-md shadow-md overflow-auto">
      {/* Header Section */}
      <div className="flex items-center mb-4">
        {/* Recruiter Profile Image */}
        {recruiterProfileImage && (
          <img
            src={recruiterProfileImage}
            alt="Recruiter"
            className="w-16 h-16 rounded-full object-cover mr-4"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold">{jobRole}</h2>
          <p className="text-sm text-gray-600">
            {company} 
            {location ? ` • ${location}` : ""}
          </p>
        </div>
      </div>

      {/* Recruiter Info */}
      <div className="mb-2">
        <span className="font-semibold">Recruiter:</span> {recruiterName}
      </div>

      {/* Status & Featured/Archived flags */}
      <div className="mb-2">
        <span className="font-semibold">Status:</span> {status}
      </div>
      {isFeatured && (
        <div className="mb-2 text-green-600 font-semibold">Featured Listing</div>
      )}
      {isArchived && (
        <div className="mb-2 text-red-600 font-semibold">This job is archived</div>
      )}

      {/* Basic Info */}
      <div className="mb-2">
        <span className="font-semibold">Experience Level:</span> {experienceLevel}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Job Type:</span>{" "}
        {jobType && jobType.length > 0 ? jobType.join(", ") : "N/A"}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Work Setup (Remote/On-Site):</span> {remote}
      </div>
      {companyWebsite && (
        <div className="mb-2">
          <span className="font-semibold">Company Website:</span>{" "}
          <a
            href={companyWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {companyWebsite}
          </a>
        </div>
      )}

      {/* Description */}
      <div className="mb-4">
        <h3 className="font-semibold">Job Description:</h3>
        <p className="mt-1 whitespace-pre-line">{parseJobDescription(description)}</p>
      </div>

      {/* Additional Requirements */}
      {securityClearance !== null && (
        <div className="mb-2">
          <span className="font-semibold">Security Clearance Level:</span>{" "}
          {securityClearance}
        </div>
      )}
      {education && education.length > 0 && (
        <div className="mb-2">
          <span className="font-semibold">Required Education:</span>{" "}
          {education.join(", ")}
        </div>
      )}
      {workExperience !== null && (
        <div className="mb-2">
          <span className="font-semibold">Work Experience (years):</span> {workExperience}
        </div>
      )}
      {skills && skills.length > 0 && (
        <div className="mb-2">
          <span className="font-semibold">Skills:</span> {skills.join(", ")}
        </div>
      )}
      {languages && languages.length > 0 && (
        <div className="mb-2">
          <span className="font-semibold">Languages:</span> {languages.join(", ")}
        </div>
      )}

      {/* Closing Time & Views */}
      {closingTime && (
        <div className="mb-2">
          <span className="font-semibold">Closing Date:</span>{" "}
          {new Date(closingTime).toLocaleDateString()}
        </div>
      )}
      
    </div>
  );
};

export default JobListingDescription;
