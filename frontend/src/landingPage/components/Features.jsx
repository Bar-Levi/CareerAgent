import React from "react";
import { motion } from "framer-motion";
import ParticlesComponent from "./ParticleComponent";

const Features = () => (
  <section className="relative bg-gray-600 bg-cover bg-center h-screen flex items-center justify-center overflow-hidden">
    {/* Particles Background */}
    <ParticlesComponent id="particles-features" />

    {/* Content */}
    <div className="max-w-6xl mx-auto text-center z-10 relative">
      <motion.h2
        className="text-3xl font-bold mb-8 text-gray-200"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        Our Features
      </motion.h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <motion.div
          className="p-6 bg-white shadow-lg rounded-lg"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h3 className="text-xl font-semibold mb-2">Mock Interviews</h3>
          <p className="text-gray-600">
            Simulate real-world interview scenarios.
          </p>
        </motion.div>
        <motion.div
          className="p-6 bg-white shadow-lg rounded-lg"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold mb-2">Career Guidance</h3>
          <p className="text-gray-600">
            Get advice from AI-driven career bots.
          </p>
        </motion.div>
        <motion.div
          className="p-6 bg-white shadow-lg rounded-lg"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
          <p className="text-gray-600">Monitor your growth and stay on track.</p>
        </motion.div>
      </div>
    </div>
  </section>
);

export default Features;
