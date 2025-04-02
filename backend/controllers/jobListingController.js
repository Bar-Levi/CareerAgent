const JobListing = require("../models/jobListingModel");
const JobSeeker = require("../models/jobSeekerModel");
const Applicant = require("../models/applicantModel");
const { getMetricsByRecruiterId } = require("../utils/metricsUtils");
const { sendJobNotificationEmail } = require("../utils/emailService");
const { checkAndInsertIn }  = require("../utils/checkAndInsertIn");
const { removeJobAndNotify } = require('../utils/jobHelpers');
const Conversation = require("../models/conversationModel");

const normalizeNullValues = (data) => {
    return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value === "null" ? null : value])
    );
};

// Helper function to normalize job titles
const normalizeText = (text) => {
  if (!text) return "";
  return text
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9\s]/g, "") // Remove special characters
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim(); // Remove leading/trailing spaces
}

const calculateWorkExperienceMatch = (userData, jobListing, matchedWorkExperiencePoints) => {
  let counter = 0; // Initialize counter for matching years of experience
  const matchedJobs = [];

  const normalizedJobListingRole = normalizeText(jobListing.jobRole);
  const listingTokens = new Set(normalizedJobListingRole.split(" "));

  userData.work_experience.forEach((experience) => {
    // Normalize the job titles
    const normalizedUserJobTitle = normalizeText(experience.job_title);
  
    // Tokenize and match based on subset of tokens
    const userTokens = new Set(normalizedUserJobTitle.split(" "));

    
    const isMatch = [...userTokens].every((token) => listingTokens.has(token)) || [...listingTokens].every((token) => userTokens.has(token))

    // If the job_title matches the jobRole
    if (isMatch) {
      const startYear = experience.start_year;
      const endYear = experience.end_year || new Date().getFullYear(); // Use current year if end_year is null
      const yearsOfExperience = endYear - startYear;
      counter += yearsOfExperience;
      matchedJobs.push(jobListing.jobRole + " - " + yearsOfExperience + " years of experience");
    }
  });

  // Check if the total experience meets or exceeds the required work experience
  if (counter >= jobListing.workExperience) {
    return {
      matchedJobs,
      experienceScore: matchedWorkExperiencePoints,
    };
  } else {
    return 0;
  }
}

async function calculateRelevanceScore(jobListing, user, relevancePoints) {
  try {
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
  } catch (error) {
    console.error("Error in calculateRelevanceScore:", error);
    return { score: 0, matchedData: {} };

  }
}


async function getCandidatesToNotify(newJobListing, jobSeekers) {
    const candidatesToNotify = [];
    
    for (const candidate of jobSeekers) {
      // Use candidate's own relevancePoints configuration.
      const relevancePoints = candidate.relevancePoints || {
        matchedJobRolePoints: 10,
        matchedSecurityClearancePoints: 20,
        matchedEducationPoints: 20,
        matchedSkillPoints: 3,
        matchedWorkExperiencePoints: 30,
      };
      
      // Calculate the match score for this candidate.
      const { score } = await calculateRelevanceScore(newJobListing, candidate, relevancePoints);
      
      // If the score meets or exceeds the candidate's minPointsForUpdate, add candidate to notification list.
      if (score >= candidate.minPointsForUpdate) {
        candidatesToNotify.push({ email: candidate.email, score });
      }
    }
    
    return candidatesToNotify;
  }
  
async function notifyRelevantJobSeekers(newJobListing) {
  try {
    // Find job seekers who have analyzed_cv_content and are subscribed
    const jobSeekers = await JobSeeker.find(
      { 
        analyzed_cv_content: { $exists: true, $ne: null },
        isSubscribed: true
      },
      'email analyzed_cv_content relevancePoints minPointsForUpdate'
    );

    const candidates = await getCandidatesToNotify(newJobListing, jobSeekers);

    // Optionally, log the number of notifications
    
    
    // Send emails using Promise.allSettled to avoid one failure stopping the process
    const results = await Promise.allSettled(
      candidates.map(candidate =>
        sendJobNotificationEmail(candidate.email, newJobListing)
      )
    );

    // Log results for each candidate
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        
      } else {
        console.error(`Failed to send email to ${candidates[index].email}:`, result.reason);
      }
    });
    
  } catch (error) {
    console.error("Error in notifying job seekers:", error);
  }
}
  

