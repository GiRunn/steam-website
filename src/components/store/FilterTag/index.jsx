import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import './styles.css';

const FilterTag = ({ label, active, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`filter-tag ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="tag-label">{label}</span>
      {active && (
        <X className="remove-icon" />
      )}
    </motion.button>
  );
};

export default FilterTag;