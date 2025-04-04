const Applicant = require('../models/applicantModel');
const Recruiter = require('../models/recruiterModel');
const JobListing = require('../models/jobListingModel');
const Interview = require('../models/interviewModel');
const JobSeeker = require('../models/jobSeekerModel');
const { sendRejectionEmail, sendHiredEmail, sendApplicationInReviewEmail } = require('../utils/emailService');



// Create a new applicant
const createApplicant = async (req, res) => {
    try {
        console.log("req: " + JSON.stringify(req.body));

        // Make sure that joblisting's status is active
        const jobListing = await JobListing.findById(req.body.jobId);
        if (jobListing.status !== 'Active') {
            return res.status(400).json({ message: 'Job listing is not active anymore - please refresh the page.' });
        }

        // Check if the user has already applied for this job
        const existingApplicant = await Applicant.findOne({
            jobSeekerId: req.body.jobSeekerId,
            jobId: req.body.jobId,
        });

        if (existingApplicant) {
            return res.status(400).json({ message: 'User has already applied for this job.' });
        }
        // Check if the user has a valid CV
        if (!req.body.cv || req.body.cv === "") {
            return res.status(400).json({ message: 'CV is required.' });
        }

        const newApplicant = new Applicant(req.body);
        const savedApplicant = await newApplicant.save();

        // Increment the numOfApplicationsSent counter for the job seeker
        await JobSeeker.findByIdAndUpdate(
            req.body.jobSeekerId,
            { $inc: { numOfApplicationsSent: 1 } }
        );

        res.status(201).json({
            message: 'Applicant created successfully',
            applicant: savedApplicant,
        });
        const reciever = await Recruiter.findById(req.body.recruiterId);
        // Create and push a new notification to the receiver
        const newNotification = {
            type: "apply",
            message: `${req.body.name} has applied for the ${req.body.jobTitle} position.`,
            extraData: {
            goToRoute: '/dashboard',
            stateAddition: {
                viewMode: 'applications',
                jobListing,
                candidate: {
                    profilePic: savedApplicant.profilePic,
                    name: savedApplicant.name,
                    senderId: savedApplicant.jobSeekerId,
                  }, 
            },
            },
        };
        if (!reciever.notifications) {
            reciever.notifications = [];
        }
        reciever.notifications.push(newNotification);
        await reciever.save();
        console.log("Notification added to reciever:", reciever.email);
        // Retrieve the Socket.IO instance from the app and emit the notification event.
        const io = req.app.get("io");

        // Assuming the receiver's socket(s) join a room identified by their user ID (as a string)
        io.to(reciever._id.toString()).emit("newNotification", newNotification);
        console.log("Emitting notification to: " + reciever._id);
  
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
        const applicants = await Applicant.find({ recruiterId }).hint({ recruiterId: 1 })
            .populate('interviewId jobId');

        if (!applicants || applicants.length === 0) {
            return res.status(404).json({ message: 'No applicants found for this recruiter' });
        }
        
        res.status(200).json({
            message: 'Applicants fetched successfully',
            applications: applicants,
        });
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ message: 'Failed to fetch applicants', error: error.message });
    }
};

const getJobSeekerApplicants = async (req, res) => {
    const { jobSeekerId } = req.params;
    try {
        const applicants = await Applicant.find({ jobSeekerId }).hint({ jobSeekerId: 1 })
        .populate('interviewId').populate('recruiterId').populate('jobId');
        if (!applicants || applicants.length === 0) {
            return res.status(404).json({ message: 'No applicants found for this job seeker' });
        }
        
        res.status(200).json({
            message: 'Applicants fetched successfully',
            applicants,
        });
    } catch (error) {
        console.error('Error fetching job seeker applicants:', error);
        res.status(500).json({ message: 'Failed to fetch applicants', error: error.message });
    }
};

// Update a specific applicant by ID
const updateApplicant = async (req, res) => {
    const { id } = req.params;
    let { status, interviewId } = req.body;
    let otherApplicants = [];

    try {
        const updatedApplicant = await Applicant.findByIdAndUpdate(
            id, 
            { status, interviewId: status === "Interview Done" ? null : interviewId}, 
            { new: true, runValidators: true }
        ).populate('jobId');

        if (!updatedApplicant) {
            return res.status(404).json({ message: 'Applicant not found' });
        }

        
        if (status === "Interview Done") {
            await Interview.findByIdAndDelete(interviewId);
        } else if (status === "Rejected") {
            await Applicant.findByIdAndUpdate(id, { interviewId: null });
            
            await Interview.findByIdAndDelete(interviewId);
        } else if (status === "Hired") {
            otherApplicants = await Applicant.find({
                jobId: updatedApplicant.jobId,
                _id: { $ne: id },
                status: { $ne: 'Rejected' }
            }).populate('jobId');
        

            for (const applicant of otherApplicants) {
                await Applicant.findByIdAndUpdate(applicant._id, { status: 'Rejected' });
            }
        }
        res.status(200).json({
            message: 'Applicant updated successfully',
            applicant: updatedApplicant,
            otherApplicants,
        });
    } catch (error) {
        console.error('Error updating applicant:', error);
        res.status(500).json({ message: 'Failed to update applicant', error: error.message });
    }
};

// A function to handle status-specific email notifications.
const handleEmailUpdates = async (req, res) => {
    const { status, otherApplicants, applicant } = req.body;

    try {
        if (status === "In Review") {
            await sendApplicationInReviewEmail(applicant.email, applicant.name, applicant.jobId);
            // Increment the number of reviewed applications for the job seeker
            await JobSeeker.findByIdAndUpdate(
                applicant.jobSeekerId,
                { $inc: { numOfReviewedApplications: 1 } }
            );
        } else if (status === "Rejected") {
            await sendRejectionEmail(applicant.email, applicant.name, applicant.jobId);
        } else if (status === "Hired") {
            if (!applicant) {
                return res.status(404).json({ message: 'Applicant not found' });
            }
            await sendHiredEmail(applicant.email, applicant.name, applicant.jobId);
            
            if (otherApplicants) {
                for (const applicant of otherApplicants) {
                    await sendRejectionEmail(applicant.email, applicant.name, applicant.jobId);
                }
            }
        }

        res.status(200).json({ message: 'Status logic handled successfully' });
    } catch (error) {
        console.error('Error handling status logic:', error);
        res.status(500).json({ message: 'Failed to handle status logic', error: error.message });
    }
};

// Delete a specific applicant by ID
const deleteApplicant = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedApplicant = await Applicant.findByIdAndDelete(id).populate('jobId');
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
    getRecruiterApplicants,
    getJobSeekerApplicants,
    handleEmailUpdates
};
