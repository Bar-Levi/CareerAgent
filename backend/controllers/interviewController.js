const Interview = require("../models/interviewModel");

// Schedule a new interview
// POST /api/interviews
// Private
const scheduleInterview = async (req, res, next) => {
  try {
    const { recruiter, jobSeeker, jobListing, scheduledTime, meetingLink } = req.body;

    if (!recruiter || !jobSeeker || !scheduledTime) {
      res.status(400);
      return next(new Error("Recruiter, jobSeeker, and scheduledTime are required"));
    }

    // Optionally, add validation to ensure the time slot is available

    const interview = await Interview.create({
      recruiter,
      jobSeeker,
      jobListing,
      scheduledTime,
      meetingLink,
    });

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
