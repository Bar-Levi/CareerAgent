// Helper function to normalize job titles
function normalizeText(text) {
  if (!text) return "";
  return text
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9\s]/g, "") // Remove special characters
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim(); // Remove leading/trailing spaces
}


function calculateJobMatch(userData, jobListing) {
  let counter = 0; // Initialize counter for matching years of experience

  userData.work_experience.forEach((experience) => {
    // Normalize the job titles
    const normalizedUserJobTitle = normalizeText(experience.job_title);
    console.log('Normailzed :', normalizedUserJobTitle)
    const normalizedJobListingRole = normalizeText(jobListing.jobRole);
    console.log('Normailzed :', normalizedJobListingRole)


    // Tokenize and match based on subset of tokens
    const userTokens = new Set(normalizedUserJobTitle.split(" "));
    const listingTokens = new Set(normalizedJobListingRole.split(" "));
    const isMatch = [...userTokens].every((token) => listingTokens.has(token)) || [...listingTokens].every((token) => userTokens.has(token))

    // If the job_title matches the jobRole
    if (isMatch) {
      const startYear = experience.start_year;
      const endYear = experience.end_year || new Date().getFullYear(); // Use current year if end_year is null
      const yearsOfExperience = endYear - startYear;
      counter += yearsOfExperience;

      console.log(
        `Matched user job title '${experience.job_title}' with job listing role '${jobListing.jobRole}'. ` +
        `Duration: ${startYear}-${endYear} (${yearsOfExperience} years). Current total: ${counter} years.`
      );
    }
  });

  // Check if the total experience meets or exceeds the required work experience
  if (counter >= jobListing.workExperience) {
    console.log(
      `Total matched experience (${counter} years) meets or exceeds job requirement (${jobListing.workExperience} years). Added 30 points.`
    );
    return 30;
  } else {
    console.log(
      `Total matched experience (${counter} years) is less than job requirement (${jobListing.workExperience} years). No points added.`
    );
    return 0;
  }
}


export default calculateJobMatch;
