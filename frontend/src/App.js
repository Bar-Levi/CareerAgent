import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import AuthenticationPage from './pages/AuthenticationPage';
import Dashboard from './pages/Dashboard';
import VerificationPage from './pages/VerificationPage';
import ResetPassword from './pages/ResetPassword';
import TermsAndConditions from './pages/TermsAndConditions';
import ResetLoginAttempts from './pages/ResetLoginAttempts';
import ChatsPage from './pages/ChatsPage';
import JobListingPage from './pages/JobListingPage';
import UnsubscribePage from './pages/Unsubscribe';
import LandingPage from './landingPage/LandingPage';
import FAQ from './pages/FAQ';
import SearchJobs from './jobCandidate/SearchJobs/pages/SearchJobs';
import ImproveCV from './jobCandidate/ImproveCV/pages/ImproveCV';
import socket from "./socket";
import RecruiterApplicantsTracker from './recruiter/pages/RecruiterApplicantsTracker';

function App() {
    const [onlineUsers, setOnlineUsers] = useState([]);

 
    useEffect(() => {
      // If the socket isn't already connected, connect it.
      if (!socket.connected) {
        socket.connect();
      }
  
      // Listen for updates on online users
      socket.on("updateOnlineUsers", (onlineUserIds) => {
  
        // Update state as needed (here we assume onlineUserIds is an array of user IDs)
        setOnlineUsers(onlineUserIds);
      });
  
      // Clean up on component unmount
      return () => {
        socket.off("updateOnlineUsers");
      };
    }, []);
  
    return (
        <>
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/authentication" element={<AuthenticationPage />} />
                <Route path="/unsubscribe" element={<UnsubscribePage />} />
                <Route path="/reset-login-attempts" element={<ResetLoginAttempts />} />
                <Route path="/joblisting/:id" element={<JobListingPage />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard onlineUsers={onlineUsers}/>
                        </ProtectedRoute>
                    }
                />
                <Route path="/verify" element={<VerificationPage />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/chats" element={
                    <ProtectedRoute>
                        <ChatsPage />
                    </ProtectedRoute>
                }/>
                <Route path="/FAQ" element={<FAQ />} />
                <Route path="/searchjobs" element={
                    <ProtectedRoute>
                        <SearchJobs onlineUsers={onlineUsers}/>
                    </ProtectedRoute>
                }/>
                <Route path="/improve-cv" element={
                    <ProtectedRoute>
                        <ImproveCV />
                    </ProtectedRoute>
                }/>
                <Route path="/recruiter-candidate-tracker" element={
                    <ProtectedRoute>
                        <RecruiterApplicantsTracker onlineUsers={onlineUsers}/>
                    </ProtectedRoute>
                }/>
                <Route path="*" element={<Navigate to="/dashboard"/>} />
        </Routes>
        </Router>
        </>
    );
}

export default App;
