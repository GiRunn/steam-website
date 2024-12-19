import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './styles.css';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    icon: 'tachometer-alt',
    label: '仪表盘'
  },
  {
    id: 'system',
    icon: 'server',
    label: '系统监控',
    children: [
      { id: 'metrics', icon: 'chart-line', label: '性能指标' },
      { id: 'logs', icon: 'clipboard-list', label: '系统日志' },
      { id: 'alerts', icon: 'exclamation-triangle', label: '告警管理' }
    ]
  },
  {
    id: 'database',
    icon: 'database',
    label: '数据库监控',
    children: [
      { id: 'performance', icon: 'tachometer-alt', label: '性能监控' },
      { id: 'connections', icon: 'network-wired', label: '连接管理' },
      { id: 'backup', icon: 'save', label: '备份恢复' }
    ]
  },
  {
    id: 'settings',
    icon: 'cog',
    label: '系统设置'
  }
];

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems(current => 
      current.includes(id) 
        ? current.filter(item => item !== id)
        : [...current, id]
    );
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = activeItem === item.id;

    return (
      <div key={item.id} className="menu-item-wrapper">
        <motion.div
          className={`menu-item ${isActive ? 'active' : ''}`}
          style={{ paddingLeft: `${level * 20 + 16}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.id);
            } else {
              setActiveItem(item.id);
            }
          }}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="item-content">
            <i className={`fas fa-${item.icon}`}></i>
            <span>{item.label}</span>
          </div>
          {hasChildren && (
            <motion.i
              className="fas fa-chevron-right expand-icon"
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.div>

        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      className="sidebar glass-effect"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      <div className="sidebar-header">
        <motion.div 
          className="logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <i className="fas fa-chart-network"></i>
          <h2>监控系统</h2>
        </motion.div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      <div className="sidebar-footer">
        <motion.div 
          className="user-info"
          whileHover={{ scale: 1.02 }}
        >
          <div className="user-avatar">
            <i className="fas fa-user"></i>
          </div>
          <div className="user-details">
            <span className="user-name">管理员</span>
            <span className="user-role">系统管理员</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Sidebar; 