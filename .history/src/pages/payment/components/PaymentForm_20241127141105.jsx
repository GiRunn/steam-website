// E:\Steam\steam-website\src\pages\payment\components\PaymentForm.jsx
import React, { useState } from 'react';
import { Button } from 'E:/Steam/steam-website/src/components/ui/button';
import { Input } from 'E:/Steam/steam-website/src/components/ui/input';
import { Lock, CreditCard, Calendar, User } from 'lucide-react';

const PaymentForm = ({ selectedMethod, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const [errors, setErrors] = useState({});

  // 表单验证
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.cardNumber = '请输入有效的16位卡号';
    }
    
    if (!formData.expiry.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      newErrors.expiry = '请输入有效的到期日期 (MM/YY)';
    }
    
    if (!formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = '请输入有效的安全码';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入持卡人姓名';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // 格式化卡号
    if (name === 'cardNumber') {
      formattedValue = value
        .replace(/\s/g, '')
        .match(/.{1,4}/g)
        ?.join(' ') || '';
    }

    // 格式化有效期
    if (name === 'expiry') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .substring(0, 5);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // 清除对应的错误信息
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (selectedMethod !== 'card') {
    return (
      <div className="bg-[#111827] p-6 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="w-48 h-48 bg-gray-800 mx-auto mb-4 rounded-lg flex items-center justify-center">
            <img
              src="/api/placeholder/200/200"
              alt="支付二维码"
              className="w-40 h-40 object-cover"
            />
          </div>
          <p className="text-gray-400 mb-4">
            请使用{selectedMethod === 'alipay' ? '支付宝' : '微信'}扫描二维码完成支付
          </p>
          <div className="flex items-center justify-center text-sm text-gray-400 mb-4">
            <Lock className="w-4 h-4 mr-1" />
            <span>安全支付由{selectedMethod === 'alipay' ? '支付宝' : '微信支付'}提供</span>
          </div>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "处理中..." : "已完成支付"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#111827] p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-6">输入支付信息</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            卡号
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              className={`pl-10 bg-[#1a2234] border-gray-700 ${
                errors.cardNumber ? 'border-red-500' : 'focus:border-blue-500'
              }`}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
            />
          </div>
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              有效期
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                name="expiry"
                value={formData.expiry}
                onChange={handleChange}
                className={`pl-10 bg-[#1a2234] border-gray-700 ${
                  errors.expiry ? 'border-red-500' : 'focus:border-blue-500'
                }`}
                placeholder="MM/YY"
                maxLength="5"
              />
            </div>
            {errors.expiry && (
              <p className="mt-1 text-sm text-red-500">{errors.expiry}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              安全码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="password"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                className={`pl-10 bg-[#1a2234] border-gray-700 ${
                  errors.cvv ? 'border-red-500' : 'focus:border-blue-500'
                }`}
                placeholder="CVV"
                maxLength="4"
              />
            </div>
            {errors.cvv && (
              <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            持卡人姓名
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`pl-10 bg-[#1a2234] border-gray-700 ${
                errors.name ? 'border-red-500' : 'focus:border-blue-500'
              }`}
              placeholder="请输入持卡人姓名"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Button
          type="submit"
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              处理中...
            </span>
          ) : (
            "确认支付"
          )}
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-center text-sm text-gray-400">
        <Lock className="w-4 h-4 mr-1" />
        <span>该页面使用SSL加密保护您的支付信息</span>
      </div>
    </form>
  );
};

export default PaymentForm;