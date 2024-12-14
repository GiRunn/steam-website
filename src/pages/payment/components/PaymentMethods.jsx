// E:\Steam\steam-website\src\pages\payment\components\PaymentMethods.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Shield, Check, AlertCircle } from 'lucide-react';

// 支付方式卡片组件
const PaymentMethodCard = ({ method, isSelected, onSelect }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative p-5 rounded-lg cursor-pointer transition-all duration-300
      ${isSelected 
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-900/20' 
        : 'bg-[#1a2234] hover:bg-[#1f2937]'
      }`}
    onClick={() => onSelect(method.id)}
    role="button"
    aria-pressed={isSelected}
    tabIndex={0}
  >
    {/* 选中状态指示器 */}
    {isSelected && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -right-2 -top-2 bg-green-500 rounded-full p-1"
      >
        <Check className="w-4 h-4 text-white" />
      </motion.div>
    )}

    <div className="flex items-center justify-between gap-4">
      {/* 左侧内容 */}
      <div className="flex items-center space-x-4">
        <motion.div 
          className={`p-3 rounded-full ${
            isSelected ? 'bg-blue-500' : 'bg-[#111827]'
          }`}
          whileHover={{ rotate: 10 }}
        >
          <method.icon className={`w-6 h-6 ${
            isSelected ? 'text-white' : 'text-gray-300'
          }`} />
        </motion.div>
        
        <div className="space-y-1">
          <div className={`font-semibold text-lg ${
            isSelected ? 'text-white' : 'text-gray-200'
          }`}>
            {method.name}
          </div>
          <div className={`text-sm ${
            isSelected ? 'text-blue-100' : 'text-gray-400'
          }`}>
            {method.description}
          </div>
        </div>
      </div>

      {/* 右侧安全提示 */}
      <div className={`text-sm ${
        isSelected ? 'text-blue-100' : 'text-gray-400'
      }`}>
        <motion.div 
          className="flex items-center space-x-2"
          whileHover={{ x: 5 }}
        >
          <Shield className="w-4 h-4" />
          <span>{method.secureText}</span>
        </motion.div>
      </div>
    </div>

    {/* 底部安全提示 */}
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className={`mt-3 text-xs flex items-center space-x-1 ${
        isSelected ? 'text-blue-100' : 'text-gray-500'
      }`}
    >
      <AlertCircle className="w-3 h-3" />
      <span>该支付方式由Steam提供安全支付保障</span>
    </motion.div>
  </motion.div>
);

// 支付方式列表组件
const PaymentMethods = ({ selectedMethod, onSelect }) => {
  const methods = [
    {
      id: 'card',
      name: '信用卡支付',
      icon: CreditCard,
      description: '支持Visa、Mastercard、JCB等主流信用卡',
      secureText: '支持3D验证'
    },
    {
      id: 'alipay',
      name: '支付宝',
      icon: Shield,
      description: '使用支付宝APP或网页快捷支付',
      secureText: '蚂蚁金服担保'
    },
    {
      id: 'wechat',
      name: '微信支付',
      icon: Shield,
      description: '使用微信扫码即可完成支付',
      secureText: '微信安全支付'
    }
  ];

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="mb-6">
        <p className="text-gray-400 text-sm">请选择您偏好的支付方式完成订单</p>
      </div>

      {methods.map((method, index) => (
        <motion.div
          key={method.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <PaymentMethodCard
            method={method}
            isSelected={selectedMethod === method.id}
            onSelect={onSelect}
          />
        </motion.div>
      ))}

      <motion.div 
        className="mt-6 p-4 bg-[#1a2234] rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
          <div className="text-sm text-gray-400">
            <p className="text-gray-300 font-medium">安全支付保障</p>
            <p className="mt-1">
              所有支付信息经过加密处理，您的资金安全受到Steam平台保护。
              如有任何问题，可联系我们的24小时在线客服。
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentMethods;