// E:\Steam\steam-website\src\pages\payment\components\PaymentMethods.jsx
import React from 'react';
import { CreditCard, Shield } from 'lucide-react';

const PaymentMethods = ({ selectedMethod, onSelect }) => {
  const methods = [
    {
      id: 'card',
      name: '信用卡',
      icon: CreditCard,
      description: '支持Visa、Mastercard、JCB等',
      secureText: '支持3D验证'
    },
    {
      id: 'alipay',
      name: '支付宝',
      icon: Shield,
      description: '使用支付宝快捷支付',
      secureText: '蚂蚁金服担保'
    },
    {
      id: 'wechat',
      name: '微信支付',
      icon: Shield,
      description: '使用微信扫码支付',
      secureText: '微信安全支付'
    }
  ];

  return (
    <div className="space-y-4">
      {methods.map((method) => (
        <div
          key={method.id}
          className={`p-4 rounded-lg cursor-pointer transition-all ${
            selectedMethod === method.id
              ? 'bg-blue-600 border-blue-500'
              : 'bg-[#1a2234] hover:bg-[#1f2937]'
          }`}
          onClick={() => onSelect(method.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${
                selectedMethod === method.id ? 'bg-blue-500' : 'bg-[#111827]'
              }`}>
                <method.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold">{method.name}</div>
                <div className="text-sm text-gray-400">{method.description}</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>{method.secureText}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentMethods;