export const parseJobDescription = (desc = "") => {
  // Regex groups:
  // (.*)     => all text before `company:`
  // (.*)     => text after `company:` until `company size:`
  // (.*)     => text after `company size:` until `company website:`
  // (.*)     => text after `company website:` to the end
  const regex = /(.*)company:\s*(.*)company size:\s*(.*)company website:\s*(.*)/i;
  const match = desc.match(regex);
  
  if (!match) {
    // If it doesn’t match this pattern, just return the entire string
    return <p>{desc}</p>;
  }

  const descriptionMain = match[1].trim();
  const company = match[2].replace(/,\s*$/, "").trim(); // remove trailing comma
  const companySize = match[3].replace(/,\s*$/, "").trim();

  // If the website portion is empty, default to "Not provided"
  const rawWebsite = match[4].replace(/,\s*$/, "").trim();
  const companyWebsite = rawWebsite ? rawWebsite : "Not provided";

  return (
    <>
      <p>{descriptionMain}</p>
      <p>
        <strong>Company:</strong> {company}
      </p>
      <p>
        <strong>Company Size:</strong> {companySize}
      </p>
      <p>
        <strong>Company Website:</strong> {companyWebsite}
      </p>
    </>
  );
};
