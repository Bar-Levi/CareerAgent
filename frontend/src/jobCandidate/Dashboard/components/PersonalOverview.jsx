import React from "react";

const PersonalOverview = ({ user }) => {
  // Determine job_roles and skills from analyzed_cv_content if available.
  const job_roles = user?.analyzed_cv_content?.job_role 
    ? (Array.isArray(user.analyzed_cv_content.job_role)
        ? user.analyzed_cv_content.job_role.join(", ")
        : user.analyzed_cv_content.job_role)
    : "Job Roles Not Found";
    
  const skills = user?.analyzed_cv_content?.skills 
    ? user.analyzed_cv_content.skills.join(", ")
    : "Skills Not Found";

  // Define the required fields and check for missing ones
  const requiredFields = [
    { key: "fullName", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "cv", label: "CV" },
    { key: "githubUrl", label: "GitHub URL" },
    { key: "linkedinUrl", label: "LinkedIn URL" },
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
    <div className="col-span-1 bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-bold mb-4">Personal Overview</h2>
      <div className="space-y-2">
        <p>
          Name: <strong>{user?.fullName || "N/A"}</strong>
        </p>
        <p>
          Job Roles: <strong>{job_roles || "N/A"}</strong>
        </p>
        <p>
          Skills: <strong>{skills || "N/A"}</strong>
        </p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">Profile Completion</p>
          <div className="bg-gray-200 w-full h-4 rounded">
            <div 
              className="bg-blue-600 h-4 rounded" 
              style={{ width: `${profileCompletion}%` }}
            ></div>
          </div>
          <p className="text-sm mt-1">{profileCompletion}% Complete</p>
          {profileCompletion < 100 && (
            <div className="mt-2">
              <p className="text-red-500 text-sm">
                Your profile is incomplete. Please fill out the following fields:
              </p>
              <ul className="list-disc list-inside text-red-500 text-sm">
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
