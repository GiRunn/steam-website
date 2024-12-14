import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnnouncementCarouselProps {
  announcements: string[];
}

const AnnouncementCarousel: React.FC<AnnouncementCarouselProps> = ({ announcements }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 mb-4">
      <div className="flex items-center space-x-2 mb-3">
        <Bell className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-medium text-gray-300">最新公告</h3>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm text-gray-400"
        >
          {announcements[currentIndex]}
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-center space-x-1 mt-3">
        {announcements.map((_, idx) => (
          <div
            key={idx}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'bg-blue-500 w-3' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default AnnouncementCarousel;