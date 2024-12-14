import React from 'react';
import { motion } from 'framer-motion';

interface QuickReplyButtonProps {
  onClick: () => void;
  active: boolean;
}

const QuickReplyButton: React.FC<QuickReplyButtonProps> = ({ onClick, active }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`p-2 rounded-full transition-colors ${
      active
        ? 'bg-blue-600 text-white'
        : 'bg-gray-800/30 hover:bg-gray-700/30 text-gray-300'
    }`}
    onClick={onClick}
  >
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16m-7 6h7"
      />
    </svg>
  </motion.button>
);

export default QuickReplyButton;