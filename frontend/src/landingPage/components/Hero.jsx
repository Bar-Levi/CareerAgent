import React from "react";
import { motion } from "framer-motion";
import ParticlesComponent from "./ParticleComponent";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  // Helper function to split text into individual spans
  const renderTextWithSpans = (text) => {
    return text.split("").map((char, index) => (
      <span
        key={index}
        className="relative text-gray-900 transition-all duration-700 ease-in-out opacity-20 hover:text-gray-300 hover:opacity-100 font-sans-serif"
        style={{
          display: "inline-block",
          textShadow: "0 0 30px rgba(255, 255, 255, 1), 0 0 30px rgba(255, 255, 255, 1)",
        }}
      >
        {char === " " ? "\u00A0" : char} {/* Preserve spaces */}
      </span>
    ));
  };
  

  return (
    <section className="relative bg-black bg-cover bg-center h-screen flex items-center justify-center overflow-hidden">
      {/* Particles Background */}
      <ParticlesComponent id="particles" />

      {/* Content */}
      <div className="text-center px-4 sm:px-8 z-10">
        {/* Title with hover effect */}
        <motion.h1
          className="font-heading font-extrabold mb-4 text-gray-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{
            fontSize: "clamp(2rem, 10vw, 8rem)", // Dynamically adjusts between 2rem and 8rem
            lineHeight: "1.1", // Ensure the line height matches the size
          }}
        >
          {renderTextWithSpans("CAREER AGENT")}
        </motion.h1>



        <motion.p
          className="text-3xl sm:text-5xl font-heading font-extrabold text-gray-300 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Connecting Talent and Opportunity
        </motion.p>

        {/* Subtitle */}
        <motion.p
          className="text-xl sm:text-4xl text-gray-300 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Bridging the gap between recruiters and candidates
        </motion.p>

        {/* Buttons */}
        <div className="flex justify-center space-x-4">
          <motion.button
            className="border border-gray-400 text-gray-400 py-3 px-6 rounded-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white transition transform hover:scale-105 shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => navigate("/authentication")}
          >
            Get Started
          </motion.button>
          <motion.button
            className="border border-gray-400 text-gray-400 py-3 px-6 rounded-lg hover:bg-gradient-to-r hover:from-green-400 hover:to-teal-500 hover:text-white transition transform hover:scale-105 shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Learn More
          </motion.button>
        </div>

        {/* Down Arrow */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop",
          }}
          className="flex justify-center mt-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="gray"
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
