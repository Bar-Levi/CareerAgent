import React from "react";
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaLinkedin, FaGithub, FaFileAlt } from "react-icons/fa";

const PersonalOverview = ({ user }) => {
  // Determine job_roles from analyzed_cv_content if available.
  const job_roles = user?.analyzed_cv_content?.job_role 
    ? (Array.isArray(user.analyzed_cv_content.job_role)
        ? user.analyzed_cv_content.job_role.join(", ")
        : user.analyzed_cv_content.job_role)
    : "Job Roles Not Found";

  // Define the required fields and check for missing ones
  const requiredFields = [
    { key: "fullName", label: "Name", icon: FaUser },
    { key: "email", label: "Email", icon: FaEnvelope },
    { key: "phone", label: "Phone", icon: FaPhone },
    { key: "cv", label: "CV", icon: FaFileAlt },
    { key: "githubUrl", label: "GitHub URL", icon: FaGithub },
    { key: "linkedinUrl", label: "LinkedIn URL", icon: FaLinkedin },
  ];

  const missingFields = requiredFields
    .filter(field => !user?.[field.key] || user[field.key] === "")
    .map(field => field.label);

  // Calculate profile completion percentage based on available fields
  const filledCount = requiredFields.filter(
    field => user?.[field.key] && user[field.key] !== ""
  ).length;
  const profileCompletion = Math.round((filledCount / requiredFields.length) * 100);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2">
        <h2 className="text-lg font-bold text-white">Personal Overview</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <div className="text-center mb-2">
          <h3 className="text-xl font-bold text-gray-900">
            {user?.fullName || "N/A"}
          </h3>
          <p className="text-sm text-gray-600 italic">{job_roles}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {requiredFields.map((field) => {
              const Icon = field.icon;
              const value = user?.[field.key];
              
              if (!value) return null;

              return (
                <div key={field.key} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <Icon className="w-4 h-4 text-indigo-600" />
                  {field.key === "linkedinUrl" || field.key === "githubUrl" || field.key === "cv" ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline truncate text-sm"
                    >
                      {field.key === "cv" ? "View CV" : value}
                    </a>
                  ) : (
                    <span className="text-gray-700 text-sm">{value}</span>
                  )}
                </div>
              );
            })}

            {user?.dateOfBirth && (
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                <FaBirthdayCake className="w-4 h-4 text-indigo-600" />
                <span className="text-gray-700 text-sm">
                  {new Date(user.dateOfBirth).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-700">Profile Completion</span>
            <span className="text-xs font-medium text-gray-700">{profileCompletion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-indigo-600 to-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${profileCompletion}%` }}
            ></div>
          </div>
          
          {profileCompletion < 100 && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-xs font-medium mb-1">
                Your profile is incomplete. Please update the following:
              </p>
              <ul className="list-disc ml-2 text-red-700 text-xs">
                {missingFields.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalOverview;
