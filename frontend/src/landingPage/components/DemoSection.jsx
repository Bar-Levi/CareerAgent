import React from "react";
import { motion } from "framer-motion";
import ParticlesComponent from "./ParticleComponent";

const DemoSection = () => (
  <section className="relative bg-gray-600 bg-cover bg-center h-screen flex items-center justify-center overflow-hidden">
    {/* Particles Background */}
    <ParticlesComponent id="particles-demo" />

    {/* Content */}
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center z-10 relative py-16">
      <motion.div
        className="max-w-lg text-center md:text-left mb-8 md:mb-0"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl text-gray-200 font-bold mb-4">See how our bots help you prepare</h2>
        <p className="text-gray-600">
          Experience the power of AI in mock interviews and career guidance.
        </p>
      </motion.div>
      <motion.div
        className="w-full md:w-1/2"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full h-64 bg-gray-200 rounded-lg">
          Chatbot Demo (Placeholder)
        </div>
      </motion.div>
    </div>
  </section>
);

export default DemoSection;
