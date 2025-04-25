// File: SearchFilters.jsx

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import { 
  ChevronDown, 
  X, 
  Filter, 
  Search, 
  Briefcase, 
  Building, 
  MapPin, 
  Star, 
  Clock, 
  Globe, 
  Layers, 
  Award, 
  Book, 
  Code,
  Calendar,
  Sliders,
  Share2,
  Users,
  ChevronUp,
  ChevronsUpDown,
  PlusCircle
} from "lucide-react";

const SearchFilters = ({ filters, setFilters, clearFilters, educationListedOptions }) => {
  // Track open sections with a Set to allow multiple open sections - initialize with empty set
  const [openSections, setOpenSections] = useState(new Set());
  const [filterCount, setFilterCount] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const filterRef = useRef(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [expandAll, setExpandAll] = useState(false);
  
  // Autocomplete states
  const [suggestions, setSuggestions] = useState({
    jobRole: [],
    skills: [],
    education: []
  });

  // Reference data
  const jobRoles = [
    "Student",
    "Software Developer",
    "Software Engineer",
    "Full Stack Developer",
    "Backend Developer",
    "Frontend Developer",
    "Lead Software Engineer",
    "Principal Software Engineer",
    "Software Consultant",
    "System Programmer",
    "Research Software Engineer",
    "Prototype Developer",
    "Proof of Concept (PoC) Specialist",
    "Software Development Manager",
    "Software Architect",
    "Technical Lead",
    "CTO (Chief Technology Officer)",
    "Technical Project Manager",
    "Delivery Manager",
    "Release Manager",
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
    "GraphQL Developer",
    "RESTful API Developer",
    "API Integration Specialist",
    "API Gateway Developer",
    "Serverless Function Developer",
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
    "Game Balancing Specialist",
    "Multiplayer Systems Developer",
    "Anti-Cheat Systems Developer",
    "Game Level Scripting Specialist",
    "Game Physics Tester",
    "Java Developer",
    "C Developer",
    "C++ Developer",
    "C# Developer",
    "Go Developer",
    "Rust Developer",
    "Scala Developer",
    "Elixir Developer",
    "Erlang Developer",
    "Haskell Developer",
    "Perl Developer",
    "R Developer",
    "MATLAB Developer",
    "Lua Developer",
    "F# Developer",
    "Visual Basic Developer",
    "COBOL Developer",
    "Fortran Developer",
    "Assembly Language Developer",
    "PL/SQL Developer",
    "SQL Developer",
    "NoSQL Developer",
    "Embedded Software Engineer",
    "Low-Level Programmer",
    "Kernel Developer",
    "Firmware Developer",
    "Device Driver Developer",
    "Embedded Linux Developer",
    "Firmware Security Specialist",
    "High-Performance Computing (HPC) Developer",
    "Automation Engineer",
    "Automation Developer",
    "Infrastructure Engineer",
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
    "Cloud-Native Developer",
    "Edge Computing Developer",
    "Hybrid Cloud Developer",
    "Data Lakes Engineer",
    "High Availability Systems Developer",
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
    "Security Testing Engineer",
    "Penetration Testing Specialist",
    "Secure Coding Specialist",
    "Blockchain Security Specialist",
    "Network Security Developer",
    "Cryptography Researcher",
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
    "MLops Specialist",
    "AutoML Engineer",
    "AI Framework Developer",
    "NLP Tools Developer",
    "TensorFlow Developer",
    "PyTorch Developer",
    "Data Engineering Manager",
    "UI Developer",
    "UX Developer",
    "UI/UX Designer",
    "Product Designer",
    "Interaction Designer",
    "Accessibility Specialist",
    "UX Writer",
    "User Research Specialist",
    "Design Systems Engineer",
    "UX Engineer",
    "Prototyping Specialist",
    "Visual Designer",
    "Information Architect",
    "Usability Specialist",
    "Technical Content Writer",
    "Technical Documentation Specialist",
    "QA Engineer",
    "Automation Tester",
    "Manual Tester",
    "Load Tester",
    "Performance Tester",
    "Usability Tester",
    "Mobile App Tester",
    "Test Automation Framework Developer",
    "Application Performance Tester",
    "Quality Metrics Specialist",
    "Gaming QA Engineer",
    "Simulation QA Engineer",
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
    "Decentralized Finance (DeFi) Developer",
    "Cryptocurrency Mining Software Developer",
    "Token Minting Developer",
    "Blockchain Data Analyst",
    "Network Programmer",
    "Communication Systems Developer",
    "Protocol Developer",
    "IoT Network Developer",
    "Software-Defined Networking (SDN) Engineer",
    "Wireless Network Engineer",
    "5G Network Developer",
    "Telecom Software Engineer",
    "Optical Network Developer",
    "IoT Developer",
    "Embedded IoT Developer",
    "Sensor Systems Developer",
    "Home Security Software Developer",
    "Industrial IoT Developer",
    "AR/VR Developer",
    "Simulation Developer",
    "Geographic Information Systems (GIS) Developer",
    "Wearable Technology Developer",
    "Autonomous Vehicle Developer",
    "Quantum Computing Developer",
    "Simulation and Modeling Engineer",
    "Robotics Software Engineer",
    "Robotics Middleware Developer",
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

  // Calculate active filter count
  useEffect(() => {
    const count = Object.values(filters).filter(value => value && value.trim() !== '').length;
    setFilterCount(count);
  }, [filters]);

  // Update expandAll state when all sections are manually opened or closed
  useEffect(() => {
    const totalSections = filterSections.length;
    setExpandAll(openSections.size === totalSections);
  }, [openSections]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setSuggestions({
          jobRole: [],
          skills: [],
          education: []
        });
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle input changes for filters
  const handleChange = (name, value) => {
    setFilters(name, value);
    
    // Handle autocomplete based on filter type
    if (name === "jobRole" && value.trim() !== "") {
      const matches = jobRoles.filter(role => 
        role.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setSuggestions(prev => ({ ...prev, jobRole: matches }));
    } else if (name === "skills" && value.trim() !== "") {
      const enteredSkills = value.split(",").map(skill => skill.trim());
      const lastSkill = enteredSkills[enteredSkills.length - 1];
      
      if (lastSkill) {
        const matches = skillsList.filter(skill =>
          skill.toLowerCase().startsWith(lastSkill.toLowerCase())
        ).slice(0, 5);
        setSuggestions(prev => ({ ...prev, skills: matches }));
      }
    } else if (name === "education" && value.trim() !== "") {
      const enteredEducation = value.split(",").map(edu => edu.trim());
      const lastEdu = enteredEducation[enteredEducation.length - 1];
      
      if (lastEdu) {
        const matches = educationListedOptions.filter(edu =>
          edu.toLowerCase().startsWith(lastEdu.toLowerCase())
        ).slice(0, 5);
        setSuggestions(prev => ({ ...prev, education: matches }));
      }
    }
  };

  // Toggle all sections
  const toggleAllSections = () => {
    const newExpandState = !expandAll;
    setExpandAll(newExpandState);
    
    if (newExpandState) {
      // Open all sections
      const allSections = filterSections.map(section => section.id);
      setOpenSections(new Set(allSections));
    } else {
      // Close all sections
      setOpenSections(new Set());
    }
  };

  // Handle selection from autocomplete dropdown
  const handleSuggestionSelect = (type, value) => {
    if (type === "jobRole") {
      setFilters(type, value);
      setSuggestions(prev => ({ ...prev, jobRole: [] }));
    } else if (type === "skills" || type === "education") {
      const currentValues = filters[type] ? filters[type].split(",").map(item => item.trim()) : [];
      currentValues.pop(); // Remove the last partial entry
      const newValue = [...currentValues, value].join(", ");
      setFilters(type, newValue);
      setSuggestions(prev => ({ ...prev, [type]: [] }));
    }
  };

  // Toggle filter section (allows multiple open sections)
  const toggleSection = (sectionId) => {
    setOpenSections(prev => {
      const newOpenSections = new Set(prev);
      if (newOpenSections.has(sectionId)) {
        newOpenSections.delete(sectionId);
      } else {
        newOpenSections.add(sectionId);
      }
      return newOpenSections;
    });
  };

  // Filter pills display
  const renderFilterPills = () => {
    const activePills = [];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        if (key === "skills" || key === "education") {
          value.split(",").forEach(item => {
            if (item.trim()) {
              activePills.push({
                key: `${key}-${item.trim()}`,
                label: item.trim(),
                type: key
              });
            }
          });
        } else {
          activePills.push({
            key,
            label: value,
            type: key
          });
        }
      }
    });
    
    if (activePills.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-2 px-4 pb-3">
        <span className="text-sm text-gray-500 font-medium flex items-center">
          <Sliders size={14} className="mr-1" />
          Active filters:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {activePills.slice(0, 3).map(pill => (
            <motion.span
              key={pill.key}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-brand-primary/10 text-brand-primary"
            >
              {pill.label}
              <button
                onClick={() => removeFilter(pill.type, pill.label)}
                className="ml-1 rounded-full p-0.5 hover:bg-brand-primary/20 transition-colors"
              >
                <X size={12} />
              </button>
            </motion.span>
          ))}
          {activePills.length > 3 && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-700"
            >
              +{activePills.length - 3} more
            </motion.span>
          )}
        </div>
      </div>
    );
  };

  // Remove individual filter
  const removeFilter = (type, value) => {
    if (type === "skills" || type === "education") {
      const values = filters[type].split(",").map(v => v.trim());
      const filtered = values.filter(v => v !== value).join(", ");
      setFilters(type, filtered);
    } else {
      setFilters(type, "");
    }
  };

  // Filter section icons
  const sectionIcons = {
    jobDetails: <Briefcase size={18} />,
    company: <Building size={18} />,
    qualifications: <Award size={18} />
  };

  // Grouped filter sections
  const filterSections = [
    {
      id: "jobDetails",
      title: "Job Details",
      icon: sectionIcons.jobDetails,
      fields: [
        {
          name: "jobRole",
          label: "Job Role",
          type: "autocomplete",
          placeholder: "Search job roles...",
          suggestions: "jobRole",
          icon: <Briefcase size={16} />
        },
        {
          name: "jobType",
          label: "Job Type",
          type: "select",
          options: ["Full Time", "Part Time", "Contract"],
          icon: <Clock size={16} />
        },
        {
          name: "remote",
          label: "Work Mode",
          type: "select",
          options: ["Remote", "Hybrid", "On Site"],
          icon: <Globe size={16} />
        },
        {
          name: "experienceLevel",
          label: "Experience Level",
          type: "select",
          options: ["Entry", "Junior", "Senior", "Internship"],
          icon: <Layers size={16} />
        }
      ]
    },
    {
      id: "company",
      title: "Company",
      icon: sectionIcons.company,
      fields: [
        {
          name: "company",
          label: "Company Name",
          type: "text",
          placeholder: "Enter company name",
          icon: <Building size={16} />
        },
        {
          name: "location",
          label: "Location",
          type: "text",
          placeholder: "City, state, or country",
          icon: <MapPin size={16} />
        },
        {
          name: "companySize",
          label: "Company Size",
          type: "select",
          options: ["0-30", "31-100", "101-300", "301+"],
          icon: <Users size={16} />
        },
        {
          name: "securityClearance",
          label: "Security Clearance",
          type: "number",
          placeholder: "Required clearance level",
          icon: <Share2 size={16} />
        }
      ]
    },
    {
      id: "qualifications",
      title: "Qualifications",
      icon: sectionIcons.qualifications,
      fields: [
        {
          name: "skills",
          label: "Skills",
          type: "autocomplete",
          placeholder: "Add skills...",
          info: "Separate multiple skills with commas",
          suggestions: "skills",
          icon: <Code size={16} />
        },
        {
          name: "education",
          label: "Education",
          type: "autocomplete",
          placeholder: "Add education...",
          info: "Separate multiple entries with commas",
          suggestions: "education",
          icon: <Book size={16} />
        },
        {
          name: "workExperience",
          label: "Work Experience",
          type: "number",
          placeholder: "Years of experience",
          icon: <Calendar size={16} />
        }
      ]
    }
  ];

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(val => val && val.trim() !== '');

  // Render filter field based on type
  const renderField = (field) => {
    switch (field.type) {
      case "text":
        return (
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {field.icon}
            </div>
            <input
              type="text"
              name={field.name}
              placeholder={field.placeholder}
              value={filters[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm transition-shadow duration-200"
            />
          </div>
        );
      case "number":
        return (
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {field.icon}
            </div>
            <input
              type="number"
              name={field.name}
              placeholder={field.placeholder}
              value={filters[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm transition-shadow duration-200"
            />
          </div>
        );
      case "select":
        return (
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {field.icon}
            </div>
            <select
              name={field.name}
              value={filters[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm transition-shadow duration-200"
            >
              <option value="">{`Select ${field.label}`}</option>
              {field.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        );
      case "autocomplete":
        return (
          <div className="relative">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {field.icon}
              </div>
              <input
                type="text"
                name={field.name}
                placeholder={field.placeholder}
                value={filters[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm transition-shadow duration-200 placeholder:text-ellipsis placeholder:overflow-hidden"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <PlusCircle size={16} />
              </div>
            </div>
            
            {field.info && (
              <p className="text-xs text-gray-500 mt-1 ml-1 italic">
                {field.info}
              </p>
            )}
            
            <AnimatePresence>
              {suggestions[field.suggestions]?.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto"
                >
                  {suggestions[field.suggestions].map(item => (
                    <li
                      key={item}
                      onClick={() => handleSuggestionSelect(field.name, item)}
                      className="px-4 py-1.5 cursor-pointer hover:bg-gray-50 flex items-center gap-2 transition-colors text-sm"
                    >
                      <span>{item}</span>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Mobile Filter Toggle */}
      {isMobile && (
        <div className="sticky top-0 z-20 bg-white p-3 shadow-sm border-b">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center justify-center w-full gap-2 py-2 px-4 bg-brand-primary text-white rounded-lg font-medium text-sm"
          >
            <Filter size={16} />
            <span>Filters</span>
            {filterCount > 0 && (
              <span className="ml-1 bg-white text-brand-primary text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                {filterCount}
              </span>
            )}
          </button>
          {renderFilterPills()}
        </div>
      )}

      {/* Filter Container - Desktop or Mobile View */}
      <AnimatePresence>
        {(!isMobile || showMobileFilters) && (
          <motion.div
            ref={filterRef}
            initial={isMobile ? { x: "100%" } : { opacity: 1 }}
            animate={isMobile ? { x: 0 } : { opacity: 1 }}
            exit={isMobile ? { x: "100%" } : { opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`
              bg-white shadow-lg rounded-lg overflow-hidden
              ${isMobile ? 
                "fixed top-0 right-0 bottom-0 z-30 w-full max-w-md flex flex-col" : 
                "auto-height sticky top-3 overflow-y-auto"
              }
            `}
            style={{ 
              maxHeight: isMobile ? 'none' : 'calc(100vh - 7rem)'
            }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-brand-primary text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={18} />
                <h2 className="text-lg font-medium">Filters</h2>
                {filterCount > 0 && (
                  <span className="ml-1 bg-white text-brand-primary text-xs font-bold rounded-full h-5 flex items-center justify-center px-1.5">
                    {filterCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAllSections}
                  className="py-1 px-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1"
                  title={expandAll ? "Collapse all sections" : "Expand all sections"}
                >
                  {expandAll ? (
                    <>
                      <ChevronUp size={14} />
                      <span>Collapse</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} />
                      <span>Expand</span>
                    </>
                  )}
                </button>
                <button
                  onClick={clearFilters}
                  className="py-1 px-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-md transition-colors"
                  disabled={!hasActiveFilters}
                  style={{ opacity: hasActiveFilters ? 1 : 0.5 }}
                  title="Clear all filters"
                >
                  Clear All
                </button>
                {isMobile && (
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Active Filter Pills - Desktop */}
            {!isMobile && renderFilterPills()}
            
            {/* Filter Sections - Accordion Style */}
            <div className={`overflow-y-auto ${isMobile ? "flex-1" : ""}`}>
              {filterSections.map(section => (
                <div key={section.id} className="border-b border-gray-200 last:border-0">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center justify-between w-full p-3 text-left focus:outline-none hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-brand-primary">{section.icon}</span>
                      <h3 className="text-sm font-medium text-gray-700">{section.title}</h3>
                    </div>
                    <motion.div
                      animate={{ rotate: openSections.has(section.id) ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={18} className="text-gray-500" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {openSections.has(section.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 space-y-3 bg-gray-50">
                          {section.fields.map(field => (
                            <div key={field.name} className="space-y-1">
                              <label className="block text-xs font-medium text-gray-700">
                                {field.label}
                              </label>
                              {renderField(field)}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Empty space notice when all sections are collapsed */}
              {!isMobile && openSections.size === 0 && !hasActiveFilters && (
                <div className="p-6 text-center text-gray-500 italic text-sm">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <ChevronsUpDown size={24} />
                    <p>Expand a section to see filter options</p>
                    <button
                      onClick={toggleAllSections}
                      className="mt-1 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                    >
                      <ChevronDown size={14} />
                      <span>Expand All Sections</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* "No active filters" notice when sections are open but no filters set */}
            {!isMobile && openSections.size > 0 && !hasActiveFilters && (
              <div className="p-3 border-t text-center text-xs text-gray-500">
                No active filters
              </div>
            )}
            
            {/* Apply Filter Button - Mobile Only */}
            {isMobile && (
              <div className="sticky bottom-0 p-3 bg-white border-t border-gray-200">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-2 px-4 bg-brand-primary text-white rounded-lg font-medium text-sm"
                >
                  Apply Filters {filterCount > 0 && `(${filterCount})`}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add CSS for dynamic height */}
      <style jsx>{`
        .auto-height {
          height: auto;
          min-height: auto;
          max-height: calc(100vh - 7rem);
        }
      `}</style>
    </>
  );
};

export default SearchFilters;
