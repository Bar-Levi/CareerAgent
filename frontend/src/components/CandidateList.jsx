import React from "react";
import { motion } from "framer-motion"; // Ensure framer-motion is installed

const CandidateCard = ({ candidate, index }) => {
    if (!candidate || candidate.candidate) {
        return (
            <div className="text-gray-500 text-center">
                <p>Invalid candidate data.</p>
            </div>
        );
    }
    const {
        fullName,
        email,
        phone,
        security_clearance,
        linkedin_link,
        github_link,
        job_role,
        education,
        work_experience,
        languages,
        skills,
    } = candidate.analyzed_cv_content;

    console.log(fullName,
      email,
      phone,
      security_clearance,
      linkedin_link,
      github_link,
      job_role,
      education,
      work_experience,
      languages,
      skills);

    const titleStyle =
        "w-full text-xl font-extrabold text-black mt-5 border-b-2 border-r-2 border-black-700 flex items-center h-fit shadow-[2px_1px_0px_rgba(0,0,0,0.5)]";
    const dataStyle = "text-black font-bold";
    const gradientStyle = {
        background: "linear-gradient(177deg, white, white, white, lightgray)",
    };

    return (
        <motion.div
            key={index}
            className="candidate-card shadow-lg rounded-lg p-6 mb-6 border border-gray-200 hover:shadow-xl transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
                <span className="font-bold">{fullName || "N/A"}</span>
            </h2>
            <div className="border-b border-gray-200 pb-4 mb-4">
                <p className="text-lg text-gray-600 mb-2">
                    <span className="font-bold">Email:</span> {email || "N/A"}
                </p>
                <p className="text-lg text-gray-600 mb-2">
                    <span className="font-bold">Phone:</span> {phone || "N/A"}
                </p>
                <p className="text-lg text-gray-600 mb-2">
                    <span className="font-bold">Security Clearance:</span> {security_clearance || "None"}
                </p>
                {linkedin_link && (
                    <p className="text-lg text-gray-600 mb-2">
                        <span className="font-bold">LinkedIn:</span>{" "}
                        <a
                            href={linkedin_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                        >
                            {linkedin_link}
                        </a>
                    </p>
                )}
                {github_link && (
                    <p className="text-lg text-gray-600">
                        <span className="font-bold">GitHub:</span>{" "}
                        <a
                            href={github_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                        >
                            {github_link}
                        </a>
                    </p>
                )}
            </div>
            <div className="mb-4">
                <p className="text-lg text-gray-600 mb-2">
                    <span className="font-bold">Job Roles:</span> {job_role ? job_role.join(", ") : "None"}
                </p>
            </div>
            <div className="education mb-6">
                <span className={titleStyle} style={gradientStyle}>
                    Education
                </span>
                {education?.length === 0 ? (
                    <p className="text-lg text-gray-600">None</p>
                ) : (
                    education.map((edu, idx) => (
                        <p key={idx} className="text-lg text-gray-600 mb-2">
                            <span className={dataStyle}>{edu.degree}</span> from{" "}
                            <span className={dataStyle}>{edu.institution}</span> (
                            <span className={dataStyle}>{edu.graduation_year}</span>)
                        </p>
                    ))
                )}
            </div>
            <div className="work-experience mb-6">
                <span className={titleStyle} style={gradientStyle}>
                    Work Experience
                </span>
                {work_experience?.length === 0 ? (
                    <p className="text-lg text-gray-600">None</p>
                ) : (
                    work_experience.map((work, idx) => (
                        <p key={idx} className="text-lg text-gray-600 mb-2">
                            <span className={dataStyle}>{work.job_role}</span> at{" "}
                            <span className={dataStyle}>{work.company}</span> (
                            <span className={dataStyle}>{work.start_year}</span> -{" "}
                            <span className={dataStyle}>{work.end_year}</span>)
                        </p>
                    ))
                )}
            </div>
            <div className="skills mb-6">
                <span className={titleStyle} style={gradientStyle}>
                    Languages:
                </span>
                {languages?.length === 0 ? (
                    <p className="text-lg text-gray-600">None</p>
                ) : (
                    <ul className="text-lg text-gray-600 mb-2">
                        {languages.map((lang, index) => (
                            <li key={index}>
                                <span className={dataStyle}>{lang.language}</span> - {lang.proficiency}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="skills mb-6">
                <span className={titleStyle} style={gradientStyle}>
                    Skills
                </span>
                {skills?.length === 0 ? (
                    <p className="text-lg text-gray-600">None</p>
                ) : (
                    <p className="text-lg text-gray-600 mb-2">
                        <span className={dataStyle}>{skills.join(", ")}</span>
                    </p>
                )}
            </div>
        </motion.div>
    );
};

const CandidateList = ({ candidates }) => {
  console.log("Candidates", candidates);
    if (!candidates || candidates.length === 0) {
        return (
            <div className="text-gray-500 text-center">
                <p>No candidates to display.</p>
            </div>
        );
    }

    return (
        <div className="candidate-list grid gap-8 md:grid-cols-2 lg:grid-cols-3 p-8">
            {candidates.map((candidate, index) => (
                <CandidateCard key={index} candidate={candidate} index={index} />
            ))}
        </div>
    );
};

export default CandidateList;
