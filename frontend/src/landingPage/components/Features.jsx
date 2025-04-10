import React, { useState, useMemo, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CanvasRevealEffect } from "./CanvasRevealEffect";
import mockInterviewImage from "../assets/mock-interview.png";
import cvScanningImage from "../assets/cv-scanning.png";
import recruiterCandidateImage from "../assets/recruiter-candidate.png";
import ParticlesComponent from "./ParticleComponent";

// Memoize ParticlesComponent to prevent re-renders
const MemoizedParticles = memo(ParticlesComponent);

const Features = () => {
  return (
    <section className="w-full py-16 md:py-24 bg-black relative min-h-screen flex flex-col items-center" id="features">
      {/* Particles - Ensure they are behind other content and non-interactive */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <MemoizedParticles id="particles-features" />
      </div>

      {/* Content Wrapper - Ensures content is above particles */}
      <div className="relative z-10 pt-8 md:pt-12 w-full max-w-7xl mx-auto flex-1 flex flex-col">
        <motion.h2
          className="text-5xl md:text-6xl text-center font-bold mb-12 text-gray-200 font-display"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          Our Features
        </motion.h2>

        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 px-4 md:px-8 flex-1">
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
                [150, 220, 220],
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
      </div>
    </section>
  );
};

const Card = ({ title, icon, children, description, image, index = 1 }) => {
  const [hovered, setHovered] = React.useState(false);

  const memoizedCanvasEffect = useMemo(() => children, [children]);
  const memoizedHoverParticles = useMemo(() => (
    <MemoizedParticles id={`particles-${title.toLowerCase().replace(/\s+/g, '-')}-hover`} />
  ), [title]);

  const memoizedHoverEffect = useMemo(() => {
    return (
      <AnimatePresence mode="wait">
        {hovered && (
          <motion.div
            key={`${title}-hover-effect`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            {memoizedHoverParticles}
            {memoizedCanvasEffect}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }, [hovered, memoizedHoverParticles, memoizedCanvasEffect, title]);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, scale: 0.1 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="border border-white/[0.2] group/canvas-card flex flex-col items-center justify-start w-full h-[60vh] sm:h-[65vh] lg:h-[70vh] p-[2vw] relative rounded-[1rem] overflow-hidden transition-all duration-500 hover:border-white/[0.5] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80 pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      />

      <div className="relative z-30 flex flex-col items-center justify-start h-full w-full">
        {/* Card Title/Button - Always visible, moves up on hover */}
        <motion.div 
          className="flex flex-col items-center pt-4 mb-8"
          animate={{ 
            y: hovered ? '-1vh' : 0,
            scale: hovered ? 0.95 : 1,
            filter: hovered ? "brightness(1.2)" : "brightness(1)"
          }}
          transition={{ 
            duration: 0.5,
            ease: [0.19, 1, 0.22, 1]
          }}
        >
          <div className="transform transition-all duration-500">
            {icon} 
          </div>
        </motion.div>

        {/* Card Content - Only visible on hover */}
        <motion.div 
          className="flex flex-col items-center px-[1vw] h-full justify-between"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: hovered ? 1 : 0
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Description */}
          <div className="flex-grow flex items-center justify-center pt-6 overflow-hidden">
            <motion.p 
              className="text-base sm:text-lg text-white text-center leading-relaxed max-w-[95%]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: hovered ? 1 : 0,
                y: hovered ? 0 : 20,
                scale: hovered ? 1 : 0.95
              }}
              transition={{ 
                duration: 0.5, 
                ease: [0.19, 1, 0.22, 1],
                delay: 0.1
              }}
            >
              {description}
            </motion.p>
          </div>
          
          {/* Image */}
          {image && (
            <div className="w-full flex justify-center items-center mt-4 mb-6">
              <motion.img
                src={image}
                alt={`${title} illustration`}
                className="w-auto max-w-[85%] h-auto max-h-[30vh] rounded-[0.5rem] object-contain"
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ 
                  scale: hovered ? 1 : 0.95, 
                  opacity: hovered ? 1 : 0,
                  y: hovered ? 0 : 15
                }}
                transition={{ 
                  duration: 0.5, 
                  ease: [0.19, 1, 0.22, 1],
                  delay: 0.2
                }}
                style={{ filter: "drop-shadow(0 0.5vw 1vw rgba(0,0,0,0.3))" }}
              />
            </div>
          )}
        </motion.div>
      </div>

      {memoizedHoverEffect}
    </motion.div>
  );
};

const AceternityIcon = ({ order }) => {
  return (
    <button className="relative inline-flex h-14 min-w-[15rem] overflow-hidden rounded-full p-[1px] focus:outline-none transition-all duration-300">
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-2 text-white backdrop-blur-3xl">
        <span className="text-[1.25rem] font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
          {order}
        </span>
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
