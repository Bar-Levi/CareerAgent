import React from "react";

const RecentApplications = ({ applications }) => {
    return (
        <div className="w-full max-w-5xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Applications</h2>
            <div className="bg-white shadow rounded-lg p-4">
                {applications.length === 0 ? (
                    <p className="text-gray-500">No recent applications.</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {applications.map((app) => (
                            <li key={app.id} className="py-4 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">{app.candidate}</h3>
                                    <p className="text-sm text-gray-500">Applied for: {app.position}</p>
                                    <p className="text-sm text-gray-400">Date: {app.date}</p>
                                </div>
                                <p
                                    className={`px-3 py-1 text-sm rounded-full ${
                                        app.status === "Screening"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-blue-100 text-blue-800"
                                    }`}
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
