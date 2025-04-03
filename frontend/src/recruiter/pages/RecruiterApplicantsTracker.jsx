import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Botpress from "../../botpress/Botpress";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import FilterBar from "../components/FilterBar";
import CandidateTable from "../components/CandidateTable";
import Sidebar from "../components/Sidebar";
import { FaDownload } from "react-icons/fa";
import { CSVLink } from "react-csv";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    console.log("filtered:", filtered);
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
  };

  const refetchApplicants = async () => {
    await fetchApplicants(user, setAllApplicants);
  };

  const getCSVData = (applicants) => {
    // Add copyright as first row
    const copyright = [{
      Name: `© CareerAgent ${new Date().getFullYear()}. All rights reserved.`,
      Email: '',
      JobTitle: '',
      Status: '',
      ApplicationDate: ''
    }];

    const data = applicants.map((applicant) => ({
      Name: applicant.name,
      Email: applicant.email,
      JobTitle: applicant.jobTitle,
      Status: applicant.status,
      ApplicationDate: applicant.applicationDate ? 
        new Date(applicant.applicationDate).toLocaleDateString() : '—',
    }));

    return [...copyright, ...data];
  };

  const exportToPDF = (applicants) => {
    try {
      const doc = new jsPDF();
      
      // Format the data for the table
      const tableData = applicants.map(applicant => [
        applicant.name,
        applicant.email,
        applicant.jobTitle,
        applicant.status,
        applicant.applicationDate ? new Date(applicant.applicationDate).toLocaleDateString() : '—',
        applicant.interviewId ? new Date(applicant.interviewId.scheduledTime).toLocaleString() : '—'
      ]);

      // Add title and copyright
      doc.setFontSize(16);
      doc.text('Candidates Report', 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);
      
      // Add copyright text
      doc.setTextColor(128, 128, 128); // Gray color for copyright
      doc.setFontSize(8);
      doc.text(`© CareerAgent ${new Date().getFullYear()}. All rights reserved.`, 14, doc.internal.pageSize.height - 10);

      // Generate the table using autoTable
      autoTable(doc, {
        startY: 30,
        head: [['Name', 'Email', 'Job Title', 'Status', 'Application Date', 'Interview']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          3: { 
            fontStyle: 'bold',
            cellWidth: 'auto'
          }
        },
        margin: { top: 30, bottom: 15 } // Added bottom margin for copyright
      });

      // Save the PDF
      doc.save(`candidates-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden">
      <Botpress />

      {/* Navbar */}
      <div className="h-16 flex-none">
        <NavigationBar userType={user.role} />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full grid grid-cols-12 gap-6">
          {/* Left Panel with Table */}
          <div className="col-span-9 flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header with Title and Export Buttons */}
            <div className="flex-none h-20 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Applicants Tracker
              </h1>
              <div className="flex space-x-3">
                <CSVLink
                  data={getCSVData(filteredApplicants)}
                  filename="candidates.csv"
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  <FaDownload className="w-4 h-4" />
                  <span>CSV</span>
                </CSVLink>
                <button
                  onClick={() => exportToPDF(filteredApplicants)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  <FaDownload className="w-4 h-4" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex-none h-24 px-6 py-4 border-b border-gray-200">
              <FilterBar {...filterProps} />
            </div>

            {/* Table - will scroll */}
            <div className="flex-1 min-h-0">
              <CandidateTable
                applicants={filteredApplicants}
                setApplicants={setFilteredApplicants}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
                recruiter={user}
                refetchApplicants={refetchApplicants}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3 h-full">
            <div className="bg-white rounded-lg shadow-sm h-full p-6 overflow-hidden flex flex-col">
              <Sidebar
                attentionItems={attentionItems}
                upcomingInterviews={upcomingInterviews}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterApplicantsTracker;
