import React from "react";
import { motion } from "framer-motion";
import ParticlesComponent from "./ParticleComponent";
import { useNavigate } from "react-router-dom";
import { SplineScene } from "../../components/ui/spline";
import { AnimatedButton } from "../../components/ui/AnimatedButton";
import { ChevronRight, ArrowRight } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section id="hero-section" className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Particles Background */}
      <ParticlesComponent id="particles" />

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left content */}
          <div className="flex-1 p-8 md:p-12 relative z-10">
            <motion.h1
              className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 via-blue-100 to-gray-200 mb-8 leading-tight pb-2 tracking-tight font-display"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              CareerAgent
            </motion.h1>
            <motion.div
              className="text-xl text-neutral-300 max-w-lg space-y-6 font-elegant"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent p-6 transition-all duration-300 hover:from-blue-500/20">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600"></div>
                <span className="text-xl text-blue-400 font-heading font-semibold mb-2 block tracking-wide">For Job Seekers:</span>
                <p className="text-lg text-gray-300 leading-relaxed font-modern tracking-wide">
                  Leverage AI-powered CV analysis and engage with personalized chatbots for career guidance and interview preparation, maximizing your chances of landing the perfect role.
                </p>
              </div>
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-500/10 to-transparent p-6 transition-all duration-300 hover:from-emerald-500/20">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-emerald-600"></div>
                <span className="text-xl text-emerald-400 font-heading font-semibold mb-2 block tracking-wide">For Recruiters:</span>
                <p className="text-lg text-gray-300 leading-relaxed font-modern tracking-wide">
                  Experience a streamlined, interactive recruitment process designed to help you identify and connect with top talent efficiently and effectively.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-6 mt-12 justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <AnimatedButton
                onClick={() => navigate("/authentication")}
                className="bg-gradient-to-b from-blue-600 to-blue-700 border-blue-400/50 hover:from-blue-500 hover:to-blue-600"
                icon={ChevronRight}
              >
                Get Started
              </AnimatedButton>
              <AnimatedButton
                className="bg-gradient-to-b from-emerald-600 to-emerald-700 border-emerald-400/50 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-500/20"
                icon={ArrowRight}
                onClick={() => {
                  document.getElementById("features-section")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                Learn More
              </AnimatedButton>
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
    </section>
  );
};

export default Hero;
