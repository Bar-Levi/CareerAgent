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
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-purple-700">Personal Overview</h2>
      
      {/* Personal Information Section */}
      <div className="mb-6 border-b pb-4">
        <p className="text-lg mb-1">
          <span className="font-semibold text-purple-600">Name:</span> {user?.fullName || "N/A"}
        </p>
        <p className="text-lg mb-1">
          <span className="font-semibold text-purple-600">Email:</span> {user?.email || "N/A"}
        </p>
        <p className="text-lg mb-1">
          <span className="font-semibold text-purple-600">Phone:</span> {user?.phone || "N/A"}
        </p>
        <p className="text-lg mb-1">
          <span className="font-semibold text-purple-600">Birthday:</span> {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "N/A"}
        </p>
        <p className="text-lg mb-1">
          <span className="font-semibold text-purple-600">Linkedin:</span>{" "}
          {user?.linkedinUrl ? (
            <a 
              href={user.linkedinUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 underline"
            >
              {user.linkedinUrl}
            </a>
          ) : (
            "N/A"
          )}
        </p>
        <p className="text-lg mb-1">
          <span className="font-semibold text-purple-600">Github:</span>{" "}
          {user?.githubUrl ? (
            <a 
              href={user.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 underline"
            >
              {user.githubUrl}
            </a>
          ) : (
            "N/A"
          )}
        </p>


        <p className="text-lg">
          <span className="font-semibold text-purple-600">CV:</span>{" "}
          {user?.cv ? (
            <a 
              href={user.cv} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline text-blue-600"
            >
              Quick Look
            </a>
          ) : (
            "N/A"
          )}
        </p>
      </div>
      
      {/* Profile Completion Section */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-1">Profile Completion</p>
        <div className="bg-gray-300 h-4 rounded-full overflow-hidden">
          <div 
            className="bg-purple-600 h-full" 
            style={{ width: `${profileCompletion}%` }}
          ></div>
        </div>
        <p className="text-sm mt-1 text-gray-600">{profileCompletion}% Complete</p>
        {profileCompletion < 100 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-sm">
              Your profile is incomplete. Please update the following:
            </p>
            <ul className="list-disc ml-5 text-red-600 text-sm">
              {missingFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Analyzed CV Data Section */}
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
        <h3 className="text-xl font-bold mb-3 text-purple-700">Analyzed CV Data</h3>
        <ul className="space-y-3 text-gray-700">
          {/* Job Roles */}
          <li>
            <span className="font-semibold">Job Roles:</span>{" "}
            {Array.isArray(user.analyzed_cv_content?.job_role) &&
            user.analyzed_cv_content.job_role.length > 0
              ? user.analyzed_cv_content.job_role.join(", ")
              : "None"}
          </li>
          {/* Security Clearance */}
          <li>
            <span className="font-semibold">Security Clearance:</span>{" "}
            {user.analyzed_cv_content?.security_clearance || "None"}
          </li>
          {/* Education */}
          <li>
            <span className="font-semibold">Education:</span>{" "}
            {Array.isArray(user.analyzed_cv_content?.education) &&
            user.analyzed_cv_content.education.length > 0 ? (
              user.analyzed_cv_content.education.map((edu, index) => (
                <span key={index} className="block">
                  {edu.degree} from <span className="font-medium">{edu.institution}</span>
                </span>
              ))
            ) : (
              "None"
            )}
          </li>
          {/* Work Experience */}
          <li>
            <span className="font-semibold">Work Experience:</span>{" "}
            {Array.isArray(user.analyzed_cv_content?.work_experience) &&
            user.analyzed_cv_content.work_experience.length > 0 ? (
              user.analyzed_cv_content.work_experience.map((exp, index) => {
                const yearsOfExperience =
                  (exp.end_year || new Date().getFullYear()) - exp.start_year;
                return (
                  <span key={index} className="block">
                    {exp.job_title} at <span className="font-medium">{exp.company}</span> (
                    {exp.start_year} - {exp.end_year || "Present"}) - {yearsOfExperience} year(s)
                  </span>
                );
              })
            ) : (
              "None"
            )}
          </li>
          {/* Skills */}
          <li>
            <span className="font-semibold">Skills:</span>{" "}
            {Array.isArray(user.analyzed_cv_content?.skills) &&
            user.analyzed_cv_content.skills.length > 0
              ? user.analyzed_cv_content.skills.join(", ")
              : "None"}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PersonalOverview;
