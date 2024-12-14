// E:\Steam\steam-website\src\pages\payment\components\OrderSummary.jsx
import React from 'react';
import { Shield, Info, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

// 价格项组件
const PriceItem = ({ label, amount, icon: Icon, info }) => (
  <motion.div 
    className="flex justify-between items-center text-gray-300 py-2 hover:bg-[#1c2538] rounded-lg px-2 transition-colors duration-200"
    whileHover={{ scale: 1.01 }}
  >
    <div className="flex items-center space-x-2">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      <span>{label}</span>
      {info && (
        <div className="group relative">
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-[#1a2234] text-sm text-gray-300 rounded-lg shadow-xl">
            {info}
          </div>
        </div>
      )}
    </div>
    <span className="font-medium">${amount.toFixed(2)}</span>
  </motion.div>
);

// 安全保障组件
const SecurityGuarantee = () => (
  <motion.div 
    className="mt-6 bg-[#1a2234] rounded-lg p-4 hover:bg-[#1c2538] transition-colors duration-200"
    whileHover={{ scale: 1.01 }}
  >
    <div className="flex items-start space-x-3">
      <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
      <div className="text-sm text-gray-400">
        <p className="text-gray-300 font-medium">Steam官方购买保障</p>
        <p className="mt-1">该商品享受Steam官方购买保障，如有问题可随时退款。我们承诺：</p>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>7天无理由退款</li>
          <li>24小时客服支持</li>
          <li>账户资金安全保障</li>
        </ul>
      </div>
    </div>
  </motion.div>
);

// 支付条款组件
const TermsAndPolicy = () => (
  <div className="px-6 py-4 bg-[#1a2234] rounded-b-lg">
    <p className="text-sm text-gray-400 text-center">
      点击支付即表示您同意我们的
      <a href="/terms" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200 mx-1">
        服务条款
      </a>
      和
      <a href="/privacy" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200 mx-1">
        隐私政策
      </a>
    </p>
  </div>
);

// 主组件
const OrderSummary = ({ product }) => {
  const tax = product.price * 0.1;
  const total = product.price + tax;

  return (
    <motion.div 
      className="bg-[#111827] rounded-lg shadow-lg border border-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">订单摘要</h3>
          <CreditCard className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-2">
          <PriceItem 
            label="商品价格" 
            amount={product.price} 
            icon={CreditCard}
            info="商品的基础价格，不含税费"
          />
          
          <PriceItem 
            label="税费" 
            amount={tax}
            info="根据您所在地区的税率计算"
          />
          
          <motion.div 
            className="pt-4 mt-4 border-t border-gray-700"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex justify-between font-bold text-white text-lg">
              <span>总计</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </motion.div>
        </div>

        <SecurityGuarantee />
      </div>

      <TermsAndPolicy />
    </motion.div>
  );
};

export default OrderSummary;