import React from "react";
import { motion } from "framer-motion";
import { FiBriefcase, FiUsers, FiCheckCircle } from "react-icons/fi";

const MetricsOverview = ({ metrics, darkMode = false }) => {
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

    return (
        <motion.div 
            className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
        >
            <motion.div 
                variants={item}
                className={`${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} 
                    rounded-xl p-6 shadow-lg backdrop-blur-md border transition-all duration-300 hover:shadow-xl
                    flex items-start space-x-4 hover:transform hover:scale-[1.02]`}
                whileHover={{ y: -5 }}
            >
                <div className={`p-3 rounded-full ${darkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-50 text-indigo-500'}`}>
                    <FiBriefcase className="w-7 h-7" />
                </div>
                <div>
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Job Listings</h3>
                    <div className="flex items-baseline space-x-2">
                        <p className={`text-3xl font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
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
                                vs last month
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>
            
            <motion.div 
                variants={item}
                className={`${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} 
                    rounded-xl p-6 shadow-lg backdrop-blur-md border transition-all duration-300 hover:shadow-xl
                    flex items-start space-x-4 hover:transform hover:scale-[1.02]`}
                whileHover={{ y: -5 }}
            >
                <div className={`p-3 rounded-full ${darkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-50 text-purple-500'}`}>
                    <FiUsers className="w-7 h-7" />
                </div>
                <div>
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Applications</h3>
                    <div className="flex items-baseline space-x-2">
                        <p className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                            {metrics.totalApplications || 0}
                        </p>
                    </div>
                </div>
            </motion.div>
            
            <motion.div 
                variants={item}
                className={`${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} 
                    rounded-xl p-6 shadow-lg backdrop-blur-md border transition-all duration-300 hover:shadow-xl
                    flex items-start space-x-4 hover:transform hover:scale-[1.02]`}
                whileHover={{ y: -5 }}
            >
                <div className={`p-3 rounded-full ${darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-50 text-green-500'}`}>
                    <FiCheckCircle className="w-7 h-7" />
                </div>
                <div>
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Hired</h3>
                    <div className="flex items-baseline space-x-2">
                        <p className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                            {metrics.totalHired || 0}
                        </p>
                        {metrics.totalHired > 0 && metrics.previousTotalHired !== undefined && (
                            <span className={`text-xs font-medium ${
                                metrics.totalHired > metrics.previousTotalHired
                                    ? 'text-green-500'
                                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                                {metrics.totalHired > metrics.previousTotalHired ? '↑' : '→'} 
                                all time
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MetricsOverview;
