const Interview = require("../models/interviewModel");
const JobSeeker = require("../models/jobSeekerModel");
const Applicant = require("../models/applicantModel");

// Schedule a new interview
// POST /api/interviews
// Private
const scheduleInterview = async (req, res, next) => {
  try {
    const { applicantId, participants, jobListing, scheduledTime, meetingLink } = req.body;

    if (!participants || !Array.isArray(participants) || participants.length < 2 || !scheduledTime) {
      res.status(400);
      return next(new Error("At least two participants and scheduledTime are required"));
    }
    
    const interview = await Interview.create({
      participants,
      jobListing,
      scheduledTime,
      meetingLink,
    });

    // Identify the jobSeekerParticipant (JobSeeker role)
    const jobSeekerParticipant = participants.find((p) => p.role === "JobSeeker");
    const recruiterParticipant = participants.find((p) => p.role !== "JobSeeker");

    if (jobSeekerParticipant && recruiterParticipant) {

      // Add a notification to the jobSeeker
      const jobSeeker = await JobSeeker.findById(jobSeekerParticipant.userId);
      if (!jobSeeker) {
        console.warn("Applicant not found:", jobSeekerParticipant.userId);
      } else {
        const applicant = await Applicant.findById(applicantId);

        // Create the notification
        const newNotification = {
          type: "interview",
          message: `A new interview was scheduled by ${recruiterParticipant.name}`,
          extraData: {
            goToRoute: '/dashboard',
            stateAddition: {
              interviewId: interview._id,
            },
          },
        };

        if (!jobSeeker.notifications) {
          jobSeeker.notifications = [];
        }
        jobSeeker.notifications.push(newNotification);
        await jobSeeker.save();
        console.log("Notification added to jobSeekerParticipant:", jobSeeker.email);

        if (!applicant) {
          console.warn("Applicant not found:", applicantId);
        } else {
          applicant.status = `Interview Scheduled`;
          applicant.interviewId = interview._id;

          await applicant.save();
          console.log("Applicant status updated:", applicant.email);
        }

        // Emit the notification in real-time
        const io = req.app.get("io");
        io.to(jobSeekerParticipant.userId.toString()).emit("newNotification", newNotification);
        console.log("Emitting interview notification to:", jobSeekerParticipant.userId);
      }
    }

    res.status(201).json(interview);
  } catch (error) {
    next(error);
  }
};


// Get an interview by ID
// GET /api/interviews/:id
// Private
const getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      res.status(404);
      return next(new Error("Interview not found"));
    }
    res.json(interview);
  } catch (error) {
    next(error);
  }
};

// Update an interview
// PUT /api/interviews/:id
// Private
const updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      res.status(404);
      return next(new Error("Interview not found"));
    }

    const { scheduledTime, meetingLink, status } = req.body;
    if (scheduledTime) interview.scheduledTime = scheduledTime;
    if (meetingLink) interview.meetingLink = meetingLink;
    if (status) interview.status = status;

    const updatedInterview = await interview.save();
    res.json(updatedInterview);
  } catch (error) {
    next(error);
  }
};

// Delete (or cancel) an interview
// DELETE /api/interviews/:id
// Private
const deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      res.status(404);
      return next(new Error("Interview not found"));
    }
    await interview.remove();
    res.json({ message: "Interview removed" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scheduleInterview,
  getInterviewById,
  updateInterview,
  deleteInterview,
};
