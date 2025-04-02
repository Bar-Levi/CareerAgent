import React from "react";
import { motion } from "framer-motion";
import ParticlesComponent from "./ParticleComponent";
import { useNavigate } from "react-router-dom";
import { SplineScene } from "../../components/ui/spline";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Particles Background */}
      <ParticlesComponent id="particles" />

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left content */}
          <div className="flex-1 p-8 md:p-12 relative z-10">
            <motion.h1
              className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 via-blue-100 to-gray-200 mb-8 leading-normal pb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              CareerAgent
            </motion.h1>
            <motion.div
              className="text-lg text-neutral-300 max-w-lg space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent p-6 transition-all duration-300 hover:from-blue-500/20">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600"></div>
                <span className="text-blue-400 font-semibold text-lg mb-2 block">For Job Seekers:</span>
                <p className="text-gray-300">
                  Leverage AI-powered CV analysis and engage with personalized chatbots for career guidance and interview preparation, maximizing your chances of landing the perfect role.
                </p>
              </div>
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-500/10 to-transparent p-6 transition-all duration-300 hover:from-emerald-500/20">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-emerald-600"></div>
                <span className="text-emerald-400 font-semibold text-lg mb-2 block">For Recruiters:</span>
                <p className="text-gray-300">
                  Experience a streamlined, interactive recruitment process designed to help you identify and connect with top talent efficiently and effectively.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-4 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.button
                onClick={() => navigate("/authentication")}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium overflow-hidden transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center">
                  Get Started
                  <svg className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 w-3 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[400px] transition-all duration-1000 ease-out transform -skew-x-12"></div>
              </motion.button>
              <motion.button
                className="group relative px-8 py-4 bg-black text-gray-300 font-medium overflow-hidden border border-blue-800/30 hover:border-blue-700/50 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center">
                  Learn More
                  <svg className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-800/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              </motion.button>
            </motion.div>
          </div>

          {/* Right content - 3D Scene */}
          <div className="flex-1 h-[600px] w-full relative">
            <SplineScene 
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Down Arrow */}
      <motion.div
        onClick={() => {
          document.getElementById("features-section")?.scrollIntoView({
            behavior: "smooth",
          });
        }}
        animate={{ y: [0, 10, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "loop",
        }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
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
    </section>
  );
};

export default Hero;
