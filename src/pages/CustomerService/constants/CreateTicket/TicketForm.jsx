// E:\Steam\steam-website\src\pages\CustomerService\components\CreateTicket\TicketForm.jsx
import React from 'react';
import { Send, Upload } from 'lucide-react';
import TicketTypes from './TicketTypes';
import { motion } from 'framer-motion'; // 添加这行
import { URGENCY_LEVELS } from '../../constants/ticketConfig';

const TicketForm = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = React.useState({
    type: '',
    title: '',
    content: '',
    urgency: 'medium',
    attachments: []
  });
  const [errors, setErrors] = React.useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = await onSubmit(formData);
    setErrors(newErrors || {});
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <TicketTypes
        selected={formData.type}
        onSelect={type => setFormData(prev => ({ ...prev, type }))}
        error={errors.type}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">工单标题</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="请简要描述您的问题..."
          className={`w-full px-4 py-3 bg-[#1a1f2c] border rounded-xl 
            text-white placeholder-gray-500 focus:outline-none transition-colors
            ${errors.title ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'}`}
        />
        {errors.title && (
          <span className="text-sm text-red-500">{errors.title}</span>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">详细描述</label>
        <textarea
          value={formData.content}
          onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="请详细描述您遇到的问题..."
          rows={6}
          className={`w-full px-4 py-3 bg-[#1a1f2c] border rounded-xl
            text-white placeholder-gray-500 focus:outline-none transition-colors resize-none
            ${errors.content ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'}`}
        />
        {errors.content && (
          <span className="text-sm text-red-500">{errors.content}</span>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">上传附件 (可选)</label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 
            border-2 border-gray-800 border-dashed rounded-xl cursor-pointer 
            bg-[#1a1f2c] hover:bg-[#252b3b] transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-400">
                <span className="font-medium">点击上传</span> 或拖拽文件至此处
              </p>
              <p className="text-xs text-gray-500">支持 PNG, JPG, PDF 格式文件</p>
            </div>
            <input
              type="file"
              className="hidden"
              multiple
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">紧急程度</label>
        <div className="flex items-center gap-4">
          {URGENCY_LEVELS.map(level => (
            <label key={level.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="urgency"
                value={level.id}
                checked={formData.urgency === level.id}
                onChange={e => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                className="form-radio text-blue-500 focus:ring-blue-500 bg-[#1a1f2c] border-gray-800"
              />
              <span className="text-gray-400">{level.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-4">
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl
            bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg
            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-blue-500/25'}`}
        >
          <Send className="w-5 h-5" />
          <span>{isSubmitting ? '提交中...' : '提交工单'}</span>
        </motion.button>
      </div>
    </form>
  );
};

export default TicketForm;