export const parseJobDescription = (description = "") => {
  /* 
    Revised Regex explanation:
    - (.*)                   => Capture everything (including newlines) before the footer block.
                                This will be our main description.
    - company:\s*([^,]+),   => After the literal "company:" (followed by optional spaces),
                                capture one or more characters that are not a comma. This is our company.
    - \s*company size:\s*([^,]+),  => After a comma and optional spaces, match "company size:" 
                                and capture the non-comma text for company size.
    - \s*company website:\s*(.*)$  => Finally, after a comma and optional spaces, match "company website:" 
                                and capture everything until the end (company website).
    
    We use the 'i' flag for case-insensitive matching.
  */
  const regex = /(.*)company:\s*([^,]+),\s*company size:\s*([^,]+),\s*company website:\s*(.*)$/is;
  const match = description.match(regex);
  
  if (!match) {
    // If it doesn’t match, return the entire description as a paragraph
    return <p>{description}</p>;
  }
  
  // Group 1: Everything before the footer block
  const descriptionMain = match[1].trim();

  return (
    <p>{descriptionMain}</p>
  );
};
