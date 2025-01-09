import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import AuthenticationForm from './components/AuthenticationForm';
import Dashboard from './pages/Dashboard';
import VerificationPage from './pages/VerificationPage';
import ResetPassword from './components/ResetPassword';
import TermsAndConditions from './components/TermsAndConditions';
import ResetLoginAttempts from './components/ResetLoginAttempts';
import ChatsPage from './pages/ChatsPage';
import LandingPage from './landingPage/LandingPage';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/authentication" element={<AuthenticationForm />} />
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
            </Routes>
        </Router>
    );
}

export default App;
