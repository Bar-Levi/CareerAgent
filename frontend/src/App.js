import React from 'react';
import RegistrationForm from './components/RegistrationForm';
import Dashboard from './pages/Dashboard';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VerificationPage from './pages/VerificationPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<RegistrationForm />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/verify" element={<VerificationPage />} />
            </Routes>
        </Router>
    );
}

export default App;
