import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Botpress from "../../botpress/Botpress";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import FilterBar from "../components/FilterBar";
import CandidateTable from "../components/CandidateTable";
import Sidebar from "../components/Sidebar";

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
  const [filterAttribute, setFilterAttribute] = useState("name");  // e.g. name/email/jobTitle
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
        const appliedDate = new Date(c.appliedAt);
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
        new Date() - new Date(c.appliedAt) > 7 * 24 * 60 * 60 * 1000
    );
    // Interviews missing feedback
    const noFeedback = filtered.filter(
      (c) => c.status.includes("Done")
    );
    // Upcoming interviews, sorted by date
    const upcoming = filtered
      .filter((c) => c.interviewDate)
      .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
      .map((c) => ({
        candidate: c.name,
        jobTitle: c.jobTitle,
        dateTime: new Date(c.interviewDate).toLocaleString(),
      }));

    setAttentionItems(
      [
        stuck.length
          ? `${stuck.length} candidate(s) stuck in review > 7 days`
          : null,
        noFeedback.length
          ? `${noFeedback.length} interview(s) missing feedback`
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

  return (
    <div className="max-h-screen bg-gray-50 flex flex-col">
      <Botpress />

      {/* Sticky NavBar at top */}
      <div className="sticky top-0 z-40 bg-white shadow">
        <NavigationBar userType={user.role} />
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row flex-1 p-6 gap-6 height-full">
        {/* Left Side: Title, FilterBar, and Table */}
        <div className="flex-1 flex flex-col height-full">
            <h1 className="text-2xl font-bold mb-4">Applicants Tracker</h1>

            <FilterBar
                // attribute-based filter
                filterAttribute={filterAttribute}
                setFilterAttribute={setFilterAttribute}
                filterValue={filterValue}
                setFilterValue={setFilterValue}
                // status-based filter
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                // date-based filter
                dateRange={dateRange}
                setDateRange={setDateRange}
            />

            <div className="flex-1 overflow-auto height-full">

              <CandidateTable
                  applicants={filteredApplicants}
                  sortConfig={sortConfig}
                  setSortConfig={setSortConfig}
                  recruiter={user}              // pass the current recruiter info
                  refetchApplicants={async () => {
                      // Re-fetch or re-filter candidates to see updated status
                      await fetchApplicants(user, setAllApplicants); 
                  }}
              />
            </div>

        </div>

        {/* Right Sidebar */}
        <div className="lg:w-1/3 w-full bg-white border-l p-4 rounded-md shadow-sm">
          <Sidebar
            attentionItems={attentionItems}
            upcomingInterviews={upcomingInterviews}
          />
        </div>
      </div>
    </div>
  );
};

export default RecruiterApplicantsTracker;
