// E:\Steam\steam-website\src\pages\payment\components\PaymentForm.jsx
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Loader2, AlertCircle } from 'lucide-react';

const PaymentForm = ({ selectedMethod = 'card', onSubmit, loading, product }) => {
  const navigate = useNavigate();
  
  // 如果没有product数据，重定向到商店页面
  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0f16] flex items-center justify-center p-4">
        <div className="bg-[#1a2234] rounded-lg p-6 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
          <h2 className="text-xl font-semibold text-white">无效的支付请求</h2>
          <p className="text-gray-400">
            请从商品页面正常进入支付流程
          </p>
          <Button
            onClick={() => navigate('/store')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 
                     hover:from-blue-700 hover:to-blue-800 text-white"
          >
            返回商店
          </Button>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 模拟支付处理
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 支付成功后跳转到成功页面
      navigate('/payment/success', {
        state: {
          product,
          paymentMethod: selectedMethod
        },
        replace: true // 使用replace而不是push，防止用户返回到支付页面
      });
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-[#0a0f16]">
      <div className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="bg-[#1a2234] rounded-lg shadow-xl p-6 space-y-6">
          <h3 className="text-xl font-semibold mb-6">付款详情</h3>

          <div className="space-y-4">
            <div>
              <label 
                htmlFor="cardNumber" 
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                卡号
              </label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="**** **** **** ****"
                value={formData.cardNumber}
                onChange={handleInputChange}
                className="bg-[#1a2234] border-gray-700"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label 
                  htmlFor="expiryDate" 
                  className="block text-sm font-medium text-gray-200 mb-1"
                >
                  有效期
                </label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="bg-[#1a2234] border-gray-700"
                  required
                />
              </div>
              <div>
                <label 
                  htmlFor="cvv" 
                  className="block text-sm font-medium text-gray-200 mb-1"
                >
                  CVV
                </label>
                <Input
                  id="cvv"
                  name="cvv"
                  placeholder="***"
                  type="password"
                  maxLength="3"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  className="bg-[#1a2234] border-gray-700"
                  required
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                持卡人姓名
              </label>
              <Input
                id="name"
                name="name"
                placeholder="输入持卡人姓名"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-[#1a2234] border-gray-700"
                required
              />
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 
                     hover:from-blue-700 hover:to-blue-800 text-white py-3"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                处理中...
              </>
            ) : (
              `确认支付 ¥${product?.price || 0}`
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;