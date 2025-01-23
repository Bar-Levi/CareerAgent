import React from "react";

const PersonalOverview = () => {
  return (
    <div className="col-span-1 bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-bold mb-4">Personal Overview</h2>
      <div className="space-y-2">
        <p>Name: <strong>John Doe</strong></p>
        <p>Title: <strong>Software Developer</strong></p>
        <p>Skills: <strong>React, Node.js, Python</strong></p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">Profile Completion</p>
          <div className="bg-gray-200 w-full h-4 rounded">
            <div className="bg-blue-600 h-4 rounded" style={{ width: "75%" }}></div>
          </div>
          <p className="text-sm mt-1">75% Complete</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalOverview;
