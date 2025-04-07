import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { state } = useLocation();
    const token = localStorage.getItem('token');
    if (!state || !isAuthenticated(token)) {
        return <Navigate to="/authentication" replace />;
    }
    return children;
};

export default ProtectedRoute;
