import React from "react";
import { motion } from "framer-motion";
import NavigationArrow from "./NavigationArrow";
import runningIcon from "../assets/goals/running.png";
import preciseIcon from "../assets/goals/precise.png";
import trackingIcon from "../assets/goals/tracking.png";
import notificationsIcon from "../assets/goals/notifications.png";
import ParticlesComponent from "./ParticleComponent";

const GoalItem = ({ image, text, index }) => {
  const variants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 20,
      rotateY: -15
    },
    visible: {
      opacity: 1, 
      scale: 1,
      y: 0,
      rotateY: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        delay: index * 0.2,
        duration: 0.7
      }
    },
    hover: { 
      scale: 1.05,
      y: -10,
      transition: { 
        type: "spring", 
        stiffness: 400,
        damping: 10 
      }
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center p-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl h-full"
      variants={variants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.div 
        className="w-28 h-28 mb-6 md:w-32 md:h-32 lg:w-36 lg:h-36"
        whileHover={{ rotate: [0, 5, -5, 0], transition: { duration: 0.5 } }}
      >
        <img src={image} alt={text} className="w-full h-full object-contain" />
      </motion.div>
      <motion.p 
        className="text-xl md:text-2xl font-semibold text-gray-100 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
        whileHover={{ letterSpacing: "0.05em", transition: { duration: 0.3 } }}
      >
        {text}
      </motion.p>
    </motion.div>
  );
};

const Goals = () => {
  const goals = [
    { image: runningIcon, text: "Faster Recruitement Process" },
    { image: preciseIcon, text: "Precise Job Matching" },
    { image: trackingIcon, text: "Intuitive Applicant Tracking" },
    { image: notificationsIcon, text: "Live Notifications" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  return (
    <section
      id="goals-section"
      className="relative bg-black min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Particles Background */}
      <ParticlesComponent id="particles-goals" />

      <div className="w-full max-w-7xl mx-auto px-4 py-12 relative z-10">
        <motion.h2
          className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 via-blue-100 to-gray-200 mb-8 leading-tight pb-2 tracking-tight font-display text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Our Goals
        </motion.h2>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 lg:gap-10 w-full py-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {goals.map((goal, index) => (
            <GoalItem
              key={index}
              image={goal.image}
              text={goal.text}
              index={index}
            />
          ))}
        </motion.div>
      </div>

      <NavigationArrow 
        targetId="testimonials-section" 
        direction="down"
        className="z-[100] backdrop-blur-sm bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors" 
      />
    </section>
  );
};

export default Goals; 