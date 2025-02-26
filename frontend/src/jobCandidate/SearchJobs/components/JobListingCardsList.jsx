import React, { useState, useEffect } from "react";
import JobListingCard from "./JobListingCard";
import { FaSpinner } from "react-icons/fa";
import calculateJobMatch from "../utils/calculateJobMatch";

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

  useEffect(() => {
    const fetchAndSortJobListings = async () => {
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
          throw new Error("Failed to fetch job listings.");
        }
  
        const data = await response.json();
  
        // Sort job listings
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
          const relevanceList = sortedListings.map((jobListing) => {
              const { score, matchedData } = calculateRelevanceScore(jobListing, user); // Extract both score and matchedData
              return {
                  jobListing,
                  relevanceScore: score,
                  matchedData, // Include matchedData in the result
              };
          });
      
          sortedListings = relevanceList
              .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance score in descending order
              .map((item) => ({ ...item.jobListing, score: item.relevanceScore, matchedData: item.matchedData })); // Include matchedData in final job listing
        }
      

        setJobListings(sortedListings);
        setJobListingsCount(sortedListings.length);
        setLoading(false);
      } catch (err) {
        setError("Failed to load job listings.");
        setLoading(false);
      }
    };
  
    fetchAndSortJobListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortingMethod, user]);
  
useEffect(() => {
  try {
  if (jobListings) {
    const listedOptions = Array.from(
      new Set(
        jobListings
          .map((jobListing) => jobListing.education) // Extract 'education' arrays
          .flat() // Flatten the nested arrays into a single array
      )
    );
    setEducationListedOptions(listedOptions);
  }
} catch (err) {
  console.error("Error fetching education options:", err);
}
}, [jobListings])


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

  function calculateRelevanceScore(jobListing, user) {
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

    // Job Roles match
    if (userData.job_role) {
        for (const job of userData.job_role) {
            if (job.toLowerCase() === jobListing.jobRole.toLowerCase()) {
                score += 10;
                matchedData.jobRole.push(job);
                console.log(`Matched job role: '${job}' with job listing role: '${jobListing.jobRole}' - Added 10 points.`);
            }
        }
    }

    // Job Types match
    if (userData.job_role) {
        if (userData.job_role.includes('Student')) {
            if (jobListing.jobType.includes('Student')) {
                score += 20;
                matchedData.jobType.push('Student');
                console.log(`User is a student, and job listing is for a student role - Added 20 points.`);
            } else if (jobListing.jobType.includes('Part Time')) {
                score += 15;
                matchedData.jobType.push('Part Time');
                console.log(`User is a student, and job listing is for a part-time role - Added 15 points.`);
            }
        } else if (jobListing.jobType === 'Full Time') {
            score += 20;
            matchedData.jobType.push('Full Time');
            console.log(`User is not a student, and job listing is for a full-time role - Added 20 points.`);
        }
    }

    // Security clearance match
    if (userData.security_clearance && jobListing.securityClearance) {
        if (userData.security_clearance <= jobListing.securityClearance) {
            score += 20;
            matchedData.securityClearance = userData.security_clearance;
            console.log(`User's security clearance (${userData.security_clearance}) matches the job listing's requirement (${jobListing.securityClearance}) - Added 20 points.`);
        }
    }

    // Education match
    if (userData.education.length > 0 && jobListing.education.length > 0) {
        userData.education.forEach(edu => {
            // Checking if the user has the education && the user isn't a student (meaning they finished the degree)
            if (jobListing.education.includes(edu.degree) && !userData.job_role.includes('Student')) {
                score += 20;
                matchedData.education.push(edu.degree);
                console.log(`User's degree '${edu.degree}' matches the job listing education requirement - Added 20 points.`);
            }
        });
    }

    // Previous work experience match
    const experienceScore = jobListing.workExperience ? calculateJobMatch(userData, jobListing) : 0;
    if (experienceScore > 0) {
        matchedData.workExperience.push(`Experience match score: ${experienceScore}`);
    }
    score += experienceScore;
    console.log(`Previous work experience match contributed ${experienceScore} points.`);

    // Skills match
    if (userData.skills) {
        const matchedSkills = jobListing.skills.filter(skill =>
            userData.skills.includes(skill)
        );
        const skillsScore = matchedSkills.length * 3;
        score += skillsScore;
        matchedData.skills = matchedSkills;
        console.log(`Matched skills: [${matchedSkills.join(', ')}] - Added ${skillsScore} points.`);
    }

    console.log(`Final score for job role '${jobListing.jobRole}' is ${score}`);

    return { score, matchedData };
}

  
  
  return (
    <div className="space-y-4 p-4">
      {jobListings.map((jobListing) => (
        <div
          key={jobListing._id}
          onClick={() => onJobSelect(jobListing)} // Handle job selection
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
