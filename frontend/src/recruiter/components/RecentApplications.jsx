import React from "react";

const RecentApplications = ({ applications = [] }) => {
  return (
    <div className="w-full max-w-5xl">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Applications</h2>
      <div className="bg-white shadow rounded-lg p-4">
        {applications.length === 0 ? (
          <p className="text-gray-500">No recent applications.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {applications.map((app) => (
              <li
                key={app.id}
                className="py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0"
              >
                {/* Candidate Details */}
                <div className="flex items-start space-x-4">
                  {/* Profile Picture */}
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={app.profilePic || "https://via.placeholder.com/48"}
                      alt={`${app.candidate || "Candidate"}'s profile`}
                      className="w-full h-full object-cover border-2 border-black rounded-full p-1"
                    />
                  </div>

                  {/* Candidate Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{app.candidate}</h3>
                    <p className="text-sm text-gray-500">Applied for: {app.position}</p>
                    <p className="text-sm text-gray-400">
                      Date: {new Date(app.applicationDate || app.date).toLocaleDateString()}
                    </p>

                    {/* CV Link */}
                    <p className="text-sm text-gray-500 mt-2">
                      <span className="font-semibold">CV: </span>
                      <a
                        href={app.cv}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View CV
                      </a>
                    </p>

                    {/* LinkedIn & GitHub Links */}
                    {app.linkedinUrl && (
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">LinkedIn: </span>
                        <a
                          href={app.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {app.linkedinUrl}
                        </a>
                      </p>
                    )}
                    {app.githubUrl && (
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">GitHub: </span>
                        <a
                          href={app.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {app.githubUrl}
                        </a>
                      </p>
                    )}

                    {/* Chat Button */}
                    <button
                        className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-semibold rounded-full shadow-lg transform transition-transform duration-200 hover:scale-105 hover:shadow-xl"
                        >
                        Chat with Applicant
                    </button>
                  </div>
                </div>

                {/* Application Status */}
                <p
                  className={`px-3 py-1 text-sm rounded-full ${
                    app.status === "Screening"
                      ? "bg-yellow-100 text-yellow-800"
                      : app.status === "Pending"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                  aria-label={`Application Status: ${app.status}`}
                >
                  {app.status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RecentApplications;
