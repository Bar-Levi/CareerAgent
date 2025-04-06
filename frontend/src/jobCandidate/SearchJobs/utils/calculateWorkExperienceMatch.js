// Helper function to normalize job titles
function normalizeText(text) {
  if (!text) return "";
  return text
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9\s]/g, "") // Remove special characters
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim(); // Remove leading/trailing spaces
}


function calculateWorkExperienceMatch(userData, jobListing, matchedWorkExperiencePoints) {
  let counter = 0; // Initialize counter for matching years of experience
  const matchedJobs = [];

  const normalizedJobListingRole = normalizeText(jobListing.jobRole);
  const listingTokens = new Set(normalizedJobListingRole.split(" "));

  if (!userData.work_experience || !Array.isArray(userData.work_experience)) {
    return { matchedJobs: [], experienceScore: 0 };
  }

  userData.work_experience.forEach((experience) => {
    // Normalize the job titles
    const normalizedUserJobTitle = normalizeText(experience.job_title);
  
    // Tokenize and match based on subset of tokens
    const userTokens = new Set(normalizedUserJobTitle.split(" "));

    
    const isMatch = [...userTokens].every((token) => listingTokens.has(token)) || [...listingTokens].every((token) => userTokens.has(token))

    // If the job_title matches the jobRole
    if (isMatch) {
      const startYear = experience.start_year;
      const endYear = experience.end_year || new Date().getFullYear(); // Use current year if end_year is null
      const yearsOfExperience = endYear - startYear;
      counter += yearsOfExperience;
      matchedJobs.push(jobListing.jobRole + " - " + yearsOfExperience + " years of experience");
    }
  });

  // Check if the total experience meets or exceeds the required work experience
  if (counter >= jobListing.workExperience) {
    return {
      matchedJobs,
      experienceScore: matchedWorkExperiencePoints,
    };
  } else {
    return { matchedJobs: [], experienceScore: 0 };
  }
}


export default calculateWorkExperienceMatch;
