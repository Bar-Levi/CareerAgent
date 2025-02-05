const JobListing = require("../models/jobListingModel");
const { getMetricsByRecruiterId } = require("../utils/metricsUtils");


// Controller to handle saving a new job listing
const saveJobListing = async (req, res) => {
    console.log("Req.BODY: " + req.body);
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
        } = req.body;

        // Validate required fields
        if (!jobRole || !location || !company || !experienceLevel || !jobType || !remote || !description) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // Create a new job listing document
        const newJobListing = new JobListing({
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
        });

        // Save the job listing to the database
        const savedJobListing = await newJobListing.save();

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
        console.error("Error fetching job listings:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Get a single job listing by ID
const getJobListingById = async (req, res) => {
    try {
        const { id } = req.params;
        const jobListing = await JobListing.findById(id);

        if (!jobListing) {
            return res.status(404).json({ message: "Job listing not found." });
        }

        res.status(200).json({
            message: "Job listing fetched successfully.",
            jobListing,
        });
    } catch (error) {
        console.error("Error fetching job listing:", error.message);
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

        console.log(`[INFO] Fetching job listings for recruiter ID: ${recruiterId}`);

        // Fetch job listings from the database
        const jobListings = await JobListing.find({ recruiterId });

        if (!jobListings || jobListings.length === 0) {
            console.warn(`[WARN] No job listings found for recruiter ID: ${recruiterId}`);
            return res.status(404).json({ message: "No job listings found for this recruiter." });
        }

        console.log(`[INFO] ${jobListings.length} job listing(s) found for recruiter ID: ${recruiterId}`);

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

        console.log("updateJobListing", updatedData);

        const updatedJobListing = await JobListing.findByIdAndUpdate(id, updatedData, {
            new: true, // Return the updated document
            runValidators: true, // Run schema validators on the updated data
        });

        if (!updatedJobListing) {
            return res.status(404).json({ message: "Job listing not found." });
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

// Delete a job listing by ID
const deleteJobListing = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedJobListing = await JobListing.findByIdAndDelete(id);

        if (!deletedJobListing) {
            return res.status(404).json({ message: "Job listing not found." });
        }

        res.status(200).json({
            message: "Job listing deleted successfully.",
            jobListing: deletedJobListing,
        });
    } catch (error) {
        console.error("Error deleting job listing:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
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
        if (remote) query.remote = remote === 'true'; // Convert to boolean
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
                  
          
        if (securityClearance) query.securityClearance = { $gte: parseInt(securityClearance, 10) };
        if (education) {
            const educationArray = education.split(",").map((e) => e.trim()); // Split and trim education values
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
