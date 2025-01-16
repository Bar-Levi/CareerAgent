import React from "react";

const SearchFilters = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Filters</h2>
      <div className="space-y-4">
        {/* Job Role Filter */}
        <input
          type="text"
          name="jobRole"
          placeholder="Job Role"
          value={filters.jobRole}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />

        {/* Location Filter */}
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={filters.location}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />

        {/* Experience Level Filter */}
        <select
          name="experienceLevel"
          value={filters.experienceLevel}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Experience Level</option>
          <option value="Entry">Entry</option>
          <option value="Junior">Junior</option>
          <option value="Senior">Senior</option>
          <option value="Internship">Internship</option>
        </select>

        {/* Job Type Filter */}
        <select
          name="jobType"
          value={filters.jobType}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Job Type</option>
          <option value="Full Time">Full Time</option>
          <option value="Part Time">Part Time</option>
          <option value="Contract">Contract</option>
        </select>
      </div>
    </div>
  );
};

export default SearchFilters;
