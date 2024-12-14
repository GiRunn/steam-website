// E:\Steam\steam-website\src\pages\CustomerService\components\ContactSection.jsx
import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';

const ContactSection = () => {
  return (
    <>
      <h3 className="text-lg font-bold mb-2">需要更多帮助？</h3>
      <p className="text-white/80 mb-4">创建工单获取专业客服支持</p>
      <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 
        transition-colors rounded-lg px-4 py-2">
        <Plus className="w-5 h-5" />
        <span>创建工单</span>
      </button>

      <div className="bg-[#0f1621] rounded-xl p-6 mt-6">
        <h3 className="text-lg font-bold text-white mb-4">联系我们</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-[#1a1f2c] rounded-lg">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-white">在线客服</div>
              <div className="text-sm text-gray-400">7x24小时</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactSection;