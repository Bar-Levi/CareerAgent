import React from "react";

const PersonalOverview = ({ user }) => {
  // Determine job_roles from analyzed_cv_content if available.
  const job_roles = user?.analyzed_cv_content?.job_role 
    ? (Array.isArray(user.analyzed_cv_content.job_role)
        ? user.analyzed_cv_content.job_role.join(", ")
        : user.analyzed_cv_content.job_role)
    : "Job Roles Not Found";

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
    <div className="max-w-2xl mx-auto bg-white border border-gray-300 rounded p-6">
      {/* Top Section: Name & Job Roles */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {user?.fullName || "N/A"}
        </h2>
        <p className="text-gray-700 italic">{job_roles}</p>
      </div>

      {/* Personal Information Section */}
      <div className="mb-6 pb-4 border-b border-gray-300">

        <p className="text-base mb-1">
          <span className="font-semibold text-gray-800">Name:</span>{" "}
          {user?.fullName || "N/A"}
        </p>

        <p className="text-base mb-1">
          <span className="font-semibold text-gray-800">Email:</span>{" "}
          {user?.email || "N/A"}
        </p>

        { user?.phone &&
        (
        <p className="text-base mb-1">
          <span className="font-semibold text-gray-800">Phone:</span>{" "}
          {user?.phone}
        </p>
        )}

        {user?.dateOfBirth &&
        (
        <p className="text-base mb-1">
          <span className="font-semibold text-gray-800">Birthday:</span>{" "}
          {new Date(user.dateOfBirth).toLocaleDateString()}
        </p>
        )}

        {user?.linkedinUrl && 
        (
        <p className="text-base mb-1">
          <span className="font-semibold text-gray-800">LinkedIn:</span>{" "}
            <a
              href={user.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {user.linkedinUrl}
            </a>
        </p>
        )}

        {user?.githubUrl && 
        (
        <p className="text-base mb-1">
          <span className="font-semibold text-gray-800">GitHub:</span>{" "}
          
            <a
              href={user.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {user.githubUrl}
            </a>
        </p>
        )}
        
        {user?.cv && 
        (
        <p className="text-base">
          <span className="font-semibold text-gray-800">CV:</span>{" "}
            <a
              href={user.cv}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Quick Look
            </a>
        </p>
        )}

      </div>

      {/* Profile Completion Section */}
      <div className="mb-6">
        <p className="text-sm text-gray-700 mb-2">Profile Completion</p>
        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gray-600 h-full"
            style={{ width: `${profileCompletion}%` }}
          ></div>
        </div>
        <p className="text-sm mt-2 text-gray-700">
          {profileCompletion}% Complete
        </p>
        {profileCompletion < 100 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700 text-sm font-semibold mb-1">
              Your profile is incomplete. Please update the following:
            </p>
            <ul className="list-disc ml-5 text-red-700 text-sm">
              {missingFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
};

export default PersonalOverview;
