"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CanvasRevealEffect } from "./CanvasRevealEffect";
import mockInterviewImage from "../assets/mock-interview.png";
import cvScanningImage from "../assets/cv-scanning.png";
import recruiterCandidateImage from "../assets/recruiter-candidate.png";

const Features = () => {
  return (
    <section className="w-full py-20 bg-black">
      <motion.h2
        className="text-4xl text-center font-bold mb-8 text-gray-200 font-display tracking-tight"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        Our Features
      </motion.h2>

      <div className="my-20 flex flex-col lg:flex-row items-center justify-center gap-8">
        {/* Mock Interviews Card */}
        <Card
          title="Customized Chatbots"
          icon={<AceternityIcon order="Customized Chatbots" />}
          description="Experience two powerful AI-driven tools: an Interviewer chatbot to simulate real-world interview scenarios and a Career Advisor chatbot to guide your career journey."
          image={mockInterviewImage}
          index={3}
        >
          <CanvasRevealEffect
            animationSpeed={2}
            containerClassName="bg-black"
            colors={[
              [100, 170, 170],
              [150, 220, 220],
            ]}
            dotSize={4}
          />
        </Card>

        {/* Career Guidance Card */}
        <Card
          title="CV Scanning"
          icon={<AceternityIcon order="CV Scanning" />}
          description="Effortlessly extract key details from your CV with AI-powered scanning. Say goodbye to manual data entry and streamline your workflow in seconds."
          image={cvScanningImage}
          index={2}
        >
          <CanvasRevealEffect
            animationSpeed={2}
            containerClassName="bg-black"
            colors={[
              [100, 170, 170],
              [150, 220, 220]
            ]}
            dotSize={4}
          />
        </Card>

        {/* Recruiter-Candidate Chat Card */}
        <Card
          title="Recruiter-Candidate Chat"
          icon={<AceternityIcon order="Recruiter-Candidate Chat" />}
          description="Enable direct communication between recruiters and candidates for specific job positions, making the hiring process faster and more personalized."
          image={recruiterCandidateImage}
          index={1}
        >
          <CanvasRevealEffect
            animationSpeed={2}
            containerClassName="bg-purple"
            colors={[[125, 211, 252]]}
          />
        </Card>

      </div>
    </section>
  );
};

const Card = ({ title, icon, children, description, image, index = 1 }) => {
  const [hovered, setHovered] = React.useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, scale: 0.1 }}
      onViewportEnter={() => {
        if (!hasAnimated) {
          setHasAnimated(true);
        }
      }}
      animate={hasAnimated ? { opacity: 1, scale: 1 } : {}}
      transition={{
        duration: 0.1,
        delay: index * 0.2,
        ease: "easeInOut",
      }}
      className="border border-white/[0.5] group/canvas-card flex items-center justify-center max-w-md w-full mx-auto p-8 relative lg:h-[40rem] rounded-3xl overflow-hidden transition-transform ease-in-out duration-500 hover:scale-105"
    >
      {/* Corner Plus Signs */}
      <span className="absolute h-6 w-6 -top-3 -left-3 text-white bg-white text-lg font-bold flex items-center justify-center animate-slide-down" />
      <span className="absolute h-6 w-6 -bottom-3 -left-3 text-white bg-white text-lg font-bold flex items-center justify-center animate-slide-up" />
      <span className="absolute h-6 w-6 -top-3 -right-3 text-white bg-white text-lg font-bold flex items-center justify-center animate-slide-down-fast" />
      <span className="absolute h-6 w-6 -bottom-3 -right-3 text-white bg-white text-lg font-bold flex items-center justify-center animate-slide-up-fast" />

      {/* Hover Content */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full w-full absolute inset-0 flex items-center justify-center"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Static Content */}
      <div className="relative z-20">
        <div className="text-center group-hover/canvas-card:-translate-y-4 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] group-hover/canvas-card:opacity-0 transition duration-200 w-full mx-auto flex items-center justify-center animate-slide-up">
          {icon}
        </div>
        <motion.h2
          className="dark:text-white opacity-0 group-hover/canvas-card:opacity-100 relative z-10 text-black mt-6 font-bold group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200 text-center text-4xl animate-slide-in font-heading tracking-wide px-4"
          style={{
            textShadow: "0 0 10px rgba(0,0,0, 1), 0 0 10px rgba(0,0,0, 1)",
          }}
        >
          {title}
        </motion.h2>
        <h2
          className="text-lg dark:text-white opacity-0 group-hover/canvas-card:opacity-100 relative z-10 text-black mt-6 font-modern leading-relaxed group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200 text-center animate-slide-down px-6"
          style={{
            textShadow: "0 0 10px rgba(0,0,0, 1), 0 0 10px rgba(0,0,0, 1)",
          }}
        >
          {description}
        </h2>
        {image && (
          <img
            src={image}
            alt={`${title} illustration`}
            className="rounded-xl text-sm dark:text-white opacity-0 group-hover/canvas-card:opacity-100 relative z-10 text-black mt-4 font-bold group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200 text-center animate-slide-up-fast"
            style={{
              bottom: "5%",
            }}
          />
        )}
      </div>
    </motion.div>
  );
};




const AceternityIcon = ({ order }) => {
  return (
    <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-5 py-2 text-white backdrop-blur-3xl text-2xl font-bold">
        {order}
      </span>
    </button>
  );
};

export const Icon = ({ className, ...rest }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
};

export default Features;
