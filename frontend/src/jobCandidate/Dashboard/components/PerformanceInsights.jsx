import React from "react";

const PerformanceInsights = () => {
  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-bold mb-4">Performance Insights</h2>
      <ul className="space-y-2">
        <li className="flex justify-between">
          <span>Profile Views</span>
          <span>120</span>
        </li>
        <li className="flex justify-between">
          <span>Applications Sent</span>
          <span>15</span>
        </li>
        <li className="flex justify-between">
          <span>Interview Invites</span>
          <span>3</span>
        </li>
      </ul>
    </div>
  );
};

export default PerformanceInsights;
