import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { state } = useLocation();
    const token = localStorage.getItem('token');
    
    // Check for bypass flag
    const bypassAuthCheck = localStorage.getItem('bypassAuthCheck') === 'true';
    
    // If bypass is set, clear it immediately (one-time use)
    if (bypassAuthCheck) {
        localStorage.removeItem('bypassAuthCheck');
    }
    
    // Allow access if the bypass flag is set or normal authentication passes
    if ((bypassAuthCheck && token) || (state && isAuthenticated(token))) {
        return children;
    }
    
    return <Navigate to="/authentication" replace />;
};

export default ProtectedRoute;
