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
    <section className="w-full py-12 md:py-20 bg-black">
      <motion.h2
        className="text-6xl md:text-6xl text-center font-bold mb-8 text-gray-200 font-display tracking-tight px-4 ml-[-100px]"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        Our Features
      </motion.h2>

      <div className="my-8 md:my-20 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 px-4 md:px-8">
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
    </section>
  );
};

const Card = ({ title, icon, children, description, image, index = 1 }) => {
  const [hovered, setHovered] = React.useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Memoize the CanvasRevealEffect
  const memoizedCanvasEffect = useMemo(() => children, [children]);

  // Memoize the Particles component
  const memoizedParticles = useMemo(() => (
    <MemoizedParticles id={`particles-${title.toLowerCase().replace(/\s+/g, '-')}`} />
  ), [title]);

  const memoizedHoverEffect = useMemo(() => {
    return (
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {memoizedParticles}
            {memoizedCanvasEffect}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }, [hovered, memoizedParticles, memoizedCanvasEffect]);

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
      className="border border-white/[0.5] group/canvas-card flex flex-col items-center justify-center w-[90vw] sm:w-[80vw] lg:w-[25vw] h-[50vh] sm:h-[60vh] lg:h-[70vh] p-[2vw] relative rounded-[2vw] overflow-hidden transition-all duration-500 hover:scale-105 hover:border-white/80"
    >
      {/* Background Gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/90 transition-opacity duration-300 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`} 
      />

      {/* Static Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full w-full">
        {/* Icon with Title */}
        <div className={`flex flex-col items-center transition-all duration-300 ${
          hovered ? '-translate-y-[5vh]' : 'translate-y-0'
        }`}>
          <div className="mb-[2vh] transform transition-all duration-300">
            {icon}
          </div>
        </div>

        {/* Description and Image - Visible on Hover */}
        <div className={`flex flex-col items-center transition-all duration-300 px-[2vw] ${
          hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[2vh]'
        }`}>
          <p className="text-[2.5vw] sm:text-[1.8vw] lg:text-[1vw] text-white text-center mb-[2vh] max-w-[90%] leading-relaxed">
            {description}
          </p>

          {image && (
            <div className="w-full flex justify-center items-center">
              <img
                src={image}
                alt={`${title} illustration`}
                className={`w-auto max-w-[80%] h-auto max-h-[25vh] rounded-[1vw] object-contain transform transition-all duration-300 ${
                  hovered ? 'scale-105 opacity-100' : 'scale-95 opacity-0'
                }`}
                style={{
                  filter: "drop-shadow(0 0.5vw 1vw rgba(0,0,0,0.3))"
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Combined Effects */}
      {memoizedHoverEffect}
    </motion.div>
  );
};

const AceternityIcon = ({ order }) => {
  return (
    <button className="relative inline-flex min-h-[3rem] w-auto min-w-[12rem] overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-white backdrop-blur-3xl">
        <span className="text-[1.15rem] sm:text-[1.25rem] font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
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
