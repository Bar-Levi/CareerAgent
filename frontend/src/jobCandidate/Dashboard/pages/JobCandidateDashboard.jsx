import React, { useState } from "react";
import PersonalOverview from "../components/PersonalOverview";
import JobApplications from "../components/JobApplications";
import UpcomingEvents from "../components/UpcomingEvents";
import PerformanceInsights from "../components/PerformanceInsights";
import Notification from "../../../components/Notification";
import Botpress from "../../../botpress/Botpress";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import { useLocation } from "react-router-dom";

const JobCandidateDashboard = ({onlineUsers}) => {
  const [notification, setNotification] = useState(null);
  const { state } = useLocation();
  
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 animate-fade-in overflow-hidden">
      <Botpress />
      <NavigationBar userType={state?.user?.role || state?.role} notifications={state?.user?.notifications || []}/>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex-1 p-4 overflow-hidden min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          <div className="grid grid-rows-2 gap-4 h-full min-h-0">
            <div className="h-full overflow-hidden min-h-0">
              <PersonalOverview user={state.user}/>
            </div>
            <div className="h-full overflow-hidden min-h-0">
              <JobApplications user={state.user}/>
            </div>
          </div>
          <div className="grid grid-rows-2 gap-4 h-full min-h-0">
            <div className="h-full overflow-hidden min-h-0">
              <UpcomingEvents user={state.user}/>
            </div>
            <div className="h-full overflow-hidden min-h-0">
              <PerformanceInsights />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCandidateDashboard;
