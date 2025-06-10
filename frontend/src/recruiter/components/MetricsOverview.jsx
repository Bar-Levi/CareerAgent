import React from "react";
import { motion } from "framer-motion";
import { FiBriefcase, FiUsers, FiCheckCircle } from "react-icons/fi";

const MetricsOverview = ({ metrics = {}, totalHired = 0, darkMode = false, isLoading = false }) => {
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
    
    // If loading, display a loading indicator within the metrics grid
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
                        {isLoading ? (
                            <motion.div
                                className={`h-5 w-8 rounded ${darkMode ? 'bg-indigo-900/30' : 'bg-indigo-100/80'}`}
                                animate={{ opacity: [0.5, 0.8, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.2 }}
                            />
                        ) : (
                            <>
                                <p className={`text-lg font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                    {metrics.activeListings || 0}
                                </p>
                                {metrics.activeListings > 0 && metrics.previousActiveListings !== undefined && (
                                    <span className={`text-xs font-medium ${
                                        metrics.activeListings > metrics.previousActiveListings 
                                            ? 'text-green-500' 
                                            : metrics.activeListings < metrics.previousActiveListings 
                                                ? 'text-red-500' 
                                                : darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                        {metrics.activeListings > metrics.previousActiveListings 
                                            ? '↑' 
                                            : metrics.activeListings < metrics.previousActiveListings 
                                                ? '↓' 
                                                : '→'} 
                                    </span>
                                )}
                            </>
                        )}
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
                        {isLoading ? (
                            <motion.div
                                className={`h-5 w-8 rounded ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100/80'}`}
                                animate={{ opacity: [0.5, 0.8, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.2 }}
                            />
                        ) : (
                            <p className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                {metrics.activeApplications || 0}
                            </p>
                        )}
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
                        {isLoading ? (
                            <motion.div
                                className={`h-5 w-8 rounded ${darkMode ? 'bg-green-900/30' : 'bg-green-100/80'}`}
                                animate={{ opacity: [0.5, 0.8, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.2 }}
                            />
                        ) : (
                            <>
                                <p className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                    {totalHired || 0}
                                </p>
                                {totalHired > 0 && metrics.previousTotalHired !== undefined && (
                                    <span className={`text-xs font-medium ${
                                        totalHired > metrics.previousTotalHired
                                            ? 'text-green-500'
                                            : darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                        {totalHired > metrics.previousTotalHired ? '↑' : '→'} 
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MetricsOverview;
