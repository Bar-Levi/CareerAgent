const JobListing = require("../models/jobListingModel");

// Controller to handle saving a new job listing
const saveJobListing = async (req, res) => {
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

// Update a job listing by ID
const updateJobListing = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const updatedJobListing = await JobListing.findByIdAndUpdate(id, updatedData, {
            new: true, // Return the updated document
            runValidators: true, // Run schema validators on the updated data
        });

        if (!updatedJobListing) {
            return res.status(404).json({ message: "Job listing not found." });
        }

        res.status(200).json({
            message: "Job listing updated successfully.",
            jobListing: updatedJobListing,
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

module.exports = {
    saveJobListing,
    getAllJobListings,
    getJobListingById,
    updateJobListing,
    deleteJobListing,
};
