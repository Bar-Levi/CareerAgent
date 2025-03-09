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
                <li key={app._id} className="flex justify-between">
                  <span>{app.jobTitle || "N/A"}</span>
                  <span
                    className={
                      app.status === "Applied"
                        ? "text-blue-600"
                        : app.status === "In review"
                        ? "text-yellow-600"
                        : app.status === "Rejected"
                        ? "text-red-600"
                        : app.status === "Accepted"
                        ? "text-green-600"
                        : "text-gray-600"
                    }
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
