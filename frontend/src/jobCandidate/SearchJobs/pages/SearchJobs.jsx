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
  const [selectedJob, setSelectedJob] = useState(null); // Manage the selected job

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job); // Update the selected job
  };

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      {/* Navigation Bar */}
      <div className="flex-shrink-0">
        <NavigationBar userType={state.user.role} />
      </div>

      {/* Main Content */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-4 p-6 max-w-7xl mx-auto overflow-hidden">
        {/* Filters Section */}
        <div className="bg-white rounded shadow lg:col-span-1 h-full overflow-y-auto">
          <SearchFilters filters={filters} setFilters={handleFilterChange} />
        </div>

        {/* Job Listings Section */}
        <div className="relative bg-white rounded shadow lg:col-span-2 h-full overflow-y-auto">
          <h1 className="p-4 sticky top-0 bg-brand-primary text-brand-accent text-2xl font-bold">Search Jobs</h1>
          <JobListingCardsList filters={filters} onJobSelect={handleJobSelect} />
        </div>

        {/* Job Details Section */}
        <div className="bg-white p-4 rounded shadow lg:col-span-1 h-full overflow-y-auto hidden lg:block">
          {selectedJob ? (
            <div>
              <h2 className="text-xl font-bold mb-2">{selectedJob.jobRole}</h2>
              <p className="text-sm text-gray-600">
                {selectedJob.company} - {selectedJob.location}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Experience: {selectedJob.experienceLevel}
              </p>
              <p className="text-sm text-gray-500">Type: {selectedJob.jobType.join(", ")}</p>
              <p className="mt-4">{selectedJob.description}</p>
              {selectedJob.companyWebsite && (
                <a
                  href={selectedJob.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline mt-2 block"
                >
                  Visit Company Website
                </a>
              )}
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
                Apply Now
              </button>
            </div>
          ) : (
            <p className="text-gray-500">Select a job to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchJobs;
