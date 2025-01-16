import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { state } = useLocation();
    console.log("state: " + JSON.stringify(state));
    if (!isAuthenticated(state.token) || !state) {
        return <Navigate to="/" replace />;
    }
    return children;
};

export default ProtectedRoute;
