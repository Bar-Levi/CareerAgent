import React from "react";
import { parseJobDescription } from '../../../utils/parseJobDescription';
import { FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaLaptopCode, 
  FaLanguage, FaLock, FaCalendarAlt, FaBuilding, FaGlobe, 
  FaUserTie, FaClock, FaMedal, FaArchive } from "react-icons/fa";

/**
 * Displays job listing information to a candidate with a modern 2025 design.
 * Fully responsive for all screen sizes.
 * 
 * @param {Object} props
 * @param {Object} props.jobListing - The job listing object from the database.
 * 
 * Example usage:
 *   <JobListingDescription jobListing={jobListingData} />
 */
const JobListingDescription = ({ jobListing }) => {
  if (!jobListing) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gray-50 rounded-lg">
        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-700">No job selected</h3>
        <p className="mt-2 text-sm text-gray-500">Select a job listing to view details</p>
      </div>
    );
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

  // Format the closing date if it exists
  const formattedClosingDate = closingTime 
    ? new Date(closingTime).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) 
    : null;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden">
      {/* Header with company and job info */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-4">
        <div className="flex flex-wrap justify-between mb-2">
          {isFeatured && (
            <div className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-full">
              Featured
            </div>
          )}
          {isArchived && (
            <div className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full flex items-center">
              <FaArchive className="mr-1" /> Archived
            </div>
          )}
        </div>
        
        <div className="flex items-center mb-2">
          {recruiterProfileImage ? (
            <img
              src={recruiterProfileImage}
              alt={recruiterName || "Recruiter"}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-indigo-800 flex items-center justify-center text-white text-lg font-bold">
              {company?.charAt(0) || "C"}
            </div>
          )}
          <div className="ml-3 flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-white truncate">{jobRole}</h1>
            <div className="flex flex-wrap items-center gap-2 text-indigo-100 text-sm">
              <span className="font-medium truncate">{company}</span>
              {location && (
                <>
                  <span className="w-1 h-1 bg-indigo-200 rounded-full hidden sm:block"></span>
                  <span className="flex items-center">
                    <FaMapMarkerAlt className="mr-1" size={12} /> {location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5 mt-2">
          {status && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              status === "Open" 
                ? "bg-green-100 text-green-800" 
                : status === "Closed" 
                ? "bg-red-100 text-red-800" 
                : "bg-blue-100 text-blue-800"
            }`}>
              {status}
            </span>
          )}
          {jobType && jobType.length > 0 && jobType.map(type => (
            <span key={type} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {type}
            </span>
          ))}
          {remote && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {remote}
            </span>
          )}
        </div>
      </div>
      
      {/* Main content - scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Key details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {experienceLevel && (
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                <FaBriefcase size={14} />
              </div>
              <div className="ml-2">
                <h3 className="text-xs font-medium text-gray-500 uppercase">Experience</h3>
                <p className="text-sm font-medium text-gray-900">{experienceLevel}</p>
              </div>
            </div>
          )}
          
          {workExperience !== null && workExperience !== undefined && (
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-md bg-green-100 text-green-600 flex items-center justify-center">
                <FaClock size={14} />
              </div>
              <div className="ml-2">
                <h3 className="text-xs font-medium text-gray-500 uppercase">Years</h3>
                <p className="text-sm font-medium text-gray-900">{workExperience}</p>
              </div>
            </div>
          )}
          
          {formattedClosingDate && (
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-md bg-red-100 text-red-600 flex items-center justify-center">
                <FaCalendarAlt size={14} />
              </div>
              <div className="ml-2">
                <h3 className="text-xs font-medium text-gray-500 uppercase">Closing</h3>
                <p className="text-sm font-medium text-gray-900">{formattedClosingDate}</p>
              </div>
            </div>
          )}
          
          {companyWebsite && (
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center">
                <FaGlobe size={14} />
              </div>
              <div className="ml-2 min-w-0">
                <h3 className="text-xs font-medium text-gray-500 uppercase">Website</h3>
                <a
                  href={companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline truncate block"
                >
                  {companyWebsite.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </div>
            </div>
          )}
        </div>
        
        {/* Description */}
        <div className="mb-5">
          <h2 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
            <div className="flex-shrink-0 h-5 w-5 text-blue-600 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            Job Description
          </h2>
          <div className="prose prose-sm max-w-none text-gray-600 break-words">
            {parseJobDescription(description)}
          </div>
        </div>
        
        {/* Recruiter */}
        {recruiterName && (
          <div className="mb-5 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5 flex items-center">
              <FaUserTie className="text-gray-500 mr-1.5" size={14} />
              Contact
            </h2>
            <div className="flex items-center">
              {recruiterProfileImage && (
                <img
                  src={recruiterProfileImage}
                  alt={recruiterName}
                  className="w-8 h-8 rounded-full object-cover mr-2"
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{recruiterName}</p>
                <p className="text-xs text-gray-500">Recruiter</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Requirements */}
        <div className="mb-3">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Requirements</h2>
          
          <div className="space-y-3">
            {/* Security Clearance */}
            {securityClearance && (
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-red-500">
                  <FaLock size={13} />
                </div>
                <div className="ml-2 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900">Security Clearance</h3>
                  <p className="text-sm text-gray-600 break-words">{securityClearance}</p>
                </div>
              </div>
            )}
            
            {/* Education */}
            {education && education.length > 0 && (
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-500">
                  <FaGraduationCap size={13} />
                </div>
                <div className="ml-2 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900">Education</h3>
                  <p className="text-sm text-gray-600 break-words">{education.join(", ")}</p>
                </div>
              </div>
            )}
            
            {/* Skills */}
            {skills && skills.length > 0 && (
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500">
                  <FaLaptopCode size={13} />
                </div>
                <div className="ml-2 flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900">Skills</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {skills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 mb-1">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Languages */}
            {languages && languages.length > 0 && (
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-indigo-500">
                  <FaLanguage size={13} />
                </div>
                <div className="ml-2 flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900">Languages</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {languages.map((language, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 mb-1">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobListingDescription;
