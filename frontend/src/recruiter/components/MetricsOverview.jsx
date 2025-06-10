import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBriefcase, FiUsers, FiCheckCircle } from "react-icons/fi";

const MetricsOverview = ({ metrics = {}, totalHired = 0, darkMode = false, isLoading = false }) => {
    // Local state to track the last valid data and smooth transitions
    const [displayMetrics, setDisplayMetrics] = useState(metrics);
    const [displayTotalHired, setDisplayTotalHired] = useState(totalHired);
    const [localLoading, setLocalLoading] = useState(isLoading);
    
    // Update displayed metrics only when data is valid and loading is complete
    useEffect(() => {
        if (!isLoading) {
            // Small delay to ensure smooth transition
            const timer = setTimeout(() => {
                setDisplayMetrics(metrics);
                setDisplayTotalHired(totalHired);
                setLocalLoading(false);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setLocalLoading(true);
        }
    }, [isLoading, metrics, totalHired]);
    
    // Animation variants for staggered children
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };
    
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", damping: 12 } }
    };

    // Animation variants for loading/content transitions
    const fadeInOut = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 }
    };

    // Pulse animation for loading indicators
    const pulseAnimation = {
        animate: { 
            opacity: [0.5, 0.8, 0.5] 
        },
        transition: { 
            repeat: Infinity, 
            duration: 1.2 
        }
    };
    
    return (
        <motion.div 
            className="w-full grid grid-cols-3 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
        >
            <motion.div 
                variants={item}
                className={`${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} 
                    rounded-xl p-2 px-3 min-w-[120px] shadow-lg backdrop-blur-md border transition-all duration-300 hover:shadow-xl
                    flex items-start space-x-2 hover:transform hover:scale-[1.02]`}
                whileHover={{ y: -3 }}
            >
                <div className={`p-2 rounded-full ${darkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-50 text-indigo-500'}`}>
                    <FiBriefcase className="w-4 h-4" />
                </div>
                <div className="flex-1">
                    <h3 className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Job Listings</h3>
                    <div className="flex items-baseline space-x-2 h-7">
                        <AnimatePresence mode="wait">
                            {localLoading ? (
                                <motion.div
                                    key="loading-active-listings"
                                    className={`h-5 w-8 rounded ${darkMode ? 'bg-indigo-900/30' : 'bg-indigo-100/80'}`}
                                    {...pulseAnimation}
                                    {...fadeInOut}
                                />
                            ) : (
                                <motion.div
                                    key="data-active-listings"
                                    {...fadeInOut}
                                    className="flex items-baseline space-x-2"
                                >
                                    <p className={`text-lg font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                        {displayMetrics.activeListings || 0}
                                    </p>
                                    {displayMetrics.activeListings > 0 && displayMetrics.previousActiveListings !== undefined && (
                                        <span className={`text-xs font-medium ${
                                            displayMetrics.activeListings > displayMetrics.previousActiveListings 
                                                ? 'text-green-500' 
                                                : displayMetrics.activeListings < displayMetrics.previousActiveListings 
                                                    ? 'text-red-500' 
                                                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            {displayMetrics.activeListings > displayMetrics.previousActiveListings 
                                                ? '↑' 
                                                : displayMetrics.activeListings < displayMetrics.previousActiveListings 
                                                    ? '↓' 
                                                    : '→'} 
                                        </span>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
            
            <motion.div 
                variants={item}
                className={`${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} 
                    rounded-xl p-2 px-3 min-w-[120px] shadow-lg backdrop-blur-md border transition-all duration-300 hover:shadow-xl
                    flex items-start space-x-2 hover:transform hover:scale-[1.02]`}
                whileHover={{ y: -3 }}
            >
                <div className={`p-2 rounded-full ${darkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-50 text-purple-500'}`}>
                    <FiUsers className="w-4 h-4" />
                </div>
                <div className="flex-1">
                    <h3 className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Applications</h3>
                    <div className="flex items-baseline space-x-2 h-7">
                        <AnimatePresence mode="wait">
                            {localLoading ? (
                                <motion.div
                                    key="loading-active-applications"
                                    className={`h-5 w-8 rounded ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100/80'}`}
                                    {...pulseAnimation}
                                    {...fadeInOut}
                                />
                            ) : (
                                <motion.div
                                    key="data-active-applications"
                                    {...fadeInOut}
                                >
                                    <p className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                        {displayMetrics.activeApplications || 0}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
            
            <motion.div 
                variants={item}
                className={`${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} 
                    rounded-xl p-2 px-3 min-w-[120px] shadow-lg backdrop-blur-md border transition-all duration-300 hover:shadow-xl
                    flex items-start space-x-2 hover:transform hover:scale-[1.02]`}
                whileHover={{ y: -3 }}
            >
                <div className={`p-2 rounded-full ${darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-50 text-green-500'}`}>
                    <FiCheckCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                    <h3 className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Hired</h3>
                    <div className="flex items-baseline space-x-2 h-7">
                        <AnimatePresence mode="wait">
                            {localLoading ? (
                                <motion.div
                                    key="loading-total-hired"
                                    className={`h-5 w-8 rounded ${darkMode ? 'bg-green-900/30' : 'bg-green-100/80'}`}
                                    {...pulseAnimation}
                                    {...fadeInOut}
                                />
                            ) : (
                                <motion.div
                                    key="data-total-hired"
                                    {...fadeInOut}
                                    className="flex items-baseline space-x-2"
                                >
                                    <p className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                        {displayTotalHired || 0}
                                    </p>
                                    {displayTotalHired > 0 && displayMetrics.previousTotalHired !== undefined && (
                                        <span className={`text-xs font-medium ${
                                            displayTotalHired > displayMetrics.previousTotalHired
                                                ? 'text-green-500'
                                                : darkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            {displayTotalHired > displayMetrics.previousTotalHired ? '↑' : '→'} 
                                        </span>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MetricsOverview;
