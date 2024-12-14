// src/pages/store/activity-detail/components/Registration/index.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './styles.module.css';

const Registration = ({ data }) => {
  const [formData, setFormData] = useState({
    ticketType: 'regular',
    quantity: 1,
    name: '',
    phone: '',
    email: '',
    agreement: false
  });

  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = '请输入姓名';
    if (!formData.phone.trim()) errors.phone = '请输入手机号';
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) errors.phone = '请输入正确的手机号';
    if (!formData.email.trim()) errors.email = '请输入邮箱';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = '请输入正确的邮箱';
    if (!formData.agreement) errors.agreement = '请同意活动协议';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      // 这里可以添加提交逻辑
      console.log('提交表单:', formData);
    } else {
      setFormErrors(errors);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // 清除对应的错误提示
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const calculateTotal = () => {
    const price = formData.ticketType === 'regular' ? data.price.regular : data.price.vip;
    return price * formData.quantity;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <div className="bg-[#1a1f26] rounded-lg p-6 md:p-8">
        <h2 className="text-3xl font-bold mb-6">活动报名</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 票种选择 */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className={`${styles.ticketOption} ${formData.ticketType === 'regular' ? styles.active : ''}`}>
              <input
                type="radio"
                name="ticketType"
                value="regular"
                checked={formData.ticketType === 'regular'}
                onChange={handleInputChange}
                className="hidden"
              />
              <div className="p-4 cursor-pointer">
                <h3 className="text-xl font-semibold mb-2">普通票</h3>
                <p className="text-gray-400 mb-2">基础活动参与权限</p>
                <p className="text-2xl font-bold text-blue-500">¥{data.price.regular}</p>
              </div>
            </div>

            <div className={`${styles.ticketOption} ${formData.ticketType === 'vip' ? styles.active : ''}`}>
              <input
                type="radio"
                name="ticketType"
                value="vip"
                checked={formData.ticketType === 'vip'}
                onChange={handleInputChange}
                className="hidden"
              />
              <div className="p-4 cursor-pointer">
                <h3 className="text-xl font-semibold mb-2">VIP票</h3>
                <p className="text-gray-400 mb-2">包含VIP专属特权</p>
                <p className="text-2xl font-bold text-blue-500">¥{data.price.vip}</p>
              </div>
            </div>
          </div>

          {/* 购票数量 */}
          <div className="flex items-center space-x-4">
            <label className="text-gray-400">购票数量：</label>
            <select
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className="bg-[#252a31] border border-gray-600 rounded px-3 py-2"
            >
              {[1,2,3,4,5].map(num => (
                <option key={num} value={num}>{num}张</option>
              ))}
            </select>
          </div>

          {/* 联系信息 */}
          <div className="space-y-4">
            <div>
              <input
                type="text"
                name="name"
                placeholder="姓名"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full bg-[#25