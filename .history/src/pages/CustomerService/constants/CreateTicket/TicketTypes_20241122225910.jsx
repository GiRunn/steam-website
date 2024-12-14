// E:\Steam\steam-website\src\pages\CustomerService\components\CreateTicket\TicketTypes.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, MessageCircle, AlertCircle, FileText } from 'lucide-react';

const TICKET_TYPE_CONFIG = [
  { id: 'question', name: '问题咨询', icon: HelpCircle },
  { id: 'feedback', name: '意见反馈', icon: MessageCircle },
  { id: 'complaint', name: '投诉建议', icon: AlertCircle },
  { id: 'other', name: '其他', icon: FileText }
];

const TicketTypes = ({ selected, onSelect, error }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-400">工单类型</label>
      <div className="grid grid-cols-2 gap-4">
        {TICKET_TYPE_CONFIG.map(item => (
          <motion.button
            key={item.id}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(item.id)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors
              ${selected === item.id
                ? 'border-blue-500 bg-blue-500/10 text-white'
                : 'border-gray-800 bg-[#1a1f2c] text-gray-400 hover:bg-[#252b3b]'}`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </motion.button>
        ))}
      </div>
      {error && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
};

export default TicketTypes;