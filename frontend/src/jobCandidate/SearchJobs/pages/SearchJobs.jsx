import React, { useState } from "react";
import JobListingCardsList from "../components/JobListingCardsList";
import SearchFilters from "../components/SearchFilters";
import NavigationBar from "../../../components/NavigationBar";
import { useLocation } from "react-router-dom";

const SearchJobs = () => {
  const { state } = useLocation();
  const [filters, setFilters] = useState({
    jobRole: "",
    location: "",
    experienceLevel: "",
    jobType: "",
  });

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <NavigationBar userType={state.user.role} />

      {/* Main Content */}
      <div className="flex-grow p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Filters Section */}
        <div className="bg-white p-4 rounded shadow lg:col-span-1">
          <SearchFilters filters={filters} setFilters={setFilters} />
        </div>

        {/* Job Listings Section */}
        <div className="bg-white p-4 rounded shadow lg:col-span-2 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">Search Jobs</h1>
          <JobListingCardsList filters={filters} />
        </div>

        {/* Job Details Section */}
        <div className="bg-white p-4 rounded shadow lg:col-span-1 hidden lg:block">
          <p className="text-gray-500">Select a job to view details.</p>
        </div>
      </div>
    </div>
  );
};

export default SearchJobs;
