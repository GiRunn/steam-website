// E:\Steam\steam-website\src\pages\CustomerService\constants\faqData.js
import { User, Lock, CreditCard, Gift, Download, HelpCircle } from 'lucide-react';

export const FAQ_CATEGORIES = [
  { id: 'account', name: '账号相关', icon: User, color: 'blue' },
  { id: 'security', name: '安全设置', icon: Lock, color: 'green' },
  { id: 'payment', name: '支付问题', icon: CreditCard, color: 'purple' },
  { id: 'game', name: '游戏相关', icon: Gift, color: 'yellow' },
  { id: 'download', name: '下载问题', icon: Download, color: 'orange' },
  { id: 'other', name: '其他问题', icon: HelpCircle, color: 'gray' }
];

export const FAQ_DATA = {
  account: [
    {
      id: 1,
      question: '如何修改账号密码？',
      answer: '您可以在账号设置中点击"修改密码"，按照提示完成密码修改。',
      views: 1234,
      helpful: 456
    }
  ]
  // ... 其他分类数据
};

// E:\Steam\steam-website\src\pages\CustomerService\constants\ticketConfig.js
export const ticketTypes = ['question', 'feedback', 'complaint', 'other'];

export const TICKET_STATUS = {
  total: 12500,
  processing: 234,
  resolved: 12266,
  satisfaction: 98.5,
  avgResponseTime: '2小时15分钟'
};

export const URGENCY_LEVELS = [
  { id: 'low', label: '低' },
  { id: 'medium', label: '中' },
  { id: 'high', label: '高' }
];