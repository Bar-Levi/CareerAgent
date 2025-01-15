const Applicant = require('../models/applicantModel');

// Create a new applicant
exports.createApplicant = async (req, res) => {
    try {
        const applicant = new Applicant(req.body);
        await applicant.save();
        res.status(201).json({ message: 'Applicant created successfully.', applicant });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all applicants
exports.getAllApplicants = async (req, res) => {
    try {
        const applicants = await Applicant.find()
            .populate('job_id', 'title')
            .populate('recruiter_id', 'name email')
            .populate('job_seeker_id', 'name email');
        res.status(200).json(applicants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single applicant by ID
exports.getApplicantById = async (req, res) => {
    try {
        const applicant = await Applicant.findById(req.params.id)
            .populate('job_id', 'title')
            .populate('recruiter_id', 'name email')
            .populate('job_seeker_id', 'name email');
        if (!applicant) return res.status(404).json({ message: 'Applicant not found.' });
        res.status(200).json(applicant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an applicant
exports.updateApplicant = async (req, res) => {
    try {
        const applicant = await Applicant.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!applicant) return res.status(404).json({ message: 'Applicant not found.' });
        res.status(200).json({ message: 'Applicant updated successfully.', applicant });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete an applicant
exports.deleteApplicant = async (req, res) => {
    try {
        const applicant = await Applicant.findByIdAndDelete(req.params.id);
        if (!applicant) return res.status(404).json({ message: 'Applicant not found.' });
        res.status(200).json({ message: 'Applicant deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
