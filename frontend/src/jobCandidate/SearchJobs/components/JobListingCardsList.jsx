import React, { useState, useEffect, useRef } from "react";
import JobListingCard from "./JobListingCard";
import { FaSpinner, FaSearch, FaBookmark, FaExclamationTriangle, FaArrowLeft, FaArrowRight } from "react-icons/fa";
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
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const defaultRelevancePoints = {
    matchedJobRolePoints: 24,
    matchedSecurityClearancePoints: 15,
    matchedEducationPoints: 22,
    matchedSkillPoints: 22,
    matchedWorkExperiencePoints: 18,
  };

  const [relevancePoints, setRelevancePoints] = useState(defaultRelevancePoints);

  // Reference to the job listings container
  const listingsContainerRef = useRef(null);

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
    // Extract only the savedJobListings IDs we need for comparison
    const savedIds = new Set((user.savedJobListings || []).map(id => id.toString()));
    const currentFilteredListings = sortingMethod === 'saved'
      ? jobListings.filter(job => savedIds.has(job._id.toString()))
      : jobListings;
    setJobListingsCount(currentFilteredListings.length);
  }, [jobListings, sortingMethod, user.savedJobListings, setJobListingsCount]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortingMethod]);

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
  }, [filters, sortingMethod, user.cv, user.analyzed_cv_content, relevancePoints, user.relevancePoints]);

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
          matchedData.jobRole.push(`${job}`);
        }
      }
    }
  
    // Job Types match
    const STUDENT_JOB_MATCH_POINTS = 25;    
    const PART_TIME_JOB_FOR_STUDENT_POINTS = 18; 
    const FULL_TIME_JOB_FOR_NON_STUDENT_POINTS = 24;
    
    if (userData.job_role && Array.isArray(userData.job_role)) {
      const isStudent = userData.job_role.includes('Student');

      if (isStudent) {
        if (jobListing.jobType.includes('Student')) {
          score += STUDENT_JOB_MATCH_POINTS;
          matchedData.jobType.push(`Student,${STUDENT_JOB_MATCH_POINTS}`);
        } else if (jobListing.jobType.includes('Part Time')) {
          score += PART_TIME_JOB_FOR_STUDENT_POINTS;
          matchedData.jobType.push(`Part Time,${PART_TIME_JOB_FOR_STUDENT_POINTS}`);
        }
        // No points for students applying to full-time jobs
      } else {
        if (jobListing.jobType.includes('Full Time')) {
          score += FULL_TIME_JOB_FOR_NON_STUDENT_POINTS;
          matchedData.jobType.push(`Full Time,${FULL_TIME_JOB_FOR_NON_STUDENT_POINTS}`);
        }
        // No points for non-students applying to part-time or student positions
      }
    }


    // Security clearance match
    if (userData.security_clearance && jobListing.securityClearance) {
      if (userData.security_clearance <= jobListing.securityClearance) {
        score += matchedSecurityClearancePoints;
        matchedData.securityClearance = `${userData.security_clearance}`;
      }
    }
  
    // Education match
    if (userData.education && Array.isArray(userData.education) && userData.education.length > 0 && 
        jobListing.education && Array.isArray(jobListing.education) && jobListing.education.length > 0) {
      userData.education.forEach(edu => {
        if (jobListing.education.includes(edu.degree) && !userData.job_role.includes('Student')) {
          score += matchedEducationPoints;
          matchedData.education.push(`${edu.degree}`);
        }
      });
    }
  
    // Previous work experience match
    const workExperienceResult = jobListing.workExperience && userData.work_experience
      ? calculateWorkExperienceMatch(userData, jobListing, matchedWorkExperiencePoints)
      : { matchedJobs: [], experienceScore: 0 };

    if (workExperienceResult.experienceScore > 0) {
      matchedData.workExperience.push(...workExperienceResult.matchedJobs.map(job => `${job}`));
    }
    score += workExperienceResult.experienceScore;
  
    // Skills match
    if (userData.skills && Array.isArray(userData.skills) && jobListing.skills && Array.isArray(jobListing.skills)) {
      const matchedSkills = jobListing.skills.filter(skill =>
        userData.skills.includes(skill)
      );
      const skillsScore = matchedSkills.length >= 3 ? matchedSkillPoints : 0;
      score += skillsScore;
      matchedData.skills = matchedSkills.map(skill => `${skill}`);
    }
  
    return { score, matchedData };
  }
  
  // Apply "Saved" filter if selected
  const savedIds = new Set((user.savedJobListings || []).map(id => id.toString()));
  const filteredListings =
    sortingMethod === 'saved'
      ? jobListings.filter(job => savedIds.has(job._id.toString()))
      : jobListings;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredListings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);

  // Change page handler
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Page navigation handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show at most 5 page numbers
    
    if (totalPages <= maxPagesToShow) {
      // If we have less than maxPagesToShow pages, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Complex pagination logic for many pages
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add first page if not included
      if (startPage > 1) {
        pageNumbers.unshift(1);
        if (startPage > 2) pageNumbers.splice(1, 0, '...');
      }
      
      // Add last page if not included
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Add this effect to handle scrolling when page changes
  useEffect(() => {
    // If we have a container reference and it's not the initial render
    if (listingsContainerRef.current) {
      // Get the element that should be at the top of the view
      const element = document.getElementById('job-listings-top');
      if (element) {
        // Scroll to the element with a small offset
        window.scrollTo({
          top: element.offsetTop - 80, // 80px offset to account for headers/nav
          behavior: 'instant' // Use 'instant' instead of 'smooth' to prevent animation
        });
      }
    }
  }, [currentPage]); // Only run when the page changes

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
    <>
      {/* Position marker for scrolling */}
      <div id="job-listings-top"></div>
      
      {/* Pagination Controls - Only at the top */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center my-4">
          <nav className="flex justify-center items-center space-x-3 bg-white px-4 py-2 rounded-full shadow-md border border-gray-100" aria-label="Pagination">
            {/* Previous page button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                goToPreviousPage();
              }}
              disabled={currentPage === 1}
              className={`p-2 rounded-full transition-all duration-300 ${
                currentPage === 1 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
              aria-label="Previous page"
            >
              <FaArrowLeft size={14} className="transform transition-transform group-hover:translate-x-[-2px]" />
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center space-x-1 mx-1">
              {getPageNumbers().map((number, index) => (
                number === '...' 
                  ? <span key={`ellipsis-${index}`} className="px-1 text-gray-400 font-light">•••</span>
                  : (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        paginate(number);
                      }}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all duration-300 ${
                        currentPage === number
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium scale-110 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      aria-current={currentPage === number ? "page" : undefined}
                    >
                      {number}
                    </button>
                  )
              ))}
            </div>
            
            {/* Next page button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                goToNextPage();
              }}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full transition-all duration-300 ${
                currentPage === totalPages 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
              aria-label="Next page"
            >
              <FaArrowRight size={14} className="transform transition-transform group-hover:translate-x-[2px]" />
            </button>
          </nav>
        </div>
      )}

      {/* Job listings */}
      <div 
        ref={listingsContainerRef}
        className="grid grid-cols-1 gap-4 p-4 md:p-6"
      >
        {currentItems.map((jobListing) => (
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
              relevancePoints={relevancePoints}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default JobListingCardsList;
