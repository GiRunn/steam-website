// src/pages/Community/PostDetail/components/ActiveUsers/index.jsx
import React from 'react';
import { Users, Award } from 'lucide-react';
import { MAX_DISPLAY_USERS } from '../../utils/constants';

const ActiveUsers = () => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2 text-green-400" />
        活跃用户
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {Array(MAX_DISPLAY_USERS).fill(0).map((_, index) => (
          <div key={index} className="text-center">
            <div className="w-12 h-12 rounded-full bg-gray-700 mx-auto mb-2 relative">
              <img
                src={`/api/placeholder/48/48`}
                alt={`活跃用户 ${index + 1}`}
                className="rounded-full"
                loading="lazy"
              />
              {index < 3 && (
                <div className="absolute -top-1 -right-1">
                  <Award className="w-4 h-4 text-yellow-400" />
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400 block truncate">用户{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveUsers;