// 主题配置文件
// 包含深色和浅色模式的所有颜色和样式配置

const themeConfig = {
  // 深色模式配置
  dark: {
    // 背景颜色
    background: {
      page: 'bg-[#1b2838]',
      primary: 'bg-[#1b2838]',
      secondary: 'bg-[#2a475e]/50',
      navbar: 'bg-[#2a475e]/80',
      sidebar: 'bg-[#2a475e]/50',
      content: 'bg-[#2a475e]/50',
      card: 'bg-[#2a475e]/50',
      hover: 'hover:bg-[#1b2838]/70',
      buttonHover: 'hover:bg-[#1b2838]/50',
      notification: 'bg-blue-900/20',
      footer: 'bg-[#1e2837]',
      gradient: 'from-blue-500 to-purple-500',
      loading: 'bg-gray-600',
      scrollTop: 'bg-gradient-to-r from-blue-500 to-purple-500',
      activeTab: 'bg-gradient-to-r from-blue-500 to-purple-500',
      hoverTab: 'bg-[#1b2838]/70',
      dangerHover: 'bg-red-500/10'
    },
    // 文本颜色
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      tertiary: 'text-gray-400',
      muted: 'text-gray-500',
      link: 'text-blue-400',
      linkHover: 'text-blue-500',
      danger: 'text-red-400',
      active: 'text-white',
      highlight: 'text-blue-400',
      scrollTop: 'text-white'
    },
    // 边框颜色
    border: {
      primary: 'border-gray-700',
      secondary: 'border-gray-600',
      focus: 'focus:border-blue-500',
      loading: 'border-gray-700'
    },
    // 阴影
    shadow: {
      primary: 'shadow-lg shadow-blue-900/5',
      button: 'shadow-lg shadow-blue-500/20'
    },
    // 图标颜色
    icon: {
      primary: 'text-gray-300',
      secondary: 'text-gray-400',
      social: 'text-gray-400',
      socialHover: 'text-white'
    },
    // 按钮颜色
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700',
      secondary: 'bg-gray-700 hover:bg-gray-600',
      danger: 'bg-red-600 hover:bg-red-700'
    },
    // 输入框
    input: {
      background: 'bg-[#1b2838]/70',
      border: 'border-gray-700',
      focus: 'focus:border-blue-500 focus:ring-blue-500/50'
    },
    // 状态颜色
    status: {
      success: 'text-green-400',
      warning: 'text-yellow-400',
      error: 'text-red-400',
      info: 'text-blue-400'
    }
  },
  
  // 浅色模式配置
  light: {
    // 背景颜色
    background: {
      page: 'bg-gray-100',
      primary: 'bg-gray-100',
      secondary: 'bg-white',
      navbar: 'bg-white/80',
      sidebar: 'bg-white',
      content: 'bg-white',
      card: 'bg-white',
      hover: 'hover:bg-gray-100',
      buttonHover: 'hover:bg-gray-200',
      notification: 'bg-blue-50',
      footer: 'bg-gray-900',
      gradient: 'from-blue-500 to-purple-500',
      loading: 'bg-gray-300',
      scrollTop: 'bg-gradient-to-r from-blue-500 to-purple-500',
      activeTab: 'bg-blue-500',
      hoverTab: 'bg-gray-100',
      dangerHover: 'bg-red-50'
    },
    // 文本颜色
    text: {
      primary: 'text-gray-800',
      secondary: 'text-gray-600',
      tertiary: 'text-gray-500',
      muted: 'text-gray-400',
      link: 'text-blue-500',
      linkHover: 'text-blue-600',
      danger: 'text-red-500',
      active: 'text-white',
      highlight: 'text-blue-500',
      scrollTop: 'text-white'
    },
    // 边框颜色
    border: {
      primary: 'border-gray-200',
      secondary: 'border-gray-300',
      focus: 'focus:border-blue-500',
      loading: 'border-gray-300'
    },
    // 阴影
    shadow: {
      primary: 'shadow-lg',
      button: 'shadow-lg shadow-blue-500/20'
    },
    // 图标颜色
    icon: {
      primary: 'text-gray-600',
      secondary: 'text-gray-500',
      social: 'text-gray-400',
      socialHover: 'text-gray-700'
    },
    // 按钮颜色
    button: {
      primary: 'bg-blue-500 hover:bg-blue-600',
      secondary: 'bg-gray-200 hover:bg-gray-300',
      danger: 'bg-red-500 hover:bg-red-600'
    },
    // 输入框
    input: {
      background: 'bg-white',
      border: 'border-gray-300',
      focus: 'focus:border-blue-500 focus:ring-blue-500/50'
    },
    // 状态颜色
    status: {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-blue-600'
    }
  },
  
  // 共享配置（不随主题变化的样式）
  shared: {
    // 圆角
    rounded: {
      sm: 'rounded',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full'
    },
    // 间距
    spacing: {
      xs: 'space-x-1 space-y-1',
      sm: 'space-x-2 space-y-2',
      md: 'space-x-4 space-y-4',
      lg: 'space-x-6 space-y-6'
    },
    // 过渡效果
    transition: {
      fast: 'transition-all duration-200',
      normal: 'transition-all duration-300',
      slow: 'transition-all duration-500'
    }
  },
  
  // 动画配置
  animation: {
    layout: {
      type: "spring", 
      stiffness: 400, 
      damping: 35,
      mass: 0.8
    },
    bounce: {
      type: "spring", 
      stiffness: 500, 
      damping: 15
    },
    smooth: {
      type: "spring", 
      stiffness: 300, 
      damping: 30
    }
  }
};

// 获取主题样式的辅助函数
export const getThemeStyles = (isDarkMode) => {
  const theme = isDarkMode ? themeConfig.dark : themeConfig.light;
  return {
    ...theme,
    animation: themeConfig.animation,
    shared: themeConfig.shared
  };
};

export default themeConfig; 