# Steam Website 前端开发规范

## 1. 技术栈规范

### 1.1 核心技术
- React 18
- Next.js 13+
- TypeScript 5+
- TailwindCSS
- Redux Toolkit (状态管理)

### 1.2 开发工具
- ESLint
- Prettier
- Husky
- Jest & React Testing Library
- Cypress (E2E测试)

## 2. 项目结构规范

### 2.1 目录结构
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
│   │   │   └── Modal/
│   │   ├── layout/          # 布局组件
│   │   │   ├── Navbar/
│   │   │   └── Footer/
│   │   └── shared/          # 共享组件
│   │
│   ├── features/            # 功能模块
│   │   ├── auth/           # 认证模块
│   │   ├── store/          # 商城模块
│   │   └── community/      # 社区模块
│   │
│   ├── pages/              # 页面组件
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   ├── index.tsx
│   │   └── [...slug].tsx
│   │
│   ├── hooks/              # 自定义Hooks
│   ├── services/           # API服务
│   ├── store/              # Redux存储
│   ├── types/              # TypeScript类型定义
│   ├── utils/              # 工具函数
│   └── styles/             # 全局样式
│
├── public/                 # 静态资源
├── tests/                  # 测试文件
│   ├── unit/
│   └── e2e/
├── .eslintrc.js           # ESLint配置
├── .prettierrc            # Prettier配置
├── jest.config.js         # Jest配置
├── next.config.js         # Next.js配置
└── tsconfig.json          # TypeScript配置
```

### 2.2 功能模块结构
每个功能模块应遵循以下结构：
```
feature/
├── components/            # 模块组件
├── hooks/                # 模块专用hooks
├── services/            # 模块API服务
├── store/               # 模块状态管理
│   ├── slice.ts
│   └── selectors.ts
├── types/               # 模块类型定义
├── utils/              # 模块工具函数
└── index.ts           # 模块导出
```

## 3. 编码规范

### 3.1 TypeScript规范

```typescript
// 使用interface定义对象类型
interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
}

// 使用type定义联合类型或交叉类型
type ButtonVariant = 'primary' | 'secondary' | 'danger';
type Theme = 'light' | 'dark';

// 组件Props类型定义
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant;
  isLoading?: boolean;
  children: React.ReactNode;
}

// 确保所有函数都有明确的返回类型
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### 3.2 组件规范

```tsx
// 组件文件结构示例 (Button.tsx)
import { FC } from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  onClick,
  children
}) => {
  const handleClick = () => {
    if (!isLoading && onClick) {
      onClick();
    }
  };

  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]}`}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};
