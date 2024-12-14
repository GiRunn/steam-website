// src/components/ui/Tooltip.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Tooltip = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 px-2 py-1 text-xs font-medium text-white 
                     bg-[#0a0f16] rounded-md shadow-lg whitespace-nowrap
                     left-1/2 -translate-x-1/2 -bottom-8"
          >
            {content}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 
                          border-4 border-transparent border-b-[#0a0f16]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};