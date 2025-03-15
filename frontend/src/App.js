import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import AuthenticationPage from './pages/AuthenticationPage';
import Dashboard from './pages/Dashboard';
import VerificationPage from './pages/VerificationPage';
import ResetPassword from './pages/ResetPassword';
import TermsAndConditions from './pages/TermsAndConditions';
import ResetLoginAttempts from './pages/ResetLoginAttempts';
import ChatsPage from './pages/ChatsPage';
import UnsubscribePage from './pages/Unsubscribe';
import LandingPage from './landingPage/LandingPage';
import FAQ from './pages/FAQ';
import SearchJobs from './jobCandidate/SearchJobs/pages/SearchJobs';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <>
        <ToastContainer position="top-right" autoClose={5000} />
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/authentication" element={<AuthenticationPage />} />
                <Route path="/unsubscribe" element={<UnsubscribePage />} />
                <Route path="/reset-login-attempts" element={<ResetLoginAttempts />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
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
                        <SearchJobs />
                    </ProtectedRoute>
                    } />

            </Routes>
        </Router>
        </>
    );
}

export default App;
