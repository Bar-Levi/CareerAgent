const JobSeeker = require('../models/jobSeekerModel');

const saveJobListing = async (req, res) => {
  try {
    const { userId, jobId } = req.params;
    await JobSeeker.findByIdAndUpdate(userId, { $addToSet: { savedJobListings: jobId } });
    return res.status(200).json({ message: 'Job saved successfully' });
  } catch (error) {
    console.error('Error saving job:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const unsaveJobListing = async (req, res) => {
  try {
    const { userId, jobId } = req.params;
    await JobSeeker.findByIdAndUpdate(userId, { $pull: { savedJobListings: jobId } });
    return res.status(200).json({ message: 'Job removed from saved' });
  } catch (error) {
    console.error('Error removing saved job:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { saveJobListing, unsaveJobListing };
