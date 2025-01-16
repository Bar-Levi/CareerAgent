import React from "react";

const JobApplications = () => {
  return (
    <div className="col-span-1 bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-bold mb-4">Job Applications</h2>
      <ul className="space-y-2">
        <li className="flex justify-between">
          <span>Frontend Developer at TechCorp</span>
          <span className="text-blue-600">In Progress</span>
        </li>
        <li className="flex justify-between">
          <span>Backend Developer at CodeBase</span>
          <span className="text-green-600">Interview Scheduled</span>
        </li>
        <li className="flex justify-between">
          <span>Fullstack Developer at DevSoft</span>
          <span className="text-red-600">Rejected</span>
        </li>
      </ul>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">View All Applications</button>
    </div>
  );
};

export default JobApplications;
