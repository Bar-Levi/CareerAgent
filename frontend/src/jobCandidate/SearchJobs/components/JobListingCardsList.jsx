import React, { useState, useEffect } from "react";
import JobListingCard from "./JobListingCard";
import { FaSpinner, FaSearch, FaBookmark, FaFolderOpen, FaExclamationTriangle } from "react-icons/fa";
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
  setRenderingConversationKey,
  setRenderingConversationData
}) => {
  const [jobListings, setJobListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCalculatingRelevance, setIsCalculatingRelevance] = useState(false);

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

  // Update the count to reflect filtered results
  useEffect(() => {
    const savedIds = new Set((user.savedJobListings || []).map(id => id.toString()));
    const currentFilteredListings = sortingMethod === 'saved'
      ? jobListings.filter(job => savedIds.has(job._id.toString()))
      : jobListings;
    setJobListingsCount(currentFilteredListings.length);
  }, [jobListings, sortingMethod, user.savedJobListings, setJobListingsCount]);

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
          setIsCalculatingRelevance(true);
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
            
          setIsCalculatingRelevance(false);
        }

        setJobListings(sortedListings);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err.message);
      }
    };

    setLoading(true);
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
  
    const userData = user?.analyzed_cv_content;
    
    // If no user data, return zero score
    if (!userData) {
      return { score: 0, matchedData };
    }
  
    // Destructure relevance point values
    const {
      matchedJobRolePoints,
      matchedSecurityClearancePoints,
      matchedEducationPoints,
      matchedSkillPoints,
      matchedWorkExperiencePoints
    } = relevancePoints;
  
    // Job Roles match
    if (userData.job_role && Array.isArray(userData.job_role)) {
      for (const job of userData.job_role) {
        if (job.toLowerCase() === jobListing.jobRole.toLowerCase()) {
          score += matchedJobRolePoints;
          matchedData.jobRole.push(`${job} (${matchedJobRolePoints})`);
        }
      }
    }
  
    // Job Types match
    if (userData.job_role && Array.isArray(userData.job_role)) {
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
    if (userData.education && Array.isArray(userData.education) && userData.education.length > 0 && 
        jobListing.education && Array.isArray(jobListing.education) && jobListing.education.length > 0) {
      userData.education.forEach(edu => {
        if (jobListing.education.includes(edu.degree) && !userData.job_role.includes('Student')) {
          score += matchedEducationPoints;
          matchedData.education.push(`${edu.degree} (${matchedEducationPoints})`);
        }
      });
    }
  
    // Previous work experience match
    const workExperienceResult = jobListing.workExperience && userData.work_experience
      ? calculateWorkExperienceMatch(userData, jobListing, matchedWorkExperiencePoints)
      : { matchedJobs: [], experienceScore: 0 };

    if (workExperienceResult.experienceScore > 0) {
      matchedData.workExperience.push(...workExperienceResult.matchedJobs.map(job => `${job} (${matchedWorkExperiencePoints})`));
    }
    score += workExperienceResult.experienceScore;
  
    // Skills match
    if (userData.skills && Array.isArray(userData.skills) && jobListing.skills && Array.isArray(jobListing.skills)) {
      const matchedSkills = jobListing.skills.filter(skill =>
        userData.skills.includes(skill)
      );
      const skillsScore = matchedSkills.length * matchedSkillPoints;
      score += skillsScore;
      matchedData.skills = matchedSkills.map(skill => `${skill} (${matchedSkillPoints})`);
    }
  
    return { score, matchedData };
  }
  
  // Apply "Saved" filter if selected
  const savedIds = new Set((user.savedJobListings || []).map(id => id.toString()));
  const filteredListings =
    sortingMethod === 'saved'
      ? jobListings.filter(job => savedIds.has(job._id.toString()))
      : jobListings;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 py-16">
        <FaSpinner className="animate-spin text-4xl text-blue-500 mb-3" />
        <p className="text-gray-500 font-medium">
          {sortingMethod === "relevance" && isCalculatingRelevance
            ? "Calculating job matches based on your CV..."
            : "Loading jobs..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 py-16 px-4">
        <FaExclamationTriangle className="text-5xl text-amber-500 mb-4" />
        <p className="text-lg text-gray-700 font-medium">Something went wrong</p>
        <p className="text-gray-500 mt-2 text-center">{error}</p>
      </div>
    );
  }

  if (filteredListings.length === 0 && sortingMethod === 'saved') {
    return (
      <div className="flex flex-col items-center justify-center h-96 py-16 px-4">
        <div className="bg-gray-50 rounded-full p-8 mb-6">
          <FaBookmark className="text-5xl text-gray-300" />
        </div>
        <p className="text-xl text-gray-600 font-medium">
          No saved job listings yet
        </p>
        <p className="text-gray-400 mt-2 text-center">
          Click the bookmark icon on any job listing to save it for later
        </p>
      </div>
    );
  } 
  
  if (filteredListings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 py-16 px-4">
        <div className="bg-gray-50 rounded-full p-8 mb-6">
          <FaSearch className="text-5xl text-gray-300" />
        </div>
        <p className="text-xl text-gray-600 font-medium">
          No matching job listings found
        </p>
        <p className="text-gray-400 mt-2 text-center">
          Try adjusting your filters to see more results
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:p-6">
      {filteredListings.map((jobListing) => (
        <div
          key={jobListing._id}
          className="transform transition-transform duration-200 hover:scale-[1.01]"
        >
          <JobListingCard
            onJobSelect={onJobSelect}
            jobListing={jobListing}
            user={user}
            setUser={setUser}
            setShowModal={setShowModal}
            showNotification={showNotification}
            setRenderingConversationKey={setRenderingConversationKey}
            setRenderingConversationData={setRenderingConversationData}
          />
        </div>
      ))}
    </div>
  );
};

export default JobListingCardsList;
