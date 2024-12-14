// E:\Steam\steam-website\src\pages\payment\components\PaymentForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Loader2 } from 'lucide-react';

const PaymentForm = ({ selectedMethod, onSubmit, loading, product }) => {
  const navigate = useNavigate();
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
        }
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
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <h3 className="text-xl font-semibold mb-6">付款详情</h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="cardNumber">卡号</Label>
          <Input
            id="cardNumber"
            name="cardNumber"
            placeholder="**** **** **** ****"
            value={formData.cardNumber}
            onChange={handleInputChange}
            className="bg-[#1a2234] border-gray-700"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiryDate">有效期</Label>
            <Input
              id="expiryDate"
              name="expiryDate"
              placeholder="MM/YY"
              value={formData.expiryDate}
              onChange={handleInputChange}
              className="bg-[#1a2234] border-gray-700"
            />
          </div>
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              name="cvv"
              placeholder="***"
              type="password"
              maxLength="3"
              value={formData.cvv}
              onChange={handleInputChange}
              className="bg-[#1a2234] border-gray-700"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="name">持卡人姓名</Label>
          <Input
            id="name"
            name="name"
            placeholder="输入持卡人姓名"
            value={formData.name}
            onChange={handleInputChange}
            className="bg-[#1a2234] border-gray-700"
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
  );
};

export default PaymentForm;