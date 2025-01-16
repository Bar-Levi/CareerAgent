import React, { useState, useEffect } from "react";
import JobListingCard from "./JobListingCard";

const JobListingCardsList = ({ onJobSelect }) => {
  const [jobListings, setJobListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobListings = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/joblistings`);
        if (!response.ok) {
          throw new Error("Failed to fetch job listings.");
        }
        const jobListings = await response.json();
        setJobListings(jobListings.jobListings);
        setLoading(false);
      } catch (err) {
        setError("Failed to load job listings.");
        setLoading(false);
      }
    };

    fetchJobListings();
  }, []);

  if (loading) {
    return <p>Loading job listings...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-4">
      {jobListings.map((jobListing) => (
        <div
          key={jobListing._id}
          onClick={() => onJobSelect(jobListing)}
          className="cursor-pointer"
        >
          <JobListingCard jobListing={jobListing} />
        </div>
      ))}
    </div>
  );
};

export default JobListingCardsList;
