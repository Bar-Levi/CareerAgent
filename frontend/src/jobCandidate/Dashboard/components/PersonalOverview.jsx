import React, { useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaLinkedin, FaGithub, FaFileAlt, FaTimes } from "react-icons/fa";

const ProfilePicModal = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-3xl w-full bg-white rounded-lg shadow-xl p-2" onClick={e => e.stopPropagation()}>
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 p-2 rounded-full bg-white shadow-md"
          onClick={onClose}
        >
          <FaTimes className="w-6 h-6" />
        </button>
        <img
          src={imageUrl}
          alt="Profile Preview"
          className="w-full h-auto rounded-lg"
        />
      </div>
    </div>
  );
};

const PersonalOverview = ({ user }) => {
  const [showPreview, setShowPreview] = useState(false);

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
    { 
      key: "profilePic", 
      label: "Profile Picture", 
      icon: FaUser,
      validate: (value) => value && value !== "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png"
    }
  ];

  const missingFields = requiredFields
    .filter(field => {
      if (field.validate) {
        return !field.validate(user?.[field.key]);
      }
      return !user?.[field.key] || user[field.key] === "";
    })
    .map(field => field.label);

  // Calculate profile completion percentage based on available fields
  const filledCount = requiredFields.filter(field => {
    if (field.validate) {
      return field.validate(user?.[field.key]);
    }
    return user?.[field.key] && user[field.key] !== "";
  }).length;
  const profileCompletion = Math.round((filledCount / requiredFields.length) * 100);

  // Split fields into two columns
  const midPoint = Math.ceil(requiredFields.length / 2);
  const leftColumnFields = requiredFields.slice(0, midPoint);
  const rightColumnFields = requiredFields.slice(midPoint);

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 flex-none">
          <h2 className="text-lg font-bold text-white">Personal Overview</h2>
        </div>
        
        <div className="flex-1 p-3 flex flex-col">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex-shrink-0">
              {user?.profilePic ? (
                <img
                  src={user.profilePic}
                  alt="Profile"
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-600 cursor-pointer hover:border-indigo-400 transition-colors duration-200"
                  onClick={() => setShowPreview(true)}
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
                  <FaUser className="w-7 h-7 text-indigo-600" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {user?.fullName || "N/A"}
              </h3>
              <p className="text-base text-gray-600 italic">{job_roles}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 flex-1">
            {/* Left Column */}
            <div className="space-y-1.5">
              {leftColumnFields.map((field) => {
                const Icon = field.icon;
                const value = user?.[field.key];
                
                if (!value || field.key === "profilePic" || field.key === "fullName") return null;

                return (
                  <div key={field.key} className="flex items-center space-x-2 p-1.5 bg-gray-50 rounded-lg">
                    <Icon className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    {field.key === "linkedinUrl" || field.key === "githubUrl" || field.key === "cv" ? (
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline truncate text-base"
                      >
                        {field.key === "cv" ? "View CV" : 
                         field.key === "linkedinUrl" ? "LinkedIn Profile" :
                         field.key === "githubUrl" ? "GitHub Profile" : value}
                      </a>
                    ) : (
                      <span className="text-gray-700 text-base truncate">{value}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Column */}
            <div className="space-y-1.5">
              {rightColumnFields.map((field) => {
                const Icon = field.icon;
                const value = user?.[field.key];
                
                if (!value || field.key === "profilePic" || field.key === "fullName") return null;

                return (
                  <div key={field.key} className="flex items-center space-x-2 p-1.5 bg-gray-50 rounded-lg">
                    <Icon className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    {field.key === "linkedinUrl" || field.key === "githubUrl" || field.key === "cv" ? (
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline truncate text-base"
                      >
                        {field.key === "cv" ? "View CV" : 
                         field.key === "linkedinUrl" ? "LinkedIn Profile" :
                         field.key === "githubUrl" ? "GitHub Profile" : value}
                      </a>
                    ) : (
                      <span className="text-gray-700 text-base truncate">{value}</span>
                    )}
                  </div>
                );
              })}

              {user?.dateOfBirth && (
                <div className="flex items-center space-x-2 p-1.5 bg-gray-50 rounded-lg">
                  <FaBirthdayCake className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <span className="text-gray-700 text-base truncate">
                    {new Date(user.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 flex-none">
            {profileCompletion === 100 ? (
              <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm font-medium flex items-center justify-center">
                  🎉 Excellent! Your profile is complete and ready to shine!
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                  <span className="text-sm font-medium text-gray-700">{profileCompletion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
                
                <div className="mt-1 p-1.5 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">
                    Your profile is incomplete. Please update:
                  </p>
                  <ul className="list-disc ml-4 text-red-700 text-sm">
                    {missingFields.map((field, index) => (
                      <li key={index}>{field}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Picture Preview Modal */}
      {showPreview && user?.profilePic && (
        <ProfilePicModal
          imageUrl={user.profilePic}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};

export default PersonalOverview;
