import React from "react";

const MetricsOverview = ({ metrics }) => {
    return (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800">Active Job Listings</h3>
                <p className="text-2xl text-indigo-600">{metrics.activeListings || 0}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800">Total Applications</h3>
                <p className="text-2xl text-indigo-600">{metrics.totalApplications || 0}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800">Avg Time to Hire</h3>
                <p className="text-2xl text-indigo-600">{metrics.avgTimeToHire || 0} days</p>
            </div>
        </div>
    );
};

export default MetricsOverview;
