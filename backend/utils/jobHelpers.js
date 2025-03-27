const JobListing = require('../models/jobListingModel');
const Applicant = require('../models/applicantModel');
const Conversation = require('../models/conversationModel');
const { sendJobNotificationEmail } = require('./emailService');

async function removeJobAndNotify(jobId, type) {
  const job = await JobListing.findById(jobId);
  if (!job) throw new Error('Job listing not found');

  // Delete job if type is 'remove'
  type === "remove" ? 
  await JobListing.findByIdAndDelete(jobId)
  :
  job.status = "Closed";


  // Fetch & delete applicants
  const applicants = await Applicant.find({ jobId });
  await Applicant.deleteMany({ jobId });

  // Unlink conversations
  await Conversation.updateMany({ jobListingId: jobId }, { jobListingId: null });

  // Notify subscribed applicants
  const toNotify = applicants.filter(a => a.isSubscribed);
  await Promise.allSettled(
    toNotify.map(a => sendJobNotificationEmail(a.email, job, 'jobListingDeleted'))
  );

  return job;
}

module.exports = { removeJobAndNotify };
