// src/pages/Community/PostDetail/components/SubscribeNotification/index.jsx
import React, { useState } from 'react';
import { Bell, Zap, CheckCircle } from 'lucide-react';
import PropTypes from 'prop-types';

const SubscribeNotification = ({ 
  isSubscribed = false,
  onSubscribe,
  onUnsubscribe,
  loading = false 
}) => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    
    try {
      if (isSubscribed) {
        await onUnsubscribe?.();
      } else {
        await onSubscribe?.();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Subscription action failed:', error);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 mb-6 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Bell className={`w-5 h-5 mr-2 ${isSubscribed ? 'text-blue-400' : 'text-yellow-400'}`} />
          <div>
            <h3 className="font-medium">
              {isSubscribed ? '已订阅帖子更新' : '订阅帖子更新'}
            </h3>
            <p className="text-sm text-gray-400">
              {isSubscribed ? '将继续接收最新回复和更新提醒' : '获取最新回复和更新提醒'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleClick}
          disabled={loading}
          className={`
            px-4 py-2 rounded-lg flex items-center transition-all
            ${isSubscribed 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-transparent" />
          ) : (
            <>
              {isSubscribed ? '取消订阅' : '订阅'}
              {!isSubscribed && <Zap className="w-4 h-4 ml-1" />}
            </>
          )}
        </button>
      </div>
      
      {/* 成功提示 */}
      <div 
        className={`
          absolute bottom-0 left-0 right-0 bg-green-500 text-white p-2
          transform transition-transform duration-300 flex items-center justify-center
          ${showSuccess ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <CheckCircle className="w-4 h-4 mr-1" />
        订阅成功
      </div>
    </div>
  );
};

SubscribeNotification.propTypes = {
  isSubscribed: PropTypes.bool,
  onSubscribe: PropTypes.func,
  onUnsubscribe: PropTypes.func,
  loading: PropTypes.bool
};

export default React.memo(SubscribeNotification);