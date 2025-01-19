import React from "react";

const SearchFilters = ({ filters, setFilters, clearFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(name, value); // Update specific filter key
  };

  return (
    <div className="relative bg-white shadow rounded-lg h-screen">
      <div className="flex sticky top-0">
        <div className="w-full flex sticky top-0 items-center justify-between p-4 bg-brand-primary text-brand-accent text-2xl font-bold">
          <span>Filters</span>
          {/* Clear Filters Button */}
          <button
            onClick={clearFilters}
            className="py-1 px-2 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600 transition-all"
          >
            Clear Filters
          </button>
        </div>

      </div>
       
        <div className="space-y-4 overflow-y-auto p-4">
        {/* Job Role */}
        <input
          type="text"
          name="jobRole"
          placeholder="Job Role"
          value={filters.jobRole || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />

        {/* Company */}
        <input
          type="text"
          name="company"
          placeholder="Company"
          value={filters.company || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />

        {/* Location */}
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={filters.location || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />

        {/* Experience Level */}
        <select
          name="experienceLevel"
          value={filters.experienceLevel || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Choose Experience Level</option>
          <option value="Entry">Entry</option>
          <option value="Junior">Junior</option>
          <option value="Senior">Senior</option>
          <option value="Internship">Internship</option>
        </select>

        {/* Company Size */}
        <input
          type="text"
          name="companySize"
          placeholder="Company Size"
          value={filters.companySize || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />

        {/* Job Type */}
        <select
          name="jobType"
          value={filters.jobType || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Choose Job Type</option>
          <option value="Full Time">Full Time</option>
          <option value="Part Time">Part Time</option>
          <option value="Contract">Contract</option>
        </select>

        {/* Remote */}
        <select
          name="remote"
          value={filters.remote || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Choose Remote</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-Site">On-Site</option>
        </select>

        {/* Skills */}
        <input
          type="text"
          name="skills"
          placeholder="Skills (comma-separated)"
          value={filters.skills || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />

        {/* Languages */}
        <input
          type="text"
          name="languages"
          placeholder="Languages (comma-separated)"
          value={filters.languages || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />

        {/* Security Clearance */}
        <input
          type="number"
          name="securityClearance"
          placeholder="Security Clearance"
          value={filters.securityClearance || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />

        {/* Education */}
        <input
          type="text"
          name="education"
          placeholder="Education (comma-separated)"
          value={filters.education || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />

        {/* Work Experience */}
        <input
          type="number"
          name="workExperience"
          placeholder="Work Experience (years)"
          value={filters.workExperience || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
    </div>
  );
};

export default SearchFilters;
