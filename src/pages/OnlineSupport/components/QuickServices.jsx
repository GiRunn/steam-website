import React from 'react';
import { MessageCircle } from 'lucide-react';

interface QuickServicesProps {
  services: string[];
  onServiceSelect?: (service: string) => void;
}

const QuickServices: React.FC<QuickServicesProps> = ({ services, onServiceSelect }) => (
  <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4">
    <div className="flex items-center space-x-2 mb-3">
      <MessageCircle className="w-4 h-4 text-blue-400" />
      <h3 className="text-sm font-medium text-gray-300">快捷服务</h3>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {services.map((service, index) => (
        <button
          key={index}
          className="p-3 bg-gray-700/30 hover:bg-gray-600/30 rounded-lg text-sm text-gray-300 transition-colors"
          onClick={() => onServiceSelect?.(service)}
        >
          {service}
        </button>
      ))}
    </div>
  </div>
);

export default QuickServices;