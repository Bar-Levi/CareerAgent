// metricsUtils.js
const JobListing = require("../models/jobListingModel"); // Adjust the path to your model

/**
 * Calculates metrics for a recruiter based on their job listings.
 *
 * @param {String} recruiterId - The ID of the recruiter.
 * @returns {Promise<Object>} - A promise that resolves to an object containing:
 *    activeListings: Number of active job listings,
 *    totalApplications: Total number of applications across all listings,
 *    avgTimeToHire: Average number of days between job posting and closing for closed listings.
 */
const getMetricsByRecruiterId = async (recruiterId) => {
  try {
    // Fetch all job listings for the given recruiter
    const jobListings = await JobListing.find({ recruiterId });

    // If no job listings are found, return metrics with zeros
    if (!jobListings.length) {
      return {
        activeListings: 0,
        totalApplications: 0,
        avgTimeToHire: 0,
      };
    }

    // Count active listings
    const activeListingsCount = jobListings.filter(
      (job) => job.status === "Active"
    ).length;

    // Calculate total applications across all job listings
    const totalApplications = jobListings.reduce(
      (total, job) => total + (job.applicants?.length || 0),
      0
    );

    // Filter closed job listings (assuming closingTime exists for closed listings)
    const closedJobListings = jobListings.filter(
      (job) => job.closingTime && job.createdAt
    );

    // Calculate total time to hire (in days) for closed listings
    const totalTimeToHire = closedJobListings.reduce((total, job) => {
      const closingTime = new Date(job.closingTime);
      const createdAt = new Date(job.createdAt);
      // Calculate days difference
      const daysToHire = (closingTime - createdAt) / (1000 * 60 * 60 * 24);
      return total + Math.round(daysToHire);
    }, 0);

    // Compute average time to hire
    const avgTimeToHire =
      closedJobListings.length > 0
        ? totalTimeToHire / closedJobListings.length
        : 0;

    return {
      activeListings: activeListingsCount,
      totalApplications,
      avgTimeToHire,
    };
  } catch (error) {
    // Rethrow the error to let the caller handle it.
    throw new Error(`Error calculating metrics: ${error.message}`);
  }
};

module.exports = { getMetricsByRecruiterId };
