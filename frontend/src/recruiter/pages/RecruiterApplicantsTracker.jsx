import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Botpress from "../../botpress/Botpress";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import FilterBar from "../components/FilterBar";
import CandidateTable from "../components/CandidateTable";
import Sidebar from "../components/Sidebar";
import { FaDownload } from "react-icons/fa";
import { FiMoon, FiSun } from "react-icons/fi";
import { CSVLink } from "react-csv";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion } from "framer-motion";

const fetchApplicants = async (user, setAllApplicants) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/applicants/getRecruiterApplicants/${user._id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const data = await response.json();
    setAllApplicants(data.applications || []);
  } catch (error) {
    console.error("Failed to fetch candidates:", error);
  }
};

// Add function to fetch active applications
const fetchActiveApplicants = async (user, setActiveApplicationsCount) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/applicants/getActiveRecruiterApplicants/${user._id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      setActiveApplicationsCount(data.applications?.length || 0);
    } else if (response.status === 404) {
      // No active applications found
      setActiveApplicationsCount(0);
    }
  } catch (error) {
    console.error("Failed to fetch active candidates:", error);
    setActiveApplicationsCount(0);
  }
};

const RecruiterApplicantsTracker = () => {
  // 1) Retrieve user from router state
  const { state } = useLocation();
  const user = state?.user;

  // 2) All candidates, plus filtered/sorted subset
  const [allApplicants, setAllApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);

  // 3) Filter states
  const [filterAttribute, setFilterAttribute] = useState("name"); // e.g. name/email/jobTitle
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState("");

  // 4) Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // 5) Sidebar states
  const [attentionItems, setAttentionItems] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);

  // 6) Dark mode state
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("careeragent_darkmode") === "true" || false
  );

  // Add state for active applications count
  const [activeApplicationsCount, setActiveApplicationsCount] = useState(0);

  // Function to update totalHired count when a candidate is marked as hired
  const updateTotalHired = () => {
    // Update user.totalHired in location.state
    if (state && state.user) {
      // Initialize totalHired if it doesn't exist
      if (state.user.totalHired === undefined) {
        state.user.totalHired = 0;
      }
      
      // Increment totalHired in the state object directly
      state.user.totalHired += 1;
    }
  };

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("careeragent_darkmode", newMode.toString());
  };

  // Apply theme class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [darkMode]);

  // Add columns configuration
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'applicationDate', label: 'Application Date' },
    { key: 'status', label: 'Status' },
    { key: 'interview', label: 'Interview' },
    { key: 'nextStep', label: 'Next Step' },
    { key: 'actions', label: 'Actions' }
  ];

  // Add visibleColumns state
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    jobTitle: true,
    applicationDate: true,
    status: true,
    interview: true,
    nextStep: true,
    actions: true
  });

  // Define a refreshMetrics function that will refresh the active applications count
  const refreshMetrics = useCallback(() => {
    if (user && user._id) {
      fetchActiveApplicants(user, setActiveApplicationsCount);
    }
  }, [user]);

  // -- Fetch data from backend on mount
  useEffect(() => {
    if (!user?._id) return;

    fetchApplicants(user, setAllApplicants);
    fetchActiveApplicants(user, setActiveApplicationsCount); // Fetch active applications count
  }, [user?._id]);

  // -- Apply filtering, then sorting, then compute sidebar data
  useEffect(() => {
    let filtered = [...allApplicants];

    // 1) Filter by user-chosen attribute (e.g., name/email/jobTitle)
    if (filterValue) {
      const term = filterValue.toLowerCase();
      filtered = filtered.filter((candidate) => {
        const attrVal = candidate[filterAttribute];
        if (!attrVal) return false;
        return attrVal.toString().toLowerCase().includes(term);
      });
    }

    // 2) Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // 3) Filter by date (appliedAt >= dateRange)
    if (dateRange) {
      const selectedDate = new Date(dateRange);
      filtered = filtered.filter((c) => {
        const appliedDate = new Date(c.applicationDate);
        return appliedDate >= selectedDate;
      });
    }

    // 4) Sorting logic
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Convert date strings to timestamps if needed
        if (["interviewDate", "appliedAt"].includes(sortConfig.key)) {
          valA = valA ? new Date(valA).getTime() : 0;
          valB = valB ? new Date(valB).getTime() : 0;
        }
        // Convert strings to lowercase for consistent sorting
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    setFilteredApplicants(filtered);

    // 5) Sidebar metrics
    // Candidates stuck in review for 7+ days
    const stuck = filtered.filter(
      (c) =>
        c.status === "In Review" &&
        new Date() - new Date(c.applicationDate) > 7 * 24 * 60 * 60 * 1000
    );
    // Interviews missing feedback
    const noFeedback = filtered.filter((c) => c.status.includes("Done"));
    // Upcoming interviews, sorted by date
    const upcoming = filtered
      .filter((applicant) => applicant.interviewId)
      .sort(
        (app1, app2) =>
          new Date(app1.interviewId.scheduledTime) -
          new Date(app2.interviewId.scheduledTime)
      )
      .map((applicant) => ({
        candidate: applicant.name,
        jobTitle: applicant.jobTitle,
        dateTime: new Date(applicant.interviewId.scheduledTime).toLocaleString(),
        meetingLink: applicant.interviewId.meetingLink,
      }));

    setAttentionItems(
      [
        stuck.length
          ? `${stuck.length} candidate(s) stuck in review for more than a week.`
          : null,
        noFeedback.length
          ? `${noFeedback.length} interview(s) are done, and waiting for your action.`
          : null,
      ].filter(Boolean)
    );

    setUpcomingInterviews(upcoming.slice(0, 4));
  }, [
    allApplicants,
    filterAttribute,
    filterValue,
    statusFilter,
    dateRange,
    sortConfig,
  ]);

  // Handle no user
  if (!user) return null;

  const filterProps = {
    filterAttribute,
    setFilterAttribute,
    filterValue,
    setFilterValue,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    columns,
    visibleColumns,
    setVisibleColumns,
    darkMode
  };

  const refetchApplicants = async () => {
    await fetchApplicants(user, setAllApplicants);
    await fetchActiveApplicants(user, setActiveApplicationsCount); // Refresh active applications count
  };

  const getCSVData = (applicants) => {
    // Add copyright as first row
    const copyright = [{
      Name: `© CareerAgent ${new Date().getFullYear()}. All rights reserved.`,
      Email: '',
      Phone: '',
      LinkedIn: '',
      GitHub: '',
      'Job Title': '',
      Status: '',
      'Application Date': '',
      Interview: ''
    }];

    const data = applicants.map((applicant) => ({
      Name: applicant.name,
      Email: applicant.email,
      Phone: applicant.phone || '—',
      LinkedIn: applicant.linkedinUrl || '—',
      GitHub: applicant.githubUrl || '—',
      'Job Title': applicant.jobTitle,
      Status: applicant.status,
      'Application Date': applicant.applicationDate ? 
        new Date(applicant.applicationDate).toLocaleDateString() : '—',
      Interview: applicant.interviewId ? 
        new Date(applicant.interviewId.scheduledTime).toLocaleString() : '—'
    }));

    return [...copyright, ...data];
  };

  const exportToPDF = (applicants) => {
    // Remove the confirmation dialog check
    try {
      // Create PDF in landscape orientation with larger page size
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Format the data for the table
      const tableData = applicants.map(applicant => [
        applicant.name,
        applicant.email,
        applicant.phone || '—',
        applicant.linkedinUrl ? 'Yes' : 'No',
        applicant.githubUrl ? 'Yes' : 'No',
        applicant.jobTitle,
        applicant.status,
        applicant.applicationDate ? 
          new Date(applicant.applicationDate).toLocaleDateString() : '—',
        applicant.interviewId ? 
          new Date(applicant.interviewId.scheduledTime).toLocaleString() : '—'
      ]);

      // Add title and copyright
      doc.setFontSize(16);
      doc.text('Candidates Report', 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);
      doc.text(`Total candidates: ${applicants.length}`, 14, 30);

      // Add copyright text
      doc.setTextColor(128, 128, 128);
      doc.setFontSize(8);
      doc.text(`© CareerAgent ${new Date().getFullYear()}. All rights reserved.`, 14, doc.internal.pageSize.height - 10);

      // Dynamically calculate column widths based on available page width
      const pageWidth = doc.internal.pageSize.getWidth();
      const margins = 20; // 10mm on each side
      const availableWidth = pageWidth - margins;
      
      // Adjust column widths to fit in landscape mode - proportional to content
      const columnStyles = {
        0: { cellWidth: availableWidth * 0.13 },  // Name - wider
        1: { cellWidth: availableWidth * 0.16 },  // Email - wider for long addresses
        2: { cellWidth: availableWidth * 0.10 },  // Phone
        3: { cellWidth: availableWidth * 0.07 },  // LinkedIn - narrower (just Yes/No)
        4: { cellWidth: availableWidth * 0.07 },  // GitHub - narrower (just Yes/No)
        5: { cellWidth: availableWidth * 0.15 },  // Job Title - wider for long titles
        6: { cellWidth: availableWidth * 0.11 },  // Status
        7: { cellWidth: availableWidth * 0.09 },  // Application Date
        8: { cellWidth: availableWidth * 0.12 }   // Interview
      };

      // Generate the table with improved settings
      autoTable(doc, {
        startY: 35,
        head: [['Name', 'Email', 'Phone', 'LinkedIn', 'GitHub', 'Job Title', 'Status', 'Application Date', 'Interview']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 7,  // Smaller font size to fit more data
          cellPadding: 1,  // Reduced padding
          overflow: 'linebreak',
          lineWidth: 0.1,
          halign: 'left'
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'left',
          fontSize: 8
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: columnStyles,
        margin: { top: 35, left: 10, right: 10, bottom: 15 },
        didDrawPage: function (data) {
          // Add copyright text on each page
          doc.setTextColor(128, 128, 128);
          doc.setFontSize(8);
          doc.text(
            `© CareerAgent ${new Date().getFullYear()}. All rights reserved.`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        }
      });

      // Save the PDF
      doc.save(`candidates-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className={`h-screen w-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} flex flex-col overflow-hidden`}>
      <Botpress />

      {/* Navbar */}
      <div className="h-16 flex-none">
        <NavigationBar userType={user.role} />
      </div>

      {/* Main Content */}
      <motion.div 
        className="flex-1 p-4 md:p-6 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Left Panel with Table */}
          <div className="lg:col-span-9 flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header with Title and Export Buttons */}
            <div className={`flex-none px-3 py-3 md:px-4 md:py-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0`}>
              <h1 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Applicants Tracker
              </h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleDarkMode}
                  className={`relative p-2 rounded-full overflow-hidden transition-all duration-300 shadow-lg ${
                    darkMode ? 'bg-gray-800/80 text-yellow-300' : 'bg-white/90 text-indigo-600'
                  } backdrop-blur-md border border-white/10`}
                  style={{
                    boxShadow: darkMode ? '0 0 20px rgba(255, 240, 150, 0.1)' : '0 0 20px rgba(66, 153, 225, 0.15)'
                  }}
                  aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: darkMode ? 0 : 180 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                    className="relative z-10"
                  >
                    {darkMode ? 
                      <FiSun className="w-5 h-5" /> : 
                      <FiMoon className="w-5 h-5" />
                    }
                  </motion.div>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br rounded-full opacity-0"
                    initial={false}
                    whileHover={{ opacity: 0.15 }}
                    style={{ 
                      background: darkMode ? 
                        'radial-gradient(circle at center, rgba(255, 225, 125, 0.25), transparent 70%)' : 
                        'radial-gradient(circle at center, rgba(129, 140, 248, 0.25), transparent 70%)' 
                    }}
                  />
                </button>
                
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={() => exportToPDF(filteredApplicants)}
                    className={`relative group flex items-center gap-3 px-5 py-2.5 rounded-xl overflow-hidden ${
                      darkMode ? 'text-white' : 'text-white'
                    } shadow-lg backdrop-blur-md`}
                    initial={{ opacity: 1 }}
                    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
                  >
                    {/* Background layers */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/90 to-rose-600/90 dark:from-red-600/90 dark:to-rose-700/90" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 dark:from-transparent dark:via-white/5 dark:to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-rose-600 dark:from-red-600 dark:to-rose-700 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
                    
                    {/* Border light */}
                    <div className="absolute inset-0 rounded-xl border border-white/20 pointer-events-none" />
                    
                    {/* Button content with relative positioning */}
                    <div className="relative flex items-center justify-center gap-3">
                      <span className="relative">
                        <FaDownload className="w-4 h-4" />
                        <motion.div
                          className="absolute inset-0 w-full h-full flex items-center justify-center"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: [0, 1, 0], y: [-5, 0, 5], transition: { duration: 1.5, repeat: Infinity, repeatDelay: 5 } }}
                        >
                          <FaDownload className="w-4 h-4 text-white/80" />
                        </motion.div>
                      </span>
                      <span className="text-sm font-medium">Export PDF</span>
                      
                      {/* Ripple effect */}
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        whileTap={{ 
                          scale: [0, 1.5], 
                          opacity: [0.5, 0],
                          transition: { duration: 0.5 } 
                        }}
                      />
                    </div>
                  </motion.button>
                  
                  <motion.div
                    className="relative group"
                    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
                  >
                    <CSVLink
                      data={getCSVData(filteredApplicants)}
                      filename={`candidates-${new Date().toISOString().split('T')[0]}.csv`}
                      className={`relative flex items-center gap-3 px-5 py-2.5 rounded-xl overflow-hidden ${
                        darkMode ? 'text-white' : 'text-white'
                      } shadow-lg backdrop-blur-md`}
                    >
                      {/* Background layers */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/90 to-green-600/90 dark:from-emerald-600/90 dark:to-green-700/90" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 dark:from-transparent dark:via-white/5 dark:to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-600 dark:from-emerald-600 dark:to-green-700 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
                      
                      {/* Border light */}
                      <div className="absolute inset-0 rounded-xl border border-white/20 pointer-events-none" />
                      
                      {/* Link content with relative positioning */}
                      <div className="relative flex items-center justify-center gap-3">
                        <span className="relative">
                          <FaDownload className="w-4 h-4" />
                          <motion.div
                            className="absolute inset-0 w-full h-full flex items-center justify-center"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: [0, 1, 0], y: [-5, 0, 5], transition: { duration: 1.5, repeat: Infinity, repeatDelay: 5 } }}
                          >
                            <FaDownload className="w-4 h-4 text-white/80" />
                          </motion.div>
                        </span>
                        <span className="text-sm font-medium">Export CSV</span>
                      </div>
                    </CSVLink>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className={`flex-none px-3 py-3 md:px-4 md:py-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
              <FilterBar {...filterProps} />
            </div>

            {/* Table - will scroll */}
            <div className={`flex-1 min-h-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} overflow-auto`}>
              <CandidateTable
                applicants={filteredApplicants}
                setApplicants={setFilteredApplicants}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
                recruiter={user}
                refetchApplicants={refetchApplicants}
                visibleColumns={visibleColumns}
                darkMode={darkMode}
                user={user}
                updateTotalHired={updateTotalHired}
                refreshMetrics={refreshMetrics}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 h-full">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm h-full p-3 md:p-4 overflow-hidden flex flex-col`}>
              <Sidebar
                attentionItems={attentionItems}
                upcomingInterviews={upcomingInterviews}
                darkMode={darkMode}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RecruiterApplicantsTracker;
