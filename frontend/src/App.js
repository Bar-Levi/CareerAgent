import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import AuthenticationForm from './components/AuthenticationForm';
import Dashboard from './pages/Dashboard';
import VerificationPage from './pages/VerificationPage';
import ResetPassword from './components/ResetPassword';
import TermsAndConditions from './components/TermsAndConditions';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AuthenticationForm />} />
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
            </Routes>
        </Router>
    );
}

export default App;
