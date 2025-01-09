import React from "react";
import { motion } from "framer-motion";
import ParticlesComponent from "./ParticleComponent";
import { useNavigate } from 'react-router-dom';


const Hero = () => {
    const navigate = useNavigate();

  return (
    <section className="relative bg-gray-600 bg-cover bg-center h-screen flex items-center justify-center overflow-hidden">
      {/* Particles Background */}
      <ParticlesComponent id="particles" />

      {/* Content */}
      <div className="text-center px-4 sm:px-8 z-10">
        <motion.h1
          className="text-4xl sm:text-6xl font-heading font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Connecting Talent and Opportunity
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl text-white mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Bridging the gap between recruiters and candidates
        </motion.p>
        <div className="flex justify-center space-x-4">
          <motion.button
            className="border border-white text-white py-3 px-6 rounded-lg hover:bg-gray-100 hover:text-gray-800 transition transform hover:scale-105 shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => navigate('/authentication')}
          >
            Get Started
          </motion.button>
          <motion.button
            className="border border-white text-white py-3 px-6 rounded-lg hover:bg-gray-100 hover:text-gray-800 transition transform hover:scale-105 shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Learn More
          </motion.button>
          
        </div>
        <motion.div
      animate={{ y: [0, 10, 0] }} // Animate y-position
      transition={{
        duration: 1.5, // Duration of one cycle
        repeat: Infinity, // Repeat forever
        repeatType: "loop", // No pause between cycles
      }}
      className="flex justify-center mt-8"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="white"
        className="w-8 h-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 12.75L12 20.25L4.5 12.75"
        />
      </svg>
    </motion.div>
      </div>
    </section>
  );
};

export default Hero;
