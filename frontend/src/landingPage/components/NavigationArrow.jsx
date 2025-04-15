import React from 'react';
import { motion } from 'framer-motion';

const NavigationArrow = ({ targetId, direction = 'down', className = '' }) => {
  const handleClick = () => {
    document.getElementById(targetId)?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <motion.div
      onClick={handleClick}
      animate={{ y: direction === 'down' ? [0, 10, 0] : [0, -10, 0] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'loop',
      }}
      className={`absolute ${direction === 'down' ? 'bottom-8' : 'top-8'} left-1/2 transform -translate-x-1/2 cursor-pointer ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="white"
        className={`w-8 h-8 ${direction === 'up' ? 'rotate-180' : ''}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 12.75L12 20.25L4.5 12.75"
        />
      </svg>
    </motion.div>
  );
};

export default NavigationArrow;