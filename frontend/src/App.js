import React from 'react';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VerificationPage from './pages/VerificationPage';
import AuthenticationForm from './components/AuthenticationForm';
import ResetPassword from './components/ResetPassword';
import TermsAndConditions from './components/TermsAndConditions';





function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AuthenticationForm />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/verify" element={<VerificationPage />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            </Routes>
        </Router>
    );
}

export default App;
