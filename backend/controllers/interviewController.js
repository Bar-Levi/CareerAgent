const Interview = require("../models/interviewModel");
const JobSeeker = require("../models/jobSeekerModel");
const Applicant = require("../models/applicantModel");
const Recruiter = require("../models/recruiterModel");
const { sendInterviewScheduledEmailToJobSeeker, sendInterviewScheduledEmailToRecruiter } = require("../utils/emailService");

// Schedule a new interview
// POST /api/interviews
// Private
const scheduleInterview = async (req, res, next) => {
  try {
    const { applicantId, participants, jobListing, scheduledTime, meetingLink } = req.body;

    if (!participants || !Array.isArray(participants) || participants.length < 2 || !scheduledTime) {
      return res.status(400).json({ message: "At least two participants and scheduledTime are required" });
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
      const recruiter = await Recruiter.findById(recruiterParticipant.userId);

      if (!jobSeeker) {
        console.warn("JobSeeker not found:", jobSeekerParticipant.userId);
      } else if (!recruiter) {
        console.warn("Recruiter not found:", recruiterParticipant.userId);
      } else {
        const applicant = await Applicant.findById(applicantId);

        // Create the notification
        const newNotification = {
          type: "interview",
          message: `A new interview for ${jobListing.jobRole} at ${jobListing.company} was scheduled by ${recruiter.fullName} on ${new Date(scheduledTime).toLocaleDateString()}.`,
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
        
        // Increment the number of interviews scheduled
        jobSeeker.numOfInterviewsScheduled = (jobSeeker.numOfInterviewsScheduled || 0) + 1;
        
        await jobSeeker.save();
        console.log("Notification added to jobSeekerParticipant:", jobSeeker.email);

        // Validate email addresses before sending
        if (!jobSeeker.email) {
          console.warn("Job seeker email not found:", jobSeeker._id);
        } else if (!recruiter.email) {
          console.warn("Recruiter email not found:", recruiter._id);
        } else {
          try {
            // Check if job seeker and recruiter have the same email
            if (jobSeeker.email === recruiter.email) {
              // If they have the same email, send only one email with combined content
              await sendInterviewScheduledEmailToJobSeeker(
                jobSeeker.email,
                jobSeeker.fullName,
                jobListing,
                recruiter.fullName,
                scheduledTime,
                meetingLink
              );
              console.log("Combined interview notification email sent to:", jobSeeker.email);
            } else {
              // Send separate emails if emails are different
              await sendInterviewScheduledEmailToJobSeeker(
                jobSeeker.email,
                jobSeeker.fullName,
                jobListing,
                recruiter.fullName,
                scheduledTime,
                meetingLink
              );
              console.log("Interview notification email sent to job seeker:", jobSeeker.email);

              await sendInterviewScheduledEmailToRecruiter(
                recruiter.email,
                recruiter.fullName,
                jobSeeker.fullName,
                jobListing,
                scheduledTime,
                meetingLink
              );
              console.log("Interview notification email sent to recruiter:", recruiter.email);
            }
          } catch (emailError) {
            console.error("Error sending interview notification emails:", emailError);
            // Continue with the rest of the function even if email sending fails
          }
        }

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

    res.status(201).json({
      message: "Interview scheduled successfully",
      interview
    });
  } catch (error) {
    console.error("Error scheduling interview:", error);
    res.status(500).json({ message: "Failed to schedule interview", error: error.message });
  }
};


// Get an interview by ID
// GET /api/interviews/:id
// Private
const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    res.status(200).json(interview);
  } catch (error) {
    console.error("Error fetching interview:", error);
    res.status(500).json({ message: "Failed to fetch interview", error: error.message });
  }
};

// Update an interview
// PUT /api/interviews/:id
// Private
const updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const { scheduledTime, meetingLink, status } = req.body;
    if (scheduledTime) interview.scheduledTime = scheduledTime;
    if (meetingLink) interview.meetingLink = meetingLink;
    if (status) interview.status = status;

    const updatedInterview = await interview.save();
    res.status(200).json(updatedInterview);
  } catch (error) {
    console.error("Error updating interview:", error);
    res.status(500).json({ message: "Failed to update interview", error: error.message });
  }
};

// Delete (or cancel) an interview
// DELETE /api/interviews/:id
// Private
const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    res.status(200).json({ message: "Interview deleted successfully" });
  } catch (error) {
    console.error("Error deleting interview:", error);
    res.status(500).json({ message: "Failed to delete interview", error: error.message });
  }
};

module.exports = {
  scheduleInterview,
  getInterviewById,
  updateInterview,
  deleteInterview,
};
