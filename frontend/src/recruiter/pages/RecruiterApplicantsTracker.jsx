import React, { useEffect, useState } from "react";
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

  // -- Fetch data from backend on mount
  useEffect(() => {
    if (!user?._id) return;

    fetchApplicants(user, setAllApplicants);
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
    // Add column count check
    const visibleColumnCount = Object.values(visibleColumns).filter(Boolean).length;
    
    if (visibleColumnCount > 6) {
      const shouldProceed = window.confirm(
        'Exporting many columns might affect PDF readability. Consider hiding some columns for better results.\n\nDo you want to proceed anyway?'
      );
      if (!shouldProceed) return;
    }

    try {
      // Create PDF in landscape orientation with larger page size
      const doc = new jsPDF();
      
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

      // Add copyright text
      doc.setTextColor(128, 128, 128);
      doc.setFontSize(8);
      doc.text(`© CareerAgent ${new Date().getFullYear()}. All rights reserved.`, 14, doc.internal.pageSize.height - 10);

      // Generate the table with improved settings
      autoTable(doc, {
        startY: 30,
        head: [['Name', 'Email', 'Phone', 'LinkedIn', 'GitHub', 'Job Title', 'Status', 'Application Date', 'Interview']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'left'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 30 },  // Name
          1: { cellWidth: 45 },  // Email
          2: { cellWidth: 25 },  // Phone
          3: { cellWidth: 15 },  // LinkedIn
          4: { cellWidth: 15 },  // GitHub
          5: { cellWidth: 35 },  // Job Title
          6: { cellWidth: 20 },  // Status
          7: { cellWidth: 25 },  // Application Date
          8: { cellWidth: 35 }   // Interview
        },
        margin: { top: 30, left: 10, right: 10, bottom: 15 },
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
        className="flex-1 p-6 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="h-full grid grid-cols-12 gap-6">
          {/* Left Panel with Table */}
          <div className="col-span-9 flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header with Title and Export Buttons */}
            <div className={`flex-none h-20 px-10 py-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b flex justify-between items-center`}>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Applicants Tracker
              </h1>
              <div className="flex space-x-3">
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-gray-700" />}
                </button>
                <div className="group relative">
                  <button
                    onClick={() => exportToPDF(filteredApplicants)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    <FaDownload className="w-4 h-4" />
                    <span>PDF</span>
                  </button>
                  
                  <div className="absolute left-1/2 top-full transform -translate-x-1/2 mt-2 px-3 py-2 text-xs text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    For best results, hide unnecessary columns before export
                    {/* Arrow pointing up */}
                    <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-full border-8 border-transparent border-b-gray-900"></div>
                  </div>
                </div>
                <CSVLink
                  data={getCSVData(filteredApplicants)}
                  filename="candidates.csv"
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  <FaDownload className="w-4 h-4" />
                  <span>CSV</span>
                </CSVLink>
              </div>
            </div>

            {/* Filter Bar */}
            <div className={`flex-none h-24 px-6 py-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
              <FilterBar {...filterProps} />
            </div>

            {/* Table - will scroll */}
            <div className={`flex-1 min-h-0 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
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
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3 h-full">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm h-full p-6 overflow-hidden flex flex-col`}>
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
