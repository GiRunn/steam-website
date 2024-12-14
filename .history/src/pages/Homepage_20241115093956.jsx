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

