// E:\Steam\steam-website\src\pages\payment\components\OrderSummary.jsx
import React from 'react';
import { Shield, Info } from 'lucide-react';

const OrderSummary = ({ product }) => {
  const tax = product.price * 0.1;
  const total = product.price + tax;

  return (
    <div className="bg-[#111827] rounded-lg shadow-lg">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-6">订单摘要</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between text-gray-300">
            <span>商品价格</span>
            <span>${product.price.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-gray-300">
            <div className="flex items-center">
              <span>税费</span>
              <Info className="w-4 h-4 ml-1 text-gray-400" />
            </div>
            <span>${tax.toFixed(2)}</span>
          </div>
          
          <div className="pt-4 mt-4 border-t border-gray-700">
            <div className="flex justify-between font-bold text-white">
              <span>总计</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-[#1a2234] rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
            <div className="text-sm text-gray-400">
              <p className="text-gray-300 font-medium">购买保障</p>
              <p className="mt-1">该商品享受Steam官方购买保障，如有问题可随时退款</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-[#1a2234] rounded-b-lg">
        <p className="text-sm text-gray-400 text-center">
          点击支付即表示您同意我们的
          <a href="#" className="text-blue-400 hover:underline">服务条款</a>
          和
          <a href="#" className="text-blue-400 hover:underline">隐私政策</a>
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;