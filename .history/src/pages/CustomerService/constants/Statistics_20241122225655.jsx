// E:\Steam\steam-website\src\pages\CustomerService\components\Statistics.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, MessageCircle } from 'lucide-react';
import { TICKET_STATUS } from '../constants/ticketConfig';

const Statistics = () => {
  const stats = [
    { label: '总服务工单', value: TICKET_STATUS.total, icon: FileText, color: 'blue' },
    { label: '处理中', value: TICKET_STATUS.processing, icon: Clock, color: 'yellow' },
    { label: '已解决', value: TICKET_STATUS.resolved, icon: CheckCircle, color: 'green' },
    { label: '满意度', value: `${TICKET_STATUS.satisfaction}%`, icon: MessageCircle, color: 'purple' }
  ];

  return (
    <div className="grid grid-cols-4 gap-6 mb-12">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-[#0f1621] rounded-xl p-6 hover:bg-[#1a1f2c] 
            transition-all duration-300 group cursor-pointer"
        >
          <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 
            flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
          </div>
          <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
          <div className="text-gray-400">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default Statistics;