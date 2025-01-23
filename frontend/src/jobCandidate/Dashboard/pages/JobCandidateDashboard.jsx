import React, { useState } from "react";
import PersonalOverview from "../components/PersonalOverview";
import JobApplications from "../components/JobApplications";
import UpcomingEvents from "../components/UpcomingEvents";
import PerformanceInsights from "../components/PerformanceInsights";
import Gamification from "../components/Gamification";
import Notification from "../../../components/Notification";
import Botpress from "../../../botpress/Botpress";
import NavigationBar from "../../../components/NavigationBar";
import { useLocation } from "react-router-dom";

const JobCandidateDashboard = () => {
  const [notification, setNotification] = useState(null);
  const { state } = useLocation();
  
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 animate-fade-in">
      <Botpress />
      <NavigationBar userType={state?.user?.role || state?.role}/>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PersonalOverview />
        <JobApplications />
        <UpcomingEvents />
        <PerformanceInsights />
        <Gamification />
      </div>
    </div>
  );
};

export default JobCandidateDashboard;
