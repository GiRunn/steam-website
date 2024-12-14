// src/pages/Homepage.jsx
import React, { useState, useEffect, useRef, memo } from 'react';
import { ChevronLeft, ChevronRight, Search, Moon, Sun, ArrowUp, Menu, Globe, Play, Clock, Tag, ArrowRight } from 'lucide-react';
import { LogIn, Settings, LogOut, ShoppingCart, Heart, MessageCircle } from 'lucide-react';
import { HeadphonesIcon, HelpCircle, Video, Download, Library } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import enLocale from '../locales/en';
import zhLocale from '../locales/zh';
import MenuStatusList from '../components/MenuStatusList';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

// ==================== Hero轮播图组件 ====================
const HeroSlider = memo(({ slides, currentSlide, setCurrentSlide }) => {
  return (
    <div className="relative h-[600px] overflow-hidden">
      <div
        className="flex transition-transform duration-500 h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="min-w-full h-full relative">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
              <h2 className="text-4xl font-bold text-white">{slide.title}</h2>
            </div>
          </div>
        ))}
      </div>
      
      <SliderControls 
        onPrev={() => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))}
        onNext={() => setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1))}
      />
    </div>
  );
});

HeroSlider.propTypes = {
  slides: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
  })).isRequired,
  currentSlide: PropTypes.number.isRequired,
  setCurrentSlide: PropTypes.func.isRequired
};