import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../../common/Card';
import Progress from '../../common/Progress';
import { useMonitor } from '../../../hooks/useMonitor';
import MetricsChart from '../../Charts/MetricsChart';
import ConnectionDetails from './ConnectionDetails';
import './SystemMonitor.css'; 