import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaLinkedin, FaGithub, FaFileAlt, FaTimes } from "react-icons/fa";

const ProfilePicModal = ({ imageUrl, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div 
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center p-4 transition-opacity duration-500 ease-in-out ${isVisible ? 'bg-opacity-70' : 'bg-opacity-0'}`} 
      onClick={onClose}
    >
      <div 
        className={`relative max-w-3xl w-full bg-white rounded-lg shadow-xl p-2 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`} 
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 p-2 rounded-full bg-white shadow-md transition-transform duration-300 hover:scale-105"
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
    { key: "email", label: "Email", icon: FaEnvelope },
    { key: "cv", label: "CV", icon: FaFileAlt },
    { key: "fullName", label: "Name", icon: FaUser },
    { key: "githubUrl", label: "GitHub URL", icon: FaGithub },
    { key: "linkedinUrl", label: "LinkedIn URL", icon: FaLinkedin },
    { key: "phone", label: "Phone", icon: FaPhone },
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
  const leftColumnFields = requiredFields.slice(0, 2);
  const rightColumnFields = requiredFields.slice(2);

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
              <div className="relative overflow-hidden backdrop-blur-sm bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-200 rounded-xl p-3.5 shadow-lg transition-all duration-300 hover:shadow-emerald-100/30 group">
                <div className="absolute inset-0 bg-emerald-100/30 opacity-20"></div>
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-teal-300/30 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-emerald-300/30 rounded-full blur-xl"></div>
                <p className="relative font-medium text-emerald-900 flex items-center justify-center space-x-2 text-center">
                  <span className="text-lg">🌟</span>
                  <span className="font-display tracking-tight text-base">Your profile is complete and looking fantastic!</span>
                  <span className="h-6 w-6 bg-white rounded-full flex items-center justify-center shadow-sm transition-transform duration-500 group-hover:rotate-12">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-500">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </span>
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-base font-semibold text-indigo-950/80">Profile Completion</span>
                  <div className="flex items-center">
                    <span className={`text-lg font-bold transition-colors duration-500 ${
                      profileCompletion < 50 ? 'text-red-500' :
                      profileCompletion < 80 ? 'text-amber-500' : 'text-indigo-600'
                    }`}>{profileCompletion}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div
                    className={`h-1 rounded-full transition-all duration-700 ease-out-expo ${
                      profileCompletion < 50 ? 'bg-gradient-to-r from-red-400 to-red-500' :
                      profileCompletion < 80 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                      'bg-gradient-to-r from-indigo-500 to-indigo-600'
                    }`}
                    style={{ 
                      width: `${profileCompletion}%`,
                      boxShadow: '0 0 8px rgba(99, 102, 241, 0.3)'
                    }}
                  ></div>
                </div>
                
                <div className="mt-3 backdrop-blur-sm bg-gradient-to-r from-indigo-50/80 to-sky-50/80 border border-red-100 rounded-xl p-2 sm:p-2.5 shadow-md transition-all duration-300 overflow-hidden relative group">
                  <div className="absolute -top-8 -left-8 w-16 h-16 bg-red-200/20 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-indigo-200/30 rounded-full blur-xl"></div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="mt-0.5 flex-shrink-0 p-0.5 bg-white/80 rounded-lg shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-indigo-600">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-sm sm:text-base font-semibold text-indigo-950 mb-1 tracking-tight">Complete your profile</h4>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {missingFields.map((field, index) => (
                          <div key={index} className="flex items-center space-x-1.5 bg-white/60 rounded-lg p-1 border border-indigo-100/50 shadow-sm">
                            <div className="w-1 h-1 rounded-full bg-indigo-500 flex-shrink-0"></div>
                            <span className="text-sm text-gray-800 truncate">{field}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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
