// src/components/ui/Toast.jsx
// Toast 通知提示组件 - 用于显示操作反馈、错误提示等临时信息
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// ToastMessage 子组件 - 处理单个消息的显示
const ToastMessage = ({ message, type = 'info', onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="flex items-center gap-3 min-w-[300px] bg-[#0a0f16] border border-gray-800/50 
        rounded-lg shadow-lg px-4 py-3 mb-2"
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      
      <p className="flex-1 text-gray-200 text-sm font-['Inter']">
        {message}
      </p>

      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-500 hover:text-gray-400 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// Toast 容器组件 - 管理多个消息的显示和消失
export const Toast = {
  messages: new Set(),
  listeners: new Set(),

  // 显示一个新的消息
  show(message, type = 'info', duration = 3000) {
    const id = Date.now();
    const toast = { id, message, type };
    
    this.messages.add(toast);
    this.notifyListeners();

    // 自动关闭
    if (duration > 0) {
      setTimeout(() => {
        this.hide(id);
      }, duration);
    }

    return id;
  },

  // 隐藏指定消息
  hide(id) {
    this.messages.forEach(toast => {
      if (toast.id === id) {
        this.messages.delete(toast);
        this.notifyListeners();
      }
    });
  },

  // 隐藏所有消息
  hideAll() {
    this.messages.clear();
    this.notifyListeners();
  },

  // 通知所有监听器状态更新
  notifyListeners() {
    this.listeners.forEach(listener => listener(Array.from(this.messages)));
  },

  // 用于在组件中显示消息列表的组件
  Container() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
      const listener = (messages) => setToasts(messages);
      Toast.listeners.add(listener);
      return () => Toast.listeners.delete(listener);
    }, []);

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastMessage
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => Toast.hide(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  }
};

// useToast hook - 提供更方便的函数式调用方式
export const useToast = () => {
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    return Toast.show(message, type, duration);
  }, []);

  const hideToast = useCallback((id) => {
    Toast.hide(id);
  }, []);

  const hideAllToasts = useCallback(() => {
    Toast.hideAll();
  }, []);

  return {
    show: showToast,
    hide: hideToast,
    hideAll: hideAllToasts,
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration) => showToast(message, 'error', duration),
    info: (message, duration) => showToast(message, 'info', duration),
  };
};

// 使用示例:
// 1. 在 App.jsx 中渲染容器
// import { Toast } from '@/components/ui/Toast';
// 
// function App() {
//   return (
//     <>
//       <Toast.Container />
//       {/* 其他组件 */}
//     </>
//   );
// }
//
// 2. 在组件中使用
// import { useToast } from '@/components/ui/Toast';
//
// function MyComponent() {
//   const toast = useToast();
//
//   const handleSuccess = () => {
//     toast.success('操作成功！');
//   };
//
//   const handleError = () => {
//     toast.error('出错了！');
//   };
//
//   const handleInfo = () => {
//     toast.info('提示信息');
//   };
//
//   const handleCustom = () => {
//     const id = toast.show('自定义消息', 'success', 5000);
//     // 可以用 id 来手动关闭
//     // toast.hide(id);
//   };
//
//   return <button onClick={handleSuccess}>显示提示</button>;
// }