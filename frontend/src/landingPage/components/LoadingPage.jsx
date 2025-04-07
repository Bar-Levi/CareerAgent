import React from 'react';
import { motion } from 'framer-motion';

const LoadingPage = () => {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black z-[9999]" />
      
      {/* Content */}
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[10000]">
        <div className="relative w-full max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <h1 className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-8 leading-relaxed py-2">
                CareerAgent
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-xl text-gray-300 mb-16 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Loading your career journey...
            </motion.p>
          </motion.div>

          {/* Loading bar */}
          <div className="relative w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-1/2"
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-gray-400 font-light tracking-wider">
              Powered by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                AI-driven career solutions
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LoadingPage; 