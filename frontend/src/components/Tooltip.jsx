import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState('bottom');
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (isVisible && containerRef.current && tooltipRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      // Check if there's enough space above
      const spaceAbove = containerRect.top;
      // Check if there's enough space below
      const spaceBelow = window.innerHeight - containerRect.bottom;
      
      // Calculate if tooltip would be cut off at top or bottom
      const wouldOverflowTop = spaceAbove < tooltipRect.height + 4;
      const wouldOverflowBottom = spaceBelow < tooltipRect.height + 4;
      
      // Default to bottom unless it would overflow and there's more space above
      const newPosition = wouldOverflowBottom && !wouldOverflowTop ? 'top' : 'bottom';
      setPosition(newPosition);
    }
  }, [isVisible]);

  return (
    <div 
      ref={containerRef}
      className="w-full relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: position === 'top' ? 5 : -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: position === 'top' ? 5 : -5 }}
            transition={{ duration: 0.2 }}
            className="absolute z-[9999] px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg"
            style={{
              ...(position === 'top'
                ? { bottom: 'calc(100% + 4px)' }
                : { top: 'calc(100% + 4px)' }
              ),
              left: '0',
              maxWidth: '300px',
              width: 'max-content'
            }}
          >
            {content}
            <div 
              className="absolute w-2 h-2 bg-gray-900 transform rotate-45"
              style={{
                ...(position === 'top'
                  ? { bottom: '-4px' }
                  : { top: '-4px' }
                ),
                left: '12px',
                transform: 'rotate(45deg)'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip; 