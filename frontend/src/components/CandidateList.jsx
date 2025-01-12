import React from "react";
import { motion } from "framer-motion";

const CandidateCard = ({ candidate, index }) => {
    if (!candidate || !candidate.analyzed_cv_content) {
        return (
            <div className="text-gray-500 text-center">
                <p>Invalid candidate data.</p>
            </div>
        );
    }

    const {
        job_role = [],
        security_clearance = "None",
        education = [],
        work_experience = [],
        skills = [],
        languages = [],
    } = candidate.analyzed_cv_content;

    const titleStyle =
        "w-1/2 text-xl align-center font-extrabold text-black mt-5 border-b-2 border-r-2 border-black-700 flex items-center h-fit shadow-[2px_1px_0px_rgba(0,0,0,0.5)]";
    const dataStyle = "text-black font-bold";
    const gradientStyle = {
        background: "linear-gradient(179deg, #999999, white, white, white, white, white, white, white, #cccccc, #999999)",
    };

    return (
        <motion.div
            key={index}
            className="candidate-card shadow-lg rounded-lg p-6 mb-6 border border-gray-200 hover:shadow-xl transition-shadow"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          {/* Title */}
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
                User Overview
            </h1>

            {/* Job Roles */}
            <div className="mb-4">
                <span className={titleStyle} style={gradientStyle}>
                    Job Roles
                </span>
                <p className="text-lg text-gray-600">
                    {job_role.length > 0 ? job_role.join(", ") : "None"}
                </p>
            </div>

            {/* Security Clearance */}
            <div className="mb-4">
                <span className={titleStyle} style={gradientStyle}>
                    Security Clearance
                </span>
                <p className="text-lg text-gray-600">{security_clearance || "None"}</p>
            </div>

            {/* Education */}
            <div className="education mb-6">
                <span className={titleStyle} style={gradientStyle}>
                    Education
                </span>
                {education.length === 0 ? (
                    <p className="text-lg text-gray-600">None</p>
                ) : (
                    education.map((edu, idx) => (
                        <p key={idx} className="text-lg text-gray-600 mb-2">
                            <span className={dataStyle}>{edu.degree || "Unknown Degree"}</span> from{" "}
                            <span className={dataStyle}>{edu.institution || "Unknown Institution"}</span> (
                            <span className={dataStyle}>{edu.graduation_year || "Ongoing"}</span>)
                        </p>
                    ))
                )}
            </div>

            {/* Work Experience */}
            <div className="work-experience mb-6">
                <span className={titleStyle} style={gradientStyle}>
                    Work Experience
                </span>
                {work_experience.length === 0 ? (
                    <p className="text-lg text-gray-600">None</p>
                ) : (
                    work_experience.map((work, idx) => (
                        <p key={idx} className="text-lg text-gray-600 mb-2">
                            <span className={dataStyle}>{work.job_title || "Unrecognized Role"}</span> at{" "}
                            <span className={dataStyle}>{work.company || "Unknown Company"}</span> (
                            <span className={dataStyle}>{work.start_year || "Unknown Start Year"}</span> -{" "}
                            <span className={dataStyle}>{work.end_year || "Present"}</span>)
                        </p>
                    ))
                )}
            </div>

            {/* Languages */}
            <div className="skills mb-6">
                <span className={titleStyle} style={gradientStyle}>
                    Languages
                </span>
                {languages.length === 0 ? (
                    <p className="text-lg text-gray-600">None</p>
                ) : (
                    <ul className="text-lg text-gray-600 mb-2">
                        {languages.map((lang, idx) => (
                            <li key={idx}>
                                <span className={dataStyle}>{lang.language || "Unknown Language"}</span> -{" "}
                                {lang.proficiency || "Unknown Proficiency"}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Skills */}
            <div className="skills mb-6">
                <span className={titleStyle} style={gradientStyle}>
                    Skills
                </span>
                {skills.length === 0 ? (
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
        <div className="candidate-list-container">
            {/* Candidate List */}
            <div className="flex justify-center items-center">
                <div className="w-1/2">
                    {candidates.map((candidate, index) => (
                        <CandidateCard key={index} candidate={candidate} index={index} />
                    ))}
                </div>
            </div>

        </div>
    );
};

export default CandidateList;

