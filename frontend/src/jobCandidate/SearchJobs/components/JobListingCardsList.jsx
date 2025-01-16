import React, { useState, useEffect } from "react";
import JobListingCard from "./JobListingCard";

const JobListingCardsList = ({ filters, onJobSelect }) => {
  const [jobListings, setJobListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobListings = async () => {
      try {
        const query = new URLSearchParams(filters).toString();
        console.log('query:', query);
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/joblistings/filteredJobListings?${query}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch job listings.");
        }
        const data = await response.json();
        setJobListings(data.jobListings);
        console.log("Fetched job listings");
        setLoading(false);
      } catch (err) {
        setError("Failed to load job listings.");
        setLoading(false);
      }
    };

    fetchJobListings();
  }, [filters]);

  if (loading) {
    return <p>Loading job listings...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-4 p-4">
      {jobListings.map((jobListing) => (
        <div
          key={jobListing._id}
          onClick={() => onJobSelect(jobListing)} // Handle job selection
          className="cursor-pointer"
        >
          <JobListingCard jobListing={jobListing} />
        </div>
      ))}
    </div>
  );
};

export default JobListingCardsList;
