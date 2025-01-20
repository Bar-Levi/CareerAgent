import React, { useState } from "react";

const SearchFilters = ({ filters, setFilters, clearFilters }) => {
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // List of job roles
  const jobRoles = [
    "Student",
    "Full Stack Developer",
    "Backend Developer",
    "Frontend Developer",
    "Software Engineer",
    "Automation Developer",
    "Automation Engineer",
    "DevOps Engineer",
    "Data Scientist",
    "Machine Learning Engineer",
    "Cybersecurity Specialist",
    "Web Developer",
    "Mobile Developer",
    "Game Developer",
    "Product Manager",
    "UX Designer",
    "Blockchain Developer",
    "AI Engineer",
    "Cloud Engineer",
    "Embedded Software Engineer",
    "Technical Lead",
    "Software Architect",
    "Release Manager",
    "Site Reliability Engineer",
    "UI Developer",
    "QA Engineer",
    "Security Engineer",
    "Network Engineer",
    "Data Analyst",
    "Big Data Specialist",
    "ETL Developer",
    // Add other roles as needed
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value }); // Update specific filter key

    if (name === "jobRole") {
      // Autocomplete for jobRole
      if (value.trim() === "") {
        setFilteredRoles([]);
        setShowDropdown(false);
      } else {
        const matches = jobRoles.filter((role) =>
          role.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredRoles(matches);
        setShowDropdown(matches.length > 0);
      }
    }
  };

  const handleDropdownClick = (role) => {
    // Update the text field and filters state
    setFilters({ ...filters, jobRole: role });
    setFilteredRoles([]); // Clear the dropdown options
    setShowDropdown(false); // Hide the dropdown
  };

  return (
    <div className="relative bg-white shadow rounded-lg h-screen">
      <div className="flex sticky top-0">
        <div className="w-full flex sticky top-0 items-center justify-between p-4 bg-brand-primary text-brand-accent text-2xl font-bold">
          <span>Filters</span>
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
        <div className="relative">
          <input
            type="text"
            name="jobRole"
            placeholder="Job Role"
            value={filters.jobRole || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />

          {/* Dropdown for Auto-Completion */}
          {showDropdown && (
            <ul className="absolute z-10 w-full bg-white border rounded shadow-md max-h-48 overflow-y-auto">
              {filteredRoles.map((role) => (
                <li
                  key={role}
                  onClick={() => handleDropdownClick(role)} // Set jobRole on selection
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {role}
                </li>
              ))}
            </ul>
          )}
        </div>

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
        <select
          name="companySize"
          value={filters.companySize || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="" disabled>
            Select Company Size
          </option>
          <option value="0-30">0-30</option>
          <option value="31-100">31-100</option>
          <option value="101-300">101-300</option>
          <option value="301+">301+</option>
        </select>

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
      </div>
    </div>
  );
};

export default SearchFilters;
