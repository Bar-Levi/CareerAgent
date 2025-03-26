import React, { useEffect, useState } from "react";

const JobApplications = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      const fetchApplications = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/applicants/getJobSeekerApplications/${user._id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            // Depending on your API response, adjust the property (applicants or applications)
            setApplications(data.applicants || data.applications || []);
          } else {
            console.error("Error fetching applications:", data.message);
          }
        } catch (error) {
          console.error("Error fetching applications:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchApplications();
    }
  }, [user]);

  return (
    <div className="col-span-1 bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-bold mb-4">Job Applications</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {applications.length === 0 ? (
            <p>No applications found.</p>
          ) : (
            <ul className="space-y-2">
              {applications.map((app) => (
                <li
                  key={app._id}
                  className="flex justify-between items-center p-3 bg-white rounded shadow-sm hover:shadow-md transition"
                >
                  <span className="font-medium text-gray-800 capitalize">
                    {app.jobTitle || "N/A"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold
                      ${
                        app.status === "Applied"
                          ? "bg-blue-100 text-blue-700"
                          : app.status === "In Review"
                          ? "bg-yellow-100 text-yellow-700"
                          : app.status === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : app.status === "Accepted"
                          ? "bg-green-100 text-green-700"
                          : app.status === "Interview 1 Scheduled"
                          ? "bg-purple-100 text-purple-700"
                          : app.status === "Interview 1 Done"
                          ? "bg-purple-200 text-purple-800"
                          : app.status === "Interview 2 Scheduled"
                          ? "bg-indigo-100 text-indigo-700"
                          : app.status === "Interview 2 Done"
                          ? "bg-indigo-200 text-indigo-800"
                          : app.status === "Offered"
                          ? "bg-teal-100 text-teal-700"
                          : app.status === "Hired"
                          ? "bg-green-200 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {app.status}
                  </span>
                </li>
              ))}
            </ul>

          )}
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            View All Applications
          </button>
        </>
      )}
    </div>
  );
};

export default JobApplications;