// Helper function to convert a value to Title Case
function toTitleCase(value) {
  // Ensure the value is a string. If it's falsy (like undefined or null), use an empty string.
  const str = typeof value === 'string' ? value : String(value || '');
  return str
    .split(/[\s-_]+/) // split on spaces, hyphens, or underscores
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}


  
// Controller to handle saving a new job listing
const saveJobListing = async (req, res) => {
    
    const normalizedBody = normalizeNullValues(req.body);
    try {
        // Extract job listing data from the request body
        const {
            jobRole,
            location,
            company,
            experienceLevel,
            companySize,
            jobType,
            remote,
            description,
            companyWebsite,
            securityClearance,
            education,
            workExperience,
            skills,
            languages,
            recruiterId,
            recruiterName,
            recruiterProfileImage,
            companyLogo,
        } = normalizedBody;

        console.log("normalizedBody: ",normalizedBody);
        
        // Validate required fields
        if (!jobRole || !location || !company || !experienceLevel || !jobType || !remote || !description) {
            
            return res.status(400).json({ message: "Missing required fields.", jsonToFill: normalizedBody});
        }

        education?.forEach((edu) => {
          edu = checkAndInsertIn(edu);
        });
        
        
        

        // Create a new job listing document
        const newJobListing = new JobListing({
            jobRole,
            location,
            company,
            experienceLevel: toTitleCase(experienceLevel),
            jobType: toTitleCase(jobType),
            remote: toTitleCase(remote),
            companySize,
            description,
            companyWebsite,
            securityClearance,
            education,
            workExperience,
            skills,
            languages,
            recruiterId,
            recruiterName,
            recruiterProfileImage,
            companyLogo,
        });

        console.log("description: ",description);
        // Save the job listing to the database
        const savedJobListing = await newJobListing.save();
        notifyRelevantJobSeekers(newJobListing);

        // Respond with the saved job listing
        res.status(201).json({
            message: "Job listing successfully created.",
            jobListing: savedJobListing,
        });
    } catch (error) {
        console.error("Error saving job listing:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Get all job listings
const getAllJobListings = async (req, res) => {
    try {
        const jobListings = await JobListing.find();
        res.status(200).json({
            message: "Job listings fetched successfully.",
            jobListings,
        });
    } catch (error) {
        console.error("Errorr fetching job listings:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Get a single job listing by ID
const getJobListingById = async (req, res) => {
    try {
        const { id } = req.params;
        const jobListing = await JobListing.findById(id);

        if (!jobListing) {
            return res.status(404).json({ message: "Job listing not found / removed by the recruiter." });
        }

        res.status(200).json({
            message: "Job listing fetched successfully.",
            jobListing,
        });
    } catch (error) {
        console.error("Errorrr fetching job listing:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Get all job listings by Recruiter ID
const getJobListingsByRecruiterId = async (req, res) => {
    try {
        // Destructure `id` from request parameters
        const { recruiterId } = req.params;

        if (!recruiterId) {
            return res.status(400).json({ message: "Recruiter ID is required." });
        }

        // Fetch job listings from the database
        const jobListings = await JobListing.find({ recruiterId });

        if (!jobListings || jobListings.length === 0) {
            console.warn(`[WARN] No job listings found for recruiter ID: ${recruiterId}`);
            return res.status(404).json({ message: "No job listings found for this recruiter." });
        }

        // Return the job listings with success response
        return res.status(200).json({
            message: "Job listings fetched successfully.",
            jobListings,
        });
    } catch (error) {
        // Log and return an error response
        console.error(`[ERROR] Error fetching job listings for recruiter ID ${req.params.id}:`, error);

        return res.status(500).json({
            message: "An error occurred while fetching job listings.",
            error: error.message,
        });
    }
};

const updateJobListing = async (req, res) => {
    try {
        const { id } = req.params;
        let updatedData = req.body;

        // Handle status-specific logic
        if (updatedData.status === "Closed") {
            updatedData.closingTime = new Date(); // Set closingTime to the current date and time
        } else if (updatedData.status === "Active" || updatedData.status === "Paused") {
            updatedData.closingTime = null; // Remove closingTime
        }

        

        const updatedJobListing = await JobListing.findByIdAndUpdate(id, updatedData, {
            new: true, // Return the updated document
            runValidators: true, // Run schema validators on the updated data
        });

        if (!updatedJobListing) {
            return res.status(404).json({ message: "Job listing not found." });
        }

        // Remove closed listing from all JobSeekers’ saved lists
        if (updatedData.status === "Closed") {
          await JobSeeker.updateMany(
              { savedJobListings: id },
              { $pull: { savedJobListings: id } }
          );
      }

        const recruiterId = updatedJobListing.recruiterId;

        const metrics = await getMetricsByRecruiterId(recruiterId);


        res.status(200).json({
            message: "Job listing updated successfully.",
            jobListing: updatedJobListing,
            metrics
        });
    } catch (error) {
        console.error("Error updating job listing:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const deleteJobListing = async (req, res) => {
  try {
    const deletedJob = await removeJobAndNotify(req.params.id, 'remove');
    res.status(200).json({ message: "Job listing deleted successfully.", jobListing: deletedJob });
  } catch (error) {
    console.error("Error deleting job listing:", error);
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json({ message: error.message, error: error.message });
  }
};




// Filter from the ACTIVE job listings
const filterActiveJobListings = async (req, res) => {
    try {
        const {
            jobRole,
            company,
            location,
            experienceLevel,
            companySize, // This comes as a range (e.g., "31-100" or "301+")
            jobType,
            remote,
            skills,
            securityClearance,
            education,
            workExperience,
        } = req.query;

        // Build the query dynamically
        const query = { status: 'Active' };

        if (jobRole) query.jobRole = { $regex: jobRole, $options: "i" };
        if (company) query.company = { $regex: company, $options: "i" };
        if (location) query.location = { $regex: location, $options: "i" };
        if (experienceLevel) query.experienceLevel = experienceLevel;

        // Handle company size range where `companySize` is stored as a numeric string
        if (companySize) {
            if (companySize === "301+") {
                // Handle the special case for "301+" (no upper limit)
                query.$expr = { $gte: [{ $toInt: "$companySize" }, 301] };
            } else {
                // Handle ranges like "31-100"
                const [minSize, maxSize] = companySize.split('-').map(Number);
                query.$expr = {
                    $and: [
                        ...(minSize !== undefined ? [{ $gte: [{ $toInt: "$companySize" }, minSize] }] : []),
                        ...(maxSize !== undefined ? [{ $lte: [{ $toInt: "$companySize" }, maxSize] }] : []),
                    ],
                };
            }
        }

        if (jobType) query.jobType = { $in: jobType.split(",").map((t) => t.trim()) };
        if (remote) query.remote = { $regex: remote, $options: "i" };
        if (skills) {
            const skillsArray = skills.split(",").map((s) => s.trim()); // Split and trim skills
            const lastSkill = skillsArray.length > 0 ? skillsArray.pop() : ""; // Get the last skill or empty string
          
            // Escape special characters in lastSkill
            const escapeRegex = (text) => text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
          
            if (lastSkill.trim()) {
              // Combine fully typed skills and regex for the last skill
              query.$and = [
                ...(skillsArray.length > 0
                  ? [{ skills: { $all: skillsArray } }] // Exact match for fully typed skills if they exist
                  : []),
                { skills: { $regex: `^${escapeRegex(lastSkill)}`, $options: "i" } }, // Partial match for the last skill
              ];
            } else if (skillsArray.length > 0) {
              // Only exact matches if no lastSkill
              query.skills = { $all: skillsArray };
            }
          }
                  
          
          if (securityClearance) query.securityClearance = parseInt(securityClearance, 10);
          if (education) {
            console.log("education: ",education);
            const educationArray = education.split(",").map((e) => e.trim()); // Split and trim education values
            console.log("educationArray: ",educationArray);
            const lastEducation = educationArray.length > 0 ? educationArray.pop() : ""; // Get the last education or empty string
          
            // Escape special characters in lastEducation
            const escapeRegex = (text) => text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
          
            if (lastEducation.trim()) {
              // Combine fully typed education and regex for the last entry
              query.$and = [
                ...(educationArray.length > 0
                  ? [{ education: { $all: educationArray } }] // Exact match for fully typed education if they exist
                  : []),
                { education: { $regex: `^${escapeRegex(lastEducation)}`, $options: "i" } }, // Partial match for the last entry
              ];
            } else if (educationArray.length > 0) {
              // Only exact matches if no lastEducation
              query.education = { $all: educationArray };
            }
          }
          
        // Adjusted workExperience logic to filter jobs requiring at most the provided years of experience
        if (workExperience) {
            const maxExperience = parseInt(workExperience, 10);
            query.workExperience = { $lte: maxExperience }; // Match jobs requiring less than or equal to the provided years
        }

        // Fetch filtered results
        const jobListings = await JobListing.find(query);

        res.status(200).json({
            message: "Job listings fetched successfully.",
            jobListings,
        });
    } catch (error) {
        console.error("Error filtering job listings:", error.message);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// Get Metrics for job listings
const getMetrics = async (req, res) => {
  try {
    const { recruiterId } = req.params;
    const metrics = await getMetricsByRecruiterId(recruiterId);
    res.status(200).json({
      message: "Metrics calculated successfully.",
      metrics,
    });
  } catch (error) {
    console.error("Error calculating metrics:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get specific recruiter job listings.
const getRecruiterListings = async (req, res) => {
    try {
        const recruiterId = req.params;

        // Fetch filtered results
        const jobListings = await JobListing.find(recruiterId);

        res.status(200).json({
            message: "Job listings fetched successfully.",
            jobListings,
        });
    } catch (error) {
        console.error("Error filtering job listings:", error.message);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


module.exports = {
    saveJobListing,
    getAllJobListings,
    getJobListingById,
    updateJobListing,
    deleteJobListing,
    getJobListingsByRecruiterId,
    filterActiveJobListings,
    getMetrics,
    getRecruiterListings
};