```

### 3.3 Hooks规范

```typescript
// 自定义Hook示例
import { useState, useEffect } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi<T>(
  fetchFn: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchFn();
        setData(result);
        options.onSuccess?.(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        options.onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
```

## 4. 命名规范

### 4.1 文件命名
- 组件文件：使用 PascalCase（如 `Button.jsx`）
- 工具文件：使用 camelCase（如 `validation.js`）
- 样式文件：使用 camelCase（如 `styles.module.css`）
- 常量文件：使用 camelCase（如 `constants.js`）

### 4.2 组件命名
```jsx
// 组件命名示例
const GameCard = () => {
  return <div className="game-card">...</div>;
};

export default GameCard;
```

### 4.3 CSS类命名
采用BEM命名规范：
```css
.block__element--modifier {
  /* 样式 */
}

/* 示例 */
.game-card__title--highlighted {
  color: #fff;
}
```

## 5. 组件开发规范

### 5.1 组件结构
```jsx
// 标准组件结构
import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.css';

const ComponentName = ({ prop1, prop2 }) => {
  // 1. Hooks声明
  const [state, setState] = useState(null);

  // 2. 副作用
  useEffect(() => {
    // 副作用逻辑
  }, [dependencies]);

  // 3. 事件处理
  const handleEvent = () => {
    // 处理逻辑
  };

  // 4. 渲染
  return (
    <div className={styles.container}>
      {/* JSX内容 */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.required,
  prop2: PropTypes.number
};

export default ComponentName;
```

### 5.2 样式规范
```css
/* styles.module.css */
.container {
  /* 布局样式 */
  display: flex;
  padding: 1rem;

  /* 主题样式 */
  background: var(--bg-primary);
  color: var(--text-primary);

  /* 响应式设计 */
  @media (max-width: 768px) {
    flex-direction: column;
  }
}
```

## 6. 状态管理规范

### 6.1 Context使用
```jsx
// contexts/ThemeContext.js
export const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {}
});

// 使用示例
const { theme } = useContext(ThemeContext);
```

### 6.2 自定义Hook规范
```jsx
// hooks/useAuth.js
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hook逻辑
  
  return { user, loading };
};
```

## 7. 页面组件规范

### 7.1 页面组件结构
```jsx
// pages/store/index.jsx
const StorePage = () => {
  // 1. 数据获取
  const { data, loading } = useQuery(...);

  // 2. 页面状态管理
  const [filters, setFilters] = useState({});

  // 3. 布局结构
  return (
    <div className="store-page">
      <Header />
      <main>
        <FilterSection />
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
};
```

## 8. UI组件规范

### 8.1 按钮组件
```jsx
// components/ui/Button.jsx
const Button = ({ 
  children, 
  variant = 'primary',
  size = 'medium',
  ...props 
}) => {
  return (
    <button 
      className={`btn btn--${variant} btn--${size}`}
      {...props}
    >
      {children}
    </button>
  );
};
```

### 8.2 输入组件
```jsx
// components/ui/Input.jsx
const Input = ({ 
  label,
  error,
  ...props 
}) => {
  return (
    <div className="input-wrapper">
      {label && <label>{label}</label>}
      <input {...props} />
      {error && <span className="error">{error}</span>}
    </div>
  );
};
```

## 9. 主题规范

### 9.1 颜色变量
```css
:root {
  /* 主题色 */
  --bg-primary: #0a0f16;
  --text-primary: #ffffff;
  --text-secondary: #9ca3af;
  
  /* 功能色 */
  --error: #ef4444;
  --success: #10b981;
  --warning: #f59e0b;
}
```

### 9.2 字体规范
```css
:root {
  /* 字体家族 */
  --font-primary: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI";
  --font-secondary: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI";
  
  /* 字体大小 */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
}
```

## 10. 性能优化规范

### 10.1 图片优化
```jsx
// 使用next/image优化图片
import Image from 'next/image';

const GameCard = ({ image }) => (
  <Image
    src={image}
    width={300}
    height={200}
    loading="lazy"
    alt="Game thumbnail"
  />
);
```

### 10.2 代码分割
```jsx
// 路由级别的代码分割
const GameDetail = lazy(() => import('./pages/store/GameDetail'));

// 使用Suspense
<Suspense fallback={<LoadingScreen />}>
  <GameDetail />
</Suspense>
```

## 11. 测试规范

### 11.1 组件测试
```jsx
// __tests__/components/Button.test.jsx
describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## 12. 文档规范

### 12.1 组件文档
```jsx
/**
 * 游戏卡片组件
 * @component
 * @param {Object} props
 * @param {string} props.title - 游戏标题
 * @param {string} props.image - 游戏图片URL
 * @param {number} props.price - 游戏价格
 * @example
 * return (
 *   <GameCard
 *     title="Game Title"
 *     image="/images/game.jpg"
 *     price={29.99}
 *   />
 * )
 */
```

## 13. API调用规范

### 13.1 API服务配置
```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    // 统一错误处理
    if (error.response?.status === 401) {
      // 处理未授权
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 13.2 API服务封装
```typescript
// services/game.ts
import api from './api';
import { Game, GameQuery } from '@/types';

export const gameService = {
  getGames: async (params: GameQuery) => {
    return await api.get<Game[]>('/games', { params });
  },
  
  getGameById: async (id: string) => {
    return await api.get<Game>(`/games/${id}`);
  },
  
  purchaseGame: async (gameId: string, payload: any) => {
    return await api.post(`/games/${gameId}/purchase`, payload);
  }
};
```

## 14. 错误处理规范

### 14.1 全局错误边界
```tsx
// components/ErrorBoundary.tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 发送错误到监控服务
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### 14.2 API错误处理
```typescript
// utils/error.ts
export class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: unknown) => {
  if (error instanceof APIError) {
    // 处理API错误
    switch (error.status) {
      case 400:
        // 处理请求错误
        break;
      case 401:
        // 处理未授权
        break;
      case 403:
        // 处理禁止访问
        break;
      case 404:
        // 处理未找到
        break;
      default:
        // 处理其他错误
    }
  } else {
    // 处理未知错误
    console.error('Unknown error:', error);
  }
};
```

## 15. 国际化规范

### 15.1 配置
```typescript
// i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: require('./locales/en.json')
      },
      zh: {
        translation: require('./locales/zh.json')
      }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

### 15.2 使用示例
```tsx
// components/GameCard.tsx
import { useTranslation } from 'react-i18next';

export const GameCard: FC<GameCardProps> = ({ game }) => {
  const { t } = useTranslation();
  
  return (
    <div className={styles.card}>
      <h3>{game.title}</h3>
      <p>{t('game.price', { price: game.price })}</p>
      <button>{t('common.buyNow')}</button>
    </div>
  );
};
```

## 16. 安全规范

### 16.1 XSS防护
```typescript
// utils/security.ts
import DOMPurify from 'dompurify';

export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
};
```

### 16.2 敏感数据处理
```typescript
// utils/security.ts
export const maskCreditCard = (number: string): string => {
  return `****-****-****-${number.slice(-4)}`;
};

export const maskEmail = (email: string): string => {
  const [name, domain] = email.split('@');
  return `${name[0]}***@${domain}`;
};
```

## 17. 性能监控规范

### 17.1 性能指标收集
```typescript
// utils/performance.ts
export const collectMetrics = () => {
  const metrics = {
    FCP: performance.getEntriesByName('first-contentful-paint')[0],
    LCP: performance.getEntriesByName('largest-contentful-paint')[0],
    FID: performance.getEntriesByName('first-input-delay')[0],
    CLS: performance.getEntriesByName('cumulative-layout-shift')[0]
  };
  
  // 发送到分析服务
  sendToAnalytics(metrics);
};
```

### 17.2 性能优化检查清单
```markdown
## 性能优化检查项
- [ ] 使用适当的图片格式和大小
- [ ] 实现懒加载
- [ ] 代码分割
- [ ] 缓存策略
- [ ] 预加载关键资源
- [ ] 最小化主线程工作
- [ ] 优化字体加载
- [ ] 优化第三方脚本
```

## 18. 发布流程规范

### 18.1 发布前检查清单
```markdown
## 发布前检查项
1. 代码质量
- [ ] ESLint检查通过
- [ ] TypeScript类型检查通过
- [ ] 单元测试通过
- [ ] E2E测试通过

2. 性能检查
- [ ] Lighthouse性能评分
- [ ] 首屏加载时间
- [ ] 代码分割是否合理

3. 兼容性检查
- [ ] 跨浏览器测试
- [ ] 响应式布局测试
- [ ] 设备兼容性测试

4. 安全检查
- [ ] 依赖包安全检查
- [ ] XSS防护
- [ ] CSRF防护

5. SEO检查
- [ ] Meta标签完整性
- [ ] 语义化标签使用
- [ ] 图片alt属性
```

这些规范涵盖了前端开发的主要方面，包括API调用、错误处理、国际化、安全性、性能监控和发布流程等。团队成员应该严格遵循这些规范，以确保代码质量和项目可维护性。