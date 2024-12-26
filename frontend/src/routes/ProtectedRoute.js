import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { state } = useLocation();
    if (!isAuthenticated() || !state) {
        return <Navigate to="/" replace />;
    }
    return children;
};

export default ProtectedRoute;
