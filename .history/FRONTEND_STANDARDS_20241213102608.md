# Steam Website 前端开发规范

## 1. 项目结构规范

### 1.1 目录结构
```
frontend/
├── src/
│   ├── components/           # 全局通用组件
│   │   ├── ui/              # 基础UI组件
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── Button.module.css
│   │   │   ├── Input/
│   │   │   ├── Alert/
│   │   │   ├── Modal/
│   │   │   ├── Toast/
│   │   │   ├── Tooltip/
│   │   │   └── VideoPlayer/
│   │   ├── layout/          # 布局组件
│   │   │   ├── Navbar/
│   │   │   └── Footer/
│   │   └── shared/          # 共享组件
│   │       ├── LoadingScreen/
│   │       └── ErrorBoundary/
│   │
│   ├── pages/               # 页面组件
│   │   ├── home/           # 首页模块
│   │   │   ├── components/
│   │   │   │   ├── HeroSlider/
│   │   │   │   ├── ProductFeatures/
│   │   │   │   ├── BrandShowcase/
│   │   │   │   └── VideoSection/
│   │   │   ├── constants.js
│   │   │   └── index.jsx
│   │   │
│   │   ├── store/          # 商城模块
│   │   │   ├── components/
│   │   │   │   ├── FilterSection/
│   │   │   │   ├── SearchBar/
│   │   │   │   ├── GameSection/
│   │   │   │   ├── EventSection/
│   │   │   │   └── RecommendSection/
│   │   │   ├── GameDetail/  # 游戏详情
│   │   │   │   ├── components/
│   │   │   │   └── index.jsx
│   │   │   └── index.jsx
│   │   │
│   │   ├── Community/      # 社区模块
│   │   │   ├── components/
│   │   │   ├── PostDetail/  # 帖子详情
│   │   │   └── index.jsx
│   │   │
│   │   ├── CustomerService/ # 客服中心
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   └── index.jsx
│   │   │
│   │   ├── OnlineSupport/  # 在线客服
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   ├── hooks/
│   │   │   └── index.jsx
│   │   │
│   │   ├── VideoGuides/    # 视频指南
│   │   │   ├── components/
│   │   │   ├── constants/
│   │   │   └── index.jsx
│   │   │
│   │   └── payment/        # 支付系统
│   │       ├── components/
│   │       ├── utils/
│   │       └── index.jsx
│   │
│   ├── contexts/           # 全局上下文
│   │   └── ThemeContext.js
│   │
│   ├── hooks/              # 自定义Hooks
│   │   ├── useAuth.js
│   │   ├── useApi.js
│   │   └── useClickOutside.js
│   │
│   ├── services/           # API服务
│   │   ├── api.ts
│   │   ├── authService.js
│   │   └── gameService.ts
│   │
│   ├── utils/             # 工具函数
│   │   ├── validation.js
│   │   ├── security.ts
│   │   └── performance.ts
│   │
│   └── styles/            # 全局样式
│       ├── global.css
│       └── theme.css
```

[继续之前的其他规范内容...]

