import React, { useState, useEffect } from "react";
import JobListingCard from "./JobListingCard";
import { FaSpinner } from "react-icons/fa";
import calculateWorkExperienceMatch from "../utils/calculateWorkExperienceMatch";

const JobListingCardsList = ({
  filters,
  onJobSelect,
  user,
  setUser,
  setShowModal,
  showNotification,
  setJobListingsCount,
  sortingMethod,
  setEducationListedOptions,
  setCurrentOpenConversationId
}) => {
  const [jobListings, setJobListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const defaultRelevancePoints = {
    matchedJobRolePoints: 10,
    matchedSecurityClearancePoints: 20,
    matchedEducationPoints: 20,
    matchedSkillPoints: 3,
    matchedWorkExperiencePoints: 30,
  };

  const [relevancePoints, setRelevancePoints] = useState(defaultRelevancePoints);

  // Load relevance points on mount
  useEffect(() => {
    async function loadRelevancePoints() {
      let points = JSON.parse(localStorage.getItem("relevancePoints"));
      if (!points) {
        points = await fetchRelevancePoints(user.email);
      }
      if (!points) {
        console.error("Relevance points could not be fetched. Using default values.");
        points = defaultRelevancePoints;
      }
  
      setRelevancePoints(points);
    }
    loadRelevancePoints();
  }, [user.email, user.relevancePoints]);

  // Fetch job listings and sort them
  useEffect(() => {
    const fetchAndSortJobListings = async (triesLeft) => {
      try {
        // Fetch job listings
        const query = new URLSearchParams(filters).toString();
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/joblistings/filteredJobListings?${query}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          triesLeft -= 1;
          if (triesLeft) {
            setTimeout(() => {
              fetchAndSortJobListings(triesLeft);
            }, 100);
          } else {
            throw new Error("Failed to fetch job listings.");
          }
        }
        const data = await response.json();
        let sortedListings = data.jobListings;

        if (sortingMethod === "newest") {
          sortedListings = [...sortedListings].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
        } else if (sortingMethod === "oldest") {
          sortedListings = [...sortedListings].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        } else if (sortingMethod === "relevance") {
          console.log("Relevance points: ", relevancePoints);
          const localStorageKey = `relevance_data_${user.id || user._id}`;

          // Force recalculation by clearing stored relevance data whenever relevancePoints change.
          localStorage.removeItem(localStorageKey);
          let storedRelevanceData = JSON.parse(localStorage.getItem(localStorageKey)) || [];

          // Create a map for quick lookup
          const relevanceMap = new Map(storedRelevanceData.map(item => [item.jobId, item]));
      

          // Calculate relevance scores for each job listing
          const relevanceList = await Promise.all(
            sortedListings.map(async (jobListing) => {
              const jobId = jobListing.id || jobListing._id; // Unique job identifier
              let score, matchedData;
              if (relevanceMap.has(jobId)) {
                ({ score, matchedData } = relevanceMap.get(jobId));
            
            
              } else {
                ({ score, matchedData } = await calculateRelevanceScore(jobListing, user, relevancePoints));
            
            
                relevanceMap.set(jobId, { jobId, score, matchedData });
              }
              return {
                jobListing,
                relevanceScore: score,
                matchedData,
              };
            })
          );

          // Convert map back to an array and update localStorage
          storedRelevanceData = Array.from(relevanceMap.values());
          localStorage.setItem(localStorageKey, JSON.stringify(storedRelevanceData));

          sortedListings = relevanceList
            .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort descending
            .map((item) => ({
              ...item.jobListing,
              score: item.relevanceScore,
              matchedData: item.matchedData,
            }));
        }

        setJobListings(sortedListings);
        setJobListingsCount(sortedListings.length);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err.message);
      }
    };

    setTimeout(() => {
      fetchAndSortJobListings(3);
    }, 100);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortingMethod, user, user.cv, relevancePoints, user.relevancePoints]);

  useEffect(() => {
    try {
      if (jobListings) {
        const listedOptions = Array.from(
          new Set(jobListings.map((jobListing) => jobListing.education).flat())
        );
        setEducationListedOptions(listedOptions);
      }
    } catch (err) {
      console.error("Error fetching education options:", err);
    }
  }, [jobListings, setEducationListedOptions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  // Fetch relevance points function
  async function fetchRelevancePoints(userEmail) {
    try {
  
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/personal/relevance-points?email=${encodeURIComponent(userEmail)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch relevance points");
      }
      const data = await response.json();
      localStorage.setItem("relevancePoints", JSON.stringify(data.relevancePoints));
      return data.relevancePoints;
    } catch (error) {
      console.error("Error fetching relevance points:", error);
      return null;
    }
  }

  // Calculate relevance score function
  async function calculateRelevanceScore(jobListing, user, relevancePoints) {
    let score = 0;
    let matchedData = {
      jobRole: [],
      jobType: [],
      securityClearance: null,
      education: [],
      workExperience: [],
      skills: []
    };
  
    const userData = user.analyzed_cv_content;
  
    // Destructure relevance point values
    const {
      matchedJobRolePoints,
      matchedSecurityClearancePoints,
      matchedEducationPoints,
      matchedSkillPoints,
      matchedWorkExperiencePoints
    } = relevancePoints;
  
    // Job Roles match
    if (userData.job_role) {
      for (const job of userData.job_role) {
        if (job.toLowerCase() === jobListing.jobRole.toLowerCase()) {
          score += matchedJobRolePoints;
          matchedData.jobRole.push(`${job} (${matchedJobRolePoints})`);
        }
      }
    }
  
    // Job Types match
    if (userData.job_role) {
      if (userData.job_role.includes('Student')) {
        if (jobListing.jobType.includes('Student')) {
          score += 20;
          matchedData.jobType.push(`Student (20)`);
        } else if (jobListing.jobType.includes('Part Time')) {
          score += 15;
          matchedData.jobType.push(`Part Time (15)`);
        }
      } else if (jobListing.jobType.includes('Full Time')) {
        score += 20;
        matchedData.jobType.push(`Full Time (20)`);
      }
    }
  
    // Security clearance match
    if (userData.security_clearance && jobListing.securityClearance) {
      if (userData.security_clearance <= jobListing.securityClearance) {
        score += matchedSecurityClearancePoints;
        matchedData.securityClearance = `${userData.security_clearance} (${matchedSecurityClearancePoints})`;
      }
    }
  
    // Education match
    if (userData.education.length > 0 && jobListing.education.length > 0) {
      userData.education.forEach(edu => {
        if (jobListing.education.includes(edu.degree) && !userData.job_role.includes('Student')) {
          score += matchedEducationPoints;
          matchedData.education.push(`${edu.degree} (${matchedEducationPoints})`);
        }
      });
    }
  
    // Previous work experience match
    const { matchedJobs = [], experienceScore = 0 } =
      jobListing.workExperience
        ? calculateWorkExperienceMatch(userData, jobListing, matchedWorkExperiencePoints) || {}
        : {};
    if (experienceScore > 0) {
      matchedData.workExperience.push(...matchedJobs.map(job => `${job} (${matchedWorkExperiencePoints})`));
    }
    score += experienceScore;
  
    // Skills match
    if (userData.skills) {
      const matchedSkills = jobListing.skills.filter(skill =>
        userData.skills.includes(skill)
      );
      const skillsScore = matchedSkills.length * matchedSkillPoints;
      score += skillsScore;
      matchedData.skills = matchedSkills.map(skill => `${skill} (${matchedSkillPoints})`);
    }
  
    return { score, matchedData };
  }
  


  return (
    <div className="space-y-4 p-4">
      {jobListings.map((jobListing) => (
        <div
          key={jobListing._id}
          onClick={() => onJobSelect(jobListing)}
          className="cursor-pointer"
        >
          <JobListingCard
            jobListing={jobListing}
            user={user}
            setUser={setUser}
            setShowModal={setShowModal}
            showNotification={showNotification}
            setCurrentOpenConversationId={setCurrentOpenConversationId}
          />
        </div>
      ))}
    </div>
  );
};

export default JobListingCardsList;
