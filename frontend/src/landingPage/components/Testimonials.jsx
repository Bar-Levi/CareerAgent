import React, { useState, memo, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import ParticlesComponent from "./ParticleComponent";
import NavigationArrow from "./NavigationArrow";

// Memoize ParticlesComponent to prevent re-renders
const MemoizedParticles = memo(ParticlesComponent);

const testimonials = [
  {
    id: 1,
    testimonial: "This platform helped find excellent candidates to my team!",
    author: "Bar Levi, Senior R&D Team Lead"
  },
  {
    id: 2,
    testimonial: "The career bots provided advice that was spot-on!",
    author: "Rony Bubnovsky, Mid-Senior Backend Developer"
  },
  {
    id: 3,
    testimonial: "Goo-Goo-Gaa-Gaaaa!",
    author: "Agam Levi, New-Born Software Developer"
  },
  {
    id: 4,
    testimonial: "The site was super helpful for finding skilled Docker experts for my team!",
    author: "Rom Ihia, Senior Docker Expert & Recruiter"
  }
];

const TestimonialCard = memo(({ handleShuffle, testimonial, position, id, author }) => {
  const dragRef = React.useRef(0);
  const isFront = position === 0;

  const getImagePath = () => {
    try {
      return require(`../assets/testimonials/${id}.jpg`);
    } catch (e) {
      try {
        return require(`../assets/testimonials/${id}.png`);
      } catch (e) {
        return `https://i.pravatar.cc/128?img=${id}`;
      }
    }
  };

  const imagePath = getImagePath();
  
  const { rotation, xOffset, yOffset, scale } = useMemo(() => ({
    rotation: position * 5,
    xOffset: position * 25,
    yOffset: position * 10,
    scale: 1 - (position * 0.05)
  }), [position]);

  const handleDragStart = useCallback((e) => {
    dragRef.current = e.clientX;
  }, []);

  const handleDragEnd = useCallback((e) => {
    if (dragRef.current - e.clientX > 150) {
      handleShuffle();
    }
    dragRef.current = 0;
  }, [handleShuffle]);

  const motionStyles = useMemo(() => ({
    zIndex: testimonials.length - position
  }), [position]);

  const motionAnimate = useMemo(() => ({
    rotate: `${-rotation}deg`,
    x: `${xOffset}%`,
    y: `${yOffset}px`,
    scale
  }), [rotation, xOffset, yOffset, scale]);

  return (
    <motion.div
      style={motionStyles}
      animate={motionAnimate}
      whileHover={isFront ? { scale: 1.02, rotate: 0 } : {}}
      drag={true}
      dragElastic={0.35}
      dragListener={isFront}
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      transition={{ 
        duration: 0.4,
        ease: "easeOut"
      }}
      className={`absolute left-0 top-0 grid h-[450px] w-[350px] select-none place-content-center space-y-6 rounded-3xl border border-slate-700/50 bg-slate-900/40 p-8 backdrop-blur-lg shadow-2xl ${
        isFront ? "cursor-grab active:cursor-grabbing hover:border-indigo-500/50" : ""
      }`}
    >
      <img
        src={imagePath}
        alt={`Avatar of ${author}`}
        className="pointer-events-none mx-auto h-32 w-32 rounded-full border-2 border-slate-700/50 bg-slate-800 object-cover ring-2 ring-slate-600/50 ring-offset-2 ring-offset-slate-900"
      />
      <span className="text-center text-xl italic text-slate-200 font-light leading-relaxed">"{testimonial}"</span>
      <span className="text-center text-sm font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{author}</span>
    </motion.div>
  );
});

const ArrowButton = memo(({ onClick }) => {
  return (
    <div className="absolute left-[-200px] top-1/2 -translate-y-1/2 z-20">
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="group"
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-slate-900/80 backdrop-blur-sm border border-purple-500/30 group-hover:border-purple-500/50 transition-colors">
            <svg
              className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            </svg>
          </div>
        </div>
      </motion.button>
    </div>
  );
});

const Testimonials = () => {
  const [positions, setPositions] = useState(testimonials.map((_, index) => index));

  const handleShuffle = useCallback(() => {
    const newPositions = [...positions];
    newPositions.unshift(newPositions.pop());
    setPositions(newPositions);
  }, [positions]);

  return (
    <section
      id="testimonials-section"
      className="relative bg-black bg-cover bg-center min-h-screen flex items-center justify-center overflow-hidden py-20"
    >
      <MemoizedParticles id="particles-testimonials" />

      <div className="max-w-6xl mx-auto text-center px-4 z-10 relative">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-6xl font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 font-display tracking-tight"
        >
          What Our Users Say
        </motion.h2>
        <div className="relative h-[450px] w-[350px] mx-auto">
          <div className="absolute inset-0">
            <ArrowButton onClick={handleShuffle} />
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                {...testimonial}
                handleShuffle={handleShuffle}
                position={positions[index]}
              />
            ))}
          </div>
        </div>
      </div>

      <NavigationArrow 
        targetId="demo-section" 
        direction="up"
        className="z-[100] backdrop-blur-sm bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors" 
      />
    </section>
  );
};

export default Testimonials;
