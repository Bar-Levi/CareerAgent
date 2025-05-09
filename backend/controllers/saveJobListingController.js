const JobSeeker = require('../models/jobSeekerModel');

const saveJobListing = async (req, res) => {
  try {
    const { userId, jobId } = req.params;
    const updatedJobSeeker = await JobSeeker.findByIdAndUpdate(
      userId, 
      { $addToSet: { savedJobListings: jobId } },
      { new: true } // Return the updated document
    );
    
    if (!updatedJobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json({ 
      message: 'Job saved successfully',
      savedJobListings: updatedJobSeeker.savedJobListings || []
    });
  } catch (error) {
    console.error('Error saving job:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const unsaveJobListing = async (req, res) => {
  try {
    const { userId, jobId } = req.params;
    const updatedJobSeeker = await JobSeeker.findByIdAndUpdate(
      userId, 
      { $pull: { savedJobListings: jobId } },
      { new: true } // Return the updated document
    );
    
    if (!updatedJobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json({ 
      message: 'Job removed from saved',
      savedJobListings: updatedJobSeeker.savedJobListings || []
    });
  } catch (error) {
    console.error('Error removing saved job:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getSavedJobListings = async (req, res) => {
  try {
    const { userId } = req.params;
    const jobSeeker = await JobSeeker.findById(userId);
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json({ 
      savedJobListings: jobSeeker.savedJobListings || [] 
    });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getSavedJobListingsByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const jobSeeker = await JobSeeker.findOne({ email });
    
    if (!jobSeeker) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json({ 
      savedJobListings: jobSeeker.savedJobListings || [] 
    });
  } catch (error) {
    console.error('Error fetching saved jobs by email:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { saveJobListing, unsaveJobListing, getSavedJobListings, getSavedJobListingsByEmail };
