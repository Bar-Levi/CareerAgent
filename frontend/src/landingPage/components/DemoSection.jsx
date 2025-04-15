import React from "react";
import { motion } from "framer-motion";
import ParticlesComponent from "./ParticleComponent";
import chatbotImage from "../assets/chatbot-image.png";
import NavigationArrow from "./NavigationArrow";

const DemoSection = () => (
  <section
    id="demo-section"
    className="relative bg-black bg-cover bg-center h-screen flex items-center justify-center overflow-hidden"
  >
    {/* Particles Background */}
    <ParticlesComponent id="particles-demo" />

    {/* Content */}
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center z-10 relative py-16 px-6">
      {/* Left Content */}
      <motion.div
        className="max-w-lg text-center md:text-left md:pr-8 mb-8 md:mb-0"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl text-gray-100 font-extrabold mb-6 leading-tight">
          Unlock the Power of AI <br /> in Career Advisor
        </h2>
        <p className="text-lg text-gray-400 mb-6 leading-relaxed">
          Our AI-driven chatbots simulate real-world interview scenarios and provide career guidance tailored to your goals. Prepare confidently and effectively!
        </p>
      </motion.div>

      {/* Right Content */}
      <motion.div
        className="w-full md:w-1/2 flex justify-center"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-3/4 bg-gray-200 rounded-lg overflow-hidden shadow-md">
          <img
            src={chatbotImage}
            alt="Chatbot illustration"
            className="rounded-lg shadow-lg transition-transform duration-300 ease-in-out"
          />
        </div>
      </motion.div>
    </div>

    <NavigationArrow 
      targetId="features-section" 
      direction="up"
      className="z-[100] backdrop-blur-sm bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors" 
    />
    <NavigationArrow 
      targetId="testimonials-section" 
      direction="down"
      className="z-[100] backdrop-blur-sm bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors" 
    />
  </section>
);

export default DemoSection;
