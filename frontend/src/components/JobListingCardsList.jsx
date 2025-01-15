import React, { useState, useEffect } from "react";
import JobListingCard from "./JobListingCard";

const JobListingCardsList = () => {
  const [jobListings, setJobListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch job listings from the API
    const fetchJobListings = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/joblistings/joblistings`);
        if (!response.ok) {
          throw new Error("Failed to fetch job listings.");
        }
        const jobListings = await response.json();
        console.log("jobListings: " + JSON.stringify(jobListings));
        console.log("response.data: " + JSON.stringify(response.data));
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
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-4">
      {jobListings && jobListings.map((jobListing) => (
        <JobListingCard key={jobListing._id} jobListing={jobListing} />
      ))}

    </div>
  );
};

export default JobListingCardsList;
