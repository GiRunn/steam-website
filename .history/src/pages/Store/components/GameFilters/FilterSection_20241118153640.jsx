// src/pages/Store/components/GameFilters/FilterSection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '@/components/ui/Tooltip';

const FilterSection = ({ title, icon: Icon, items, selected, onChange, showCount }) => {
  const handleToggle = (id) => {
    const newSelected = selected.includes(id)
      ? selected.filter(item => item !== id)
      : [...selected, id];
    onChange(newSelected);
  };

  return (
    <div className="bg-[#1a1f2e] rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map(item => (
          <motion.label
            key={item.id}
            className="flex items-center justify-between group cursor-pointer"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center
                  ${selected.includes(item.id)
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-600 group-hover:border-blue-500'
                  }`}
              >
                {selected.includes(item.id) && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                )}
              </div>
              <span className="text-gray-300 group-hover:text-white transition-colors">
                {item.label}
              </span>
            </div>
            {showCount && (
              <span className="text-gray-500 text-sm">
                {item.count.toLocaleString()}
              </span>
            )}
          </motion.label>
        ))}
      </div>
    </div>
  );
};