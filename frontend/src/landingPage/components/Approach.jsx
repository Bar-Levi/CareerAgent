"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CanvasRevealEffect } from "./CanvasRevealEffect";
import mockInterviewImage from "../assets/mock-interview.png";

const Approach = () => {
  return (
    <section className="w-full py-20 bg-black">
      <motion.h2
        className="text-3xl text-center font-bold mb-8 text-gray-200"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        Our Features
      </motion.h2>

      <div className="my-20 flex flex-col lg:flex-row items-center justify-center gap-4">
        {/* Mock Interviews Card */}
        <Card
          title="Mock Interviews"
          icon={<AceternityIcon order="Mock Interviews" />}
          description="Simulate real-world interview scenarios."
          image={mockInterviewImage}
        >
          <CanvasRevealEffect
            animationSpeed={2}
            containerClassName="bg-black"
            colors={[
              [70, 40, 170],
              [5, 5, 5],
            ]}
            dotSize={20}
          />
        </Card>

        {/* Career Guidance Card */}
        <Card
          title="Career Guidance"
          icon={<AceternityIcon order="Phase 2" />}
          description="Get advice from AI-driven career bots."
        >
          <CanvasRevealEffect
            animationSpeed={2}
            containerClassName="bg-black"
            colors={[
              [236, 72, 153],
              [232, 121, 249],
            ]}
            dotSize={4}
          />
        </Card>

        {/* Progress Tracking Card */}
        <Card
          title="Progress Tracking"
          icon={<AceternityIcon order="Phase 3" />}
          description="Monitor your growth and stay on track."
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

const Card = ({ title, icon, children, description, image }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative border border-black/[0.2] group/canvas-card flex items-center justify-center dark:border-white/[0.2] max-w-sm w-full mx-auto p-4 lg:h-[35rem] rounded-3xl overflow-hidden bg-gray-800"
    >
      {/* Corner Plus Signs */}
    <span className="absolute h-6 w-6 -top-3 -left-3 text-gray-400 bg-white text-lg font-bold flex items-center justify-center">+</span>
    <span className="absolute h-6 w-6 -bottom-3 -left-3 text-gray-400 bg-white text-lg font-bold flex items-center justify-center">+</span>
    <span className="absolute h-6 w-6 -top-3 -right-3 text-gray-400 bg-white text-lg font-bold flex items-center justify-center">+</span>
    <span className="absolute h-6 w-6 -bottom-3 -right-3 text-gray-400 bg-white text-lg font-bold flex items-center justify-center">+</span>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full absolute inset-0 flex items-center justify-center"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20">
        <div className="text-center group-hover/canvas-card:-translate-y-4 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] group-hover/canvas-card:opacity-0 transition duration-200 w-full mx-auto flex items-center justify-center">
          {icon}
        </div>
        <h2 className="dark:text-white opacity-0 group-hover/canvas-card:opacity-100 relative z-10 text-black mt-4 font-bold group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200 text-center text-3xl">
          {title}
        </h2>
        <h2
          className="text-sm dark:text-white opacity-0 group-hover/canvas-card:opacity-100 relative z-10 text-black mt-4 font-bold group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200 text-center"
          style={{ color: "#e4ecff" }}
        >
          {description}
        </h2>
        {image && (
          <img
            src={image}
            alt={`${title} illustration`}
            className="rounded-xl opacity-0 group-hover/canvas-card:opacity-100 relative z-10 mt-4 transition duration-200"
            style={{
              bottom: "5%",
            }}
          />
        )}
      </div>
    </div>
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
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   fill="none"
    //   viewBox="0 0 24 24"
    //   strokeWidth="1.5"
    //   stroke="currentColor"
    //   className={className}
    //   {...rest}
    // >
    //   <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    // </svg>

    <span
      className={`text-white text-lg font-bold absolute ${className}`} // Ensure styling is applied
      {...rest}
    >
      +
    </span>

  );
};

export default Approach;
