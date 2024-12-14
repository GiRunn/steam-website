// E:\Steam\steam-website\src\pages\payment\PaymentSuccess.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, paymentMethod } = location.state || {};

  if (!product) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0f16] text-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-[#111827] rounded-lg shadow-lg p-8">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">支付成功！</h1>
          <p className="text-gray-400 mb-6">
            感谢您购买 {product.name}
          </p>
          
          <div className="bg-[#1a2234] rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">订单金额</span>
              <span className="font-bold">¥{product.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">支付方式</span>
              <span>{paymentMethod === 'card' ? '信用卡' : 
                     paymentMethod === 'alipay' ? '支付宝' : '微信支付'}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/library')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              前往游戏库
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full bg-transparent border-gray-700 text-gray-300 
                hover:bg-gray-800"
            >
              返回商店
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;