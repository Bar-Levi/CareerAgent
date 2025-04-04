// File: SearchFilters.jsx

import React, { useState } from "react";

const SearchFilters = ({ filters, setFilters, clearFilters, educationListedOptions }) => {
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [filteredEducation, setFilteredEducation] = useState([]);
  const [showEducationDropdown, setShowEducationDropdown] = useState(false);


  const jobRoles = [
    "Student",
    "Full Stack Developer",
    "Backend Developer",
    "Frontend Developer",
    "Software Engineer",
    "Software Developer",
    "Lead Software Engineer",
    "Principal Software Engineer",
    "Software Consultant",
    "Web Developer",
    "Frontend Web Developer",
    "Backend Web Developer",
    "Full Stack Web Developer",
    "HTML/CSS Developer",
    "JavaScript Developer",
    "PHP Developer",
    "Ruby Developer",
    "Python Developer",
    "Python Web Developer",
    "ASP.NET Developer",
    "Angular Developer",
    "React Developer",
    "Vue.js Developer",
    "Svelte Developer",
    "Web Accessibility Specialist",
    "Mobile App Developer",
    "iOS Developer",
    "Android Developer",
    "Flutter Developer",
    "React Native Developer",
    "Xamarin Developer",
    "Swift Developer",
    "Kotlin Developer",
    "Objective-C Developer",
    "Mobile Game Developer",
    "Game Developer",
    "Game Designer",
    "Unity Developer",
    "Unreal Engine Developer",
    "Game Engine Programmer",
    "Gameplay Programmer",
    "Graphics Programmer",
    "AI Programmer (Game AI)",
    "Physics Programmer",
    "Level Designer",
    "System Programmer",
    "Embedded Software Engineer",
    "Low-Level Programmer",
    "Kernel Developer",
    "Firmware Developer",
    "Systems Engineer",
    "Device Driver Developer",
    "High-Performance Computing (HPC) Developer",
    "Automation Engineer",
    "Automation Developer",
    "Infrastructure Engineer",
    "Cybersecurity Engineer",
    "Ethical Hacker",
    "Penetration Tester",
    "Application Security Engineer",
    "Cloud Security Specialist",
    "Cryptography Engineer",
    "Vulnerability Assessment Specialist",
    "Malware Analyst",
    "SOC Analyst (Security Operations Center)",
    "Incident Response Specialist",
    "Machine Learning Engineer",
    "AI Engineer",
    "Data Scientist",
    "NLP Engineer (Natural Language Processing)",
    "Computer Vision Engineer",
    "Deep Learning Engineer",
    "Reinforcement Learning Specialist",
    "AI Research Scientist",
    "Speech Recognition Engineer",
    "AI Model Trainer",
    "Data Engineer",
    "Big Data Specialist",
    "Data Analyst",
    "Business Intelligence Developer",
    "Hadoop Developer",
    "Spark Developer",
    "Data Warehouse Specialist",
    "ETL Developer",
    "Predictive Modeler",
    "Data Visualization Specialist",
    "DevOps Engineer",
    "Site Reliability Engineer (SRE)",
    "Kubernetes Specialist",
    "Docker Specialist",
    "Automation Architect",
    "Build Engineer",
    "Continuous Integration Engineer",
    "Infrastructure as Code (IaC) Developer",
    "Cloud Infrastructure Engineer",
    "Network Automation Engineer",
    "Software Architect",
    "Technical Lead",
    "Software Development Manager",
    "CTO (Chief Technology Officer)",
    "Product Manager (Tech)",
    "Scrum Master",
    "Agile Coach",
    "Technical Project Manager",
    "Delivery Manager",
    "Release Manager",
    "Blockchain Developer",
    "Smart Contract Developer",
    "Cryptocurrency Developer",
    "Decentralized Application (DApp) Developer",
    "Tokenomics Specialist",
    "Blockchain Architect",
    "Blockchain Security Specialist",
    "Web3 Developer",
    "NFT Developer",
    "DAO Specialist",
    "QA Engineer",
    "Automation Tester",
    "Manual Tester",
    "Load Tester",
    "Performance Tester",
    "Usability Tester",
    "Mobile App Tester",
    "Test Automation Framework Developer",
    "Penetration Testing Specialist",
    "Security Testing Engineer",
    "UI Developer",
    "UX Developer",
    "Product Designer",
    "Interaction Designer",
    "Accessibility Specialist",
    "UX Writer",
    "User Research Specialist",
    "Design Systems Engineer",
    "UX Engineer",
    "Prototyping Specialist",
    "Cloud Engineer",
    "Cloud Solutions Architect",
    "AWS Developer",
    "Azure Developer",
    "Google Cloud Developer",
    "Multi-Cloud Engineer",
    "Cloud Security Engineer",
    "Serverless Application Developer",
    "Cloud Automation Engineer",
    "Cloud Migration Specialist",
    "Robotics Software Engineer",
    "IoT Developer",
    "AR/VR Developer",
    "Simulation Developer",
    "Geographic Information Systems (GIS) Developer",
    "Wearable Technology Developer",
    "AI Ethics Specialist",
    "Autonomous Vehicle Developer",
    "Quantum Computing Developer",
    "Simulation and Modeling Engineer",
    "CRM Developer",
    "ERP Developer",
    "CMS Developer",
    "E-commerce Developer",
    "Financial Software Developer",
    "Health Tech Software Developer",
    "Education Technology Developer",
    "SaaS Application Developer",
    "BI Tool Developer",
    "Collaboration Tools Developer",
    "Research and Development Engineer",
    "Innovation Engineer",
    "Research Software Engineer",
    "Prototype Developer",
    "Proof of Concept (PoC) Specialist",
    "Computational Scientist",
    "Algorithm Developer",
    "Optimization Specialist",
    "Research Analyst (Software)",
    "Simulation Research Engineer",
    "Network Programmer",
    "Communication Systems Developer",
    "Protocol Developer",
    "IoT Network Developer",
    "Software-Defined Networking (SDN) Engineer",
    "Wireless Network Engineer",
    "Network Security Developer",
    "5G Network Developer",
    "Telecom Software Engineer",
    "Optical Network Developer",
    "Technical Trainer",
    "Software Instructor",
    "Coding Bootcamp Mentor",
    "Technical Content Writer",
    "Software Training Specialist",
    "Curriculum Developer (Tech)",
    "Coding Coach",
    "EdTech Developer",
    "E-learning Platform Developer",
    "Technical Evangelist",
    "Algorithm Developer",
    "Optimization Algorithm Engineer",
    "Cryptographic Algorithm Developer",
    "Signal Processing Developer",
    "Audio/Video Processing Engineer",
    "Image Processing Developer",
    "Video Compression Engineer",
    "Audio Signal Engineer",
    "Data Compression Specialist",
    "Search Algorithm Developer",
    "FinTech Software Engineer",
    "PropTech Developer",
    "LegalTech Developer",
    "HRTech Developer",
    "MarTech Developer",
    "Streaming Platform Developer",
    "Video Game Systems Engineer",
    "Multi-Player Systems Developer",
    "Anti-Cheat Systems Developer",
    "Microservices Developer",
    "Cloud-Native Developer",
    "Edge Computing Developer",
    "Hybrid Cloud Developer",
    "Data Lakes Engineer",
    "High Availability Systems Developer",
    "Distributed Systems Engineer",
    "API Gateway Developer",
    "Backend Performance Engineer",
    "Frontend Performance Engineer",
    "UI Optimization Specialist",
    "Cryptography Researcher",
    "Machine Learning Researcher",
    "Data Engineering Manager",
    "Technical Documentation Specialist",
    "AI Framework Developer",
    "NLP Tools Developer",
    "TensorFlow Developer",
    "PyTorch Developer",
    "MLops Specialist",
    "AutoML Engineer",
    "Secure Coding Specialist",
    "Application Performance Tester",
    "Quality Metrics Specialist",
    "Gaming QA Engineer",
    "Game Balancing Specialist",
    "Gamification Engineer",
    "Simulation QA Engineer",
    "3D Modeling Software Developer",
    "Physics Engine Developer",
    "AR Glasses Developer",
    "Drone Software Developer",
    "Space Systems Engineer",
    "Satellite Software Developer",
    "Rocket Control Systems Developer",
    "Energy Systems Software Engineer",
    "Electric Vehicle Software Engineer",
    "Charging Station Software Developer",
    "Transportation Systems Developer",
    "Traffic Management Software Engineer",
    "Rail Systems Developer",
    "Smart Home Systems Developer",
    "HVAC Software Developer",
    "Building Automation Software Engineer",
    "Embedded IoT Developer",
    "Sensor Systems Developer",
    "Home Security Software Developer",
    "Industrial IoT Developer",
    "Robotics Middleware Developer",
    "Factory Automation Software Engineer",
    "Machine Vision Developer",
    "Cryptocurrency Mining Software Developer",
    "Token Minting Developer",
    "Decentralized Finance (DeFi) Developer",
    "Blockchain Data Analyst",
    "Smart Grid Software Developer",
    "Renewable Energy Software Engineer",
    "Power Grid Systems Developer",
    "GreenTech Software Engineer",
    "Climate Modeling Software Developer",
    "Weather Prediction Systems Developer",
    "E-sports Platform Developer",
    "Game Streaming Engineer",
    "Player Engagement Specialist",
    "Multi-Platform Game Developer",
    "Leaderboard Systems Developer",
    "Virtual Goods Marketplace Developer",
    "Game Economy Engineer",
    "AI NPC (Non-Player Character) Developer",
    "Game Level Scripting Specialist",
    "Game Physics Tester",
    "Web Assembly Developer",
    "Browser Plugin Developer",
    "Video Optimization Engineer",
    "Live Streaming Platform Engineer",
    "Content Delivery Network (CDN) Engineer",
    "API Performance Tester",
    "GraphQL Developer",
    "RESTful API Developer",
    "API Integration Specialist",
    "Serverless Function Developer",
    "Legacy Code Migration Specialist",
    "Parallel Computing Developer",
    "Multi-Threaded Systems Developer",
    "Embedded Linux Developer",
    "Firmware Security Specialist"
  ];

  const skillsList = [
    "React",
    "Vue",
    "Angular",
    "JavaScript",
    "HTML5",
    "CSS3",
    "Responsive Design",
    "Tailwind CSS",
    "Bootstrap",
    "Material-UI",
    "SASS/SCSS",
    "Web Accessibility (ARIA)",
  
    // UX/UI Design
    "UX/UI Principles",
    "Wireframing",
    "Prototyping",
    "Adobe XD",
    "Figma",
    "Sketch",
    "InVision",
    "User Testing",
    "User Research",
  
    // Backend Development
    "Node",
    "Express",
    "NestJS",
    "Django",
    "Flask",
    "Spring Boot",
    "Ruby on Rails",
    "PHP",
    "Laravel",
    "ASP.NET Core",
  
    // Databases
    "MongoDB",
    "Firebase",
    "PostgreSQL",
    "MySQL",
    "SQLite",
    "Oracle Database",
    "Microsoft SQL Server",
    "Redis",
    "Cassandra",
    "Elasticsearch",
  
    // DevOps and CI/CD
    "Docker",
    "Kubernetes",
    "Terraform",
    "AWS",
    "Google Cloud Platform (GCP)",
    "Microsoft Azure",
    "Jenkins",
    "GitLab CI/CD",
    "CircleCI",
    "Ansible",
    "Prometheus",
    "Grafana",
  
    // Programming Languages
    "Java",
    "Python",
    "C",
    "C++",
    "C#",
    "Ruby",
    "Go",
    "Rust",
    "Kotlin",
    "Swift",
    "Perl",
    "R",
    "MATLAB",
    "Scala",
  
    // Software Engineering Concepts
    "OOP", // Object-Oriented Programming
    "Functional Programming",
    "Test-Driven Development (TDD)",
    "Behavior-Driven Development (BDD)",
    "Agile Methodologies",
    "SCRUM",
    "Kanban",
    "Software Architecture",
    "Microservices",
    "RESTful APIs",
    "GraphQL APIs",
  
    // Data Science and AI/ML
    "Data Analysis",
    "Data Visualization",
    "Pandas",
    "NumPy",
    "Scikit-Learn",
    "TensorFlow",
    "PyTorch",
    "Keras",
    "Natural Language Processing (NLP)",
    "Computer Vision",
    "Big Data",
    "Hadoop",
    "Apache Spark",
    "Machine Learning",
    "Deep Learning",
  
    // Cloud and Virtualization
    "AWS Lambda",
    "Azure Functions",
    "Virtual Machines",
    "Serverless Architecture",
    "CloudFormation",
    "OpenStack",
  
    // Testing and Quality Assurance
    "Jest",
    "Mocha",
    "Chai",
    "Cypress",
    "Selenium",
    "Appium",
    "Test Automation",
    "Load Testing",
    "Unit Testing",
    "Integration Testing",
    "End-to-End Testing",
  
    // Tools and Version Control
    "Git",
    "GitHub",
    "Bitbucket",
    "GitLab",
    "Jira",
    "Confluence",
    "Asana",
    "Slack",
    "VS Code",
    "IntelliJ IDEA",
    "Eclipse",
    "Atom",
  
    // Networking and Security
    "Network Security",
    "Firewalls",
    "SSL/TLS",
    "Authentication and Authorization",
    "OAuth",
    "SAML",
    "Penetration Testing",
    "Encryption Algorithms",
    "Zero Trust Architecture",
  
    // Soft Skills
    "Problem-Solving",
    "Critical Thinking",
    "Communication",
    "Team Collaboration",
    "Leadership",
    "Mentoring",
    "Creative Problem Solving",
    "Teaching",
    "Adaptability",
    "Conflict Resolution",
  
    // Miscellaneous
    "Automation",
    "Requirements Management",
    "Tool Integration",
    "Technical Writing",
    "Project Management",
    "Customer Support",
    "Cross-Platform Development",
    "IoT Development",
    "Blockchain Technology",
  ];

  
  

  // Handle input changes for filters
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(name, value); // Update specific filter key

    if (name === "jobRole") {
      if (value.trim() === "") {
        setFilteredRoles([]);
        setShowDropdown(false);
      } else {
        const matches = jobRoles.filter((role) =>
          role.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredRoles(matches);
        setShowDropdown(matches.length > 0);
      }
    }

    if (name === "skills") {
      const enteredSkills = value.split(",").map((skill) => skill.trim());
      const lastSkill = enteredSkills[enteredSkills.length - 1];

      if (lastSkill.trim() === "") {
        setFilteredSkills([]);
        setShowSkillsDropdown(false);
      } else {
        const matches = skillsList.filter((skill) =>
          skill.toLowerCase().startsWith(lastSkill.toLowerCase())
        );
        setFilteredSkills(matches);
        setShowSkillsDropdown(matches.length > 0);
      }
    }

    if (name === "education") {
      const enteredEducation = value.split(",").map((edu) => edu.trim());
      const lastEducation = enteredEducation[enteredEducation.length - 1];

      if (lastEducation.trim() === "") {
        setFilteredEducation([]);
        setShowEducationDropdown(false);
      } else {
        const matches = educationListedOptions.filter((skill) =>
          skill.toLowerCase().startsWith(lastEducation.toLowerCase())
        );
        setFilteredEducation(matches);
        setShowEducationDropdown(matches.length > 0);
      }
    }
  };

  // Handle dropdown item click for jobRole
  const handleDropdownClick = (role) => {
    setFilters("jobRole", role);
    setFilteredRoles([]);
    setShowDropdown(false);
  };

  // Handle dropdown item click for skills
  const handleSkillsDropdownClick = (skill) => {
    const currentSkills = filters.skills ? filters.skills.split(",").map((s) => s.trim()) : [];
    currentSkills.pop(); // Remove the last partial skill
    currentSkills.push(skill); // Add the selected skill

    setFilters("skills", currentSkills.join(", "));
    setFilteredSkills([]);
    setShowSkillsDropdown(false);
  };

  // Handle dropdown item click for education
  const handleEducationDropdownClick = (education) => {
    const currentEducation = filters.education
      ? filters.education.split(",").map((e) => e.trim())
      : [];
    currentEducation.pop(); // Remove the last partial education entry
    currentEducation.push(education); // Add the selected education level

    setFilters("education", currentEducation.join(", "));
    setFilteredEducation([]); // Clear the filtered list
    setShowEducationDropdown(false); // Close the dropdown
  };


  return (
    <div className="relative bg-white shadow rounded-lg max-h-screen">
      <div className="flex sticky top-0 z-10">
        <div className="w-full flex sticky top-0 items-center justify-between p-4 bg-brand-primary text-brand-accent text-2xl font-bold">
          <span>Filters</span>
          <button
            onClick={clearFilters}
            className="py-1 px-2 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600 transition-all"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto p-4">
        {/* Job Role */}
        <div className="relative">
          <input
            type="text"
            name="jobRole"
            placeholder="Job Role"
            value={filters.jobRole || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
          {showDropdown && (
            <ul className="absolute z-10 w-full bg-white border rounded shadow-md max-h-48 overflow-y-auto">
              {filteredRoles.map((role) => (
                <li
                  key={role}
                  onClick={() => handleDropdownClick(role)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {role}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Skills */}
        <div className="relative">
          <input
            type="text"
            name="skills"
            placeholder="Skills (comma-separated)"
            value={filters.skills || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
          {showSkillsDropdown && (
            <ul className="absolute z-10 w-full bg-white border rounded shadow-md max-h-48 overflow-y-auto">
              {filteredSkills.map((skill) => (
                <li
                  key={skill}
                  onClick={() => handleSkillsDropdownClick(skill)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {skill}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Company */}
        <input
          type="text"
          name="company"
          placeholder="Company"
          value={filters.company || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />

        {/* Location */}
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={filters.location || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />

        {/* Experience Level */}
        <select
          name="experienceLevel"
          value={filters.experienceLevel || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Choose Experience Level</option>
          <option value="Entry">Entry</option>
          <option value="Junior">Junior</option>
          <option value="Senior">Senior</option>
          <option value="Internship">Internship</option>
        </select>

        {/* Company Size */}
        <select
          name="companySize"
          value={filters.companySize || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="" disabled>
            Select Company Size
          </option>
          <option value="0-30">0-30</option>
          <option value="31-100">31-100</option>
          <option value="101-300">101-300</option>
          <option value="301+">301+</option>
        </select>

        {/* Job Type */}
        <select
          name="jobType"
          value={filters.jobType || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Choose Job Type</option>
          <option value="Full Time">Full Time</option>
          <option value="Part Time">Part Time</option>
          <option value="Contract">Contract</option>
        </select>

        {/* Remote */}
        <select
          name="remote"
          value={filters.remote || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Choose Remote</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On Site">On Site</option>
        </select>

        {/* Security Clearance */}
        <input
          type="number"
          name="securityClearance"
          placeholder="Security Clearance"
          value={filters.securityClearance || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />


        {/* Education */}
        <div className="relative">
          <input
            type="text"
            name="education"
            placeholder="Education (comma-separated)"
            value={filters.education || ""}
            onChange={handleChange} // Update this to handle education input changes
            className="w-full px-3 py-2 border rounded"
          />
          {showEducationDropdown && (
            <ul className="absolute z-10 w-full bg-white border rounded shadow-md max-h-48 overflow-y-auto">
              {filteredEducation.map((edu) => (
                <li
                  key={edu}
                  onClick={() => handleEducationDropdownClick(edu)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {edu}
                </li>
              ))}
            </ul>
          )}
        </div>


        {/* Work Experience */}
        <input
          type="number"
          name="workExperience"
          placeholder="Work Experience (years)"
          value={filters.workExperience || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
    </div>
  );
};

export default SearchFilters;
