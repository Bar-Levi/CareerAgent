const Applicant = require('../models/applicantModel');

// Create a new applicant
const createApplicant = async (req, res) => {
    try {
        const newApplicant = new Applicant(req.body);
        const savedApplicant = await newApplicant.save();
        res.status(201).json({
            message: 'Applicant created successfully',
            applicant: savedApplicant,
        });
    } catch (error) {
        console.error('Error creating applicant:', error);
        res.status(500).json({ message: 'Failed to create applicant', error: error.message });
    }
};

// Get all applicants
const getApplicants = async (req, res) => {
    try {
        const applicants = await Applicant.find().populate('job_id recruiter_id job_seeker_id');
        res.status(200).json({
            message: 'Applicants fetched successfully',
            applicants,
        });
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ message: 'Failed to fetch applicants', error: error.message });
    }
};

// Get a specific applicant by ID
const getApplicantById = async (req, res) => {
    const { id } = req.params;
    try {
        const applicant = await Applicant.findById(id).populate('job_id recruiter_id job_seeker_id');
        if (!applicant) {
            return res.status(404).json({ message: 'Applicant not found' });
        }
        res.status(200).json({
            message: 'Applicant fetched successfully',
            applicant,
        });
    } catch (error) {
        console.error('Error fetching applicant:', error);
        res.status(500).json({ message: 'Failed to fetch applicant', error: error.message });
    }
};

// Get all applicants for a specific recruiter by recruiterId
const getRecruiterApplicants = async (req, res) => {
    const { recruiterId } = req.params;
    try {
        // Find applicants where the recruiterId matches
        const applicants = await Applicant.find({ recruiterId: recruiterId })
            .populate('recruiterId');
        console.log("Recruiter Applicants: ", applicants);

        if (!applicants || applicants.length === 0) {
            return res.status(404).json({ message: 'No applicants found for this recruiter' });
        }

        const applications = applicants.map((applicant, index) => {
            return {
                id: applicant._id, // Use index for sequential IDs
                candidate: applicant.name, // Map 'name' to 'candidate'
                position: applicant.jobTitle || "Unknown Position", // Default value for position
                date: applicant.applicationDate.toISOString().split("T")[0] || "Unknown Date", // Default to today's date if not present
                status: applicant.status || "Pending", // Default status if not provided
            };
        });
        
        res.status(200).json({
            message: 'Applicants fetched successfully',
            applications,
        });
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ message: 'Failed to fetch applicants', error: error.message });
    }
};


// Update a specific applicant by ID
const updateApplicant = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedApplicant = await Applicant.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedApplicant) {
            return res.status(404).json({ message: 'Applicant not found' });
        }
        res.status(200).json({
            message: 'Applicant updated successfully',
            applicant: updatedApplicant,
        });
    } catch (error) {
        console.error('Error updating applicant:', error);
        res.status(500).json({ message: 'Failed to update applicant', error: error.message });
    }
};

// Delete a specific applicant by ID
const deleteApplicant = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedApplicant = await Applicant.findByIdAndDelete(id);
        if (!deletedApplicant) {
            return res.status(404).json({ message: 'Applicant not found' });
        }
        res.status(200).json({
            message: 'Applicant deleted successfully',
            applicant: deletedApplicant,
        });
    } catch (error) {
        console.error('Error deleting applicant:', error);
        res.status(500).json({ message: 'Failed to delete applicant', error: error.message });
    }
};

module.exports = {
    createApplicant,
    getApplicants,
    getApplicantById,
    updateApplicant,
    deleteApplicant,
    getRecruiterApplicants
};
