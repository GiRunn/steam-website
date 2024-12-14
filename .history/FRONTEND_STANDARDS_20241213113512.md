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
- 组件文件: 使用 PascalCase (如 `Button.tsx`, `GameCard.jsx`)
- 工具/服务文件: 使用 camelCase (如 `authService.js`, `validation.js`)
- 样式文件: 使用 camelCase (如 `styles.module.css`)
- 常量文件: 使用 camelCase (如 `constants.js`)
- 类型文件: 使用 PascalCase (如 `Types.ts`)

### 4.2 组件命名
```tsx
// 组件命名示例
const GameCard = () => {
  return <div className="game-card">...</div>;
};

// 页面组件命名
const StorePage = () => {
  return <div className="store-page">...</div>;
};
```

### 4.3 CSS类命名
采用BEM命名规范:
```css
/* Block */
.game-card { }

/* Element */
.game-card__title { }
.game-card__image { }

/* Modifier */
.game-card--featured { }
.game-card--sale { }
```

## 5. 组件开发规范

### 5.1 组件基本结构
```tsx
// components/GameCard/index.tsx
import React from 'react';
import styles from './styles.module.css';

interface GameCardProps {
  title: string;
  image: string;
  price: number;
  onPurchase?: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  image,
  price,
  onPurchase
}) => {
  // 1. Hooks声明
  const [isHovered, setIsHovered] = useState(false);

  // 2. 事件处理
  const handlePurchase = () => {
    onPurchase?.();
  };

  // 3. 渲染
  return (
    <div 
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={image} alt={title} />
      <h3>{title}</h3>
      <p>${price}</p>
      <button onClick={handlePurchase}>购买</button>
    </div>
  );
};
```

### 5.2 组件文档规范
```tsx
/**
 * 游戏卡片组件
 * @component
 * @param {Object} props
 * @param {string} props.title - 游戏标题
 * @param {string} props.image - 游戏图片URL
 * @param {number} props.price - 游戏价格
 * @param {Function} [props.onPurchase] - 购买按钮点击回调
 * @example
 * return (
 *   <GameCard
 *     title="Game Title"
 *     image="/images/game.jpg"
 *     price={29.99}
 *     onPurchase={() => console.log('Purchase clicked')}
 *   />
 * )
 */
```

## 6. 样式开发规范

### 6.1 主题变量
```css
:root {
  /* 颜色系统 */
  --color-primary: #0a0f16;
  --color-secondary: #1a2634;
  --color-accent: #66c0f4;
  
  /* 字体系统 */
  --font-primary: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI";
  --font-secondary: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI";
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  
  /* 间距系统 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

### 6.2 响应式设计
```scss
// styles/breakpoints.scss
$breakpoints: (
  'mobile': 320px,
  'tablet': 768px,
  'desktop': 1024px,
  'wide': 1440px
);

@mixin respond-to($breakpoint) {
  @media (min-width: map-get($breakpoints, $breakpoint)) {
    @content;
  }
}

// 使用示例
.game-grid {
  display: grid;
  gap: var(--spacing-md);
  
  @include respond-to('mobile') {
    grid-template-columns: 1fr;
  }
  
  @include respond-to('tablet') {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @include respond-to('desktop') {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 7. 状态管理规范

### 7.1 Context使用
```jsx
// contexts/ThemeContext.js
export const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {}
});

// 使用示例
const { theme } = useContext(ThemeContext);
```

### 7.2 自定义Hook规范
```jsx
// hooks/useAuth.js
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hook逻辑
  
  return { user, loading };
};
```

## 8. 页面组件规范

### 8.1 页面组件结构
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

## 9. UI组件规范

### 9.1 按钮组件
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

### 9.2 输入组件
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

## 10. 主题规范

### 10.1 颜色变量
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

### 10.2 字体规范
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

## 11. 性能优化规范

### 11.1 图片优化
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

### 11.2 代码分割
```jsx
// 路由级别的代码分割
const GameDetail = lazy(() => import('./pages/store/GameDetail'));

// 使用Suspense
<Suspense fallback={<LoadingScreen />}>
  <GameDetail />
</Suspense>
```

## 12. 测试规范

### 12.1 组件测试
```jsx
// __tests__/components/Button.test.jsx
describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## 13. 文档规范

### 13.1 组件文档
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

## 14. API调用规范

### 14.1 API服务配置
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

### 14.2 API服务封装
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

## 15. 错误处理规范

### 15.1 全局错误边界
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

### 15.2 API错误处理
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

## 16. 性能监控规范

### 16.1 性能指标收集
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

### 16.2 错误监控
```typescript
// utils/errorTracking.ts
export const initErrorTracking = () => {
  window.addEventListener('error', (event) => {
    // 收集错误信息
    const errorInfo = {
      message: event.message,
      stack: event.error?.stack,
      timestamp: new Date().toISOString()
    };
    
    // 发送到监控服务
    sendToMonitoring(errorInfo);
  });
};
```

## 17. 国际化规范

### 17.1 配置
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

### 17.2 使用示例
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

## 18. 安全规范

### 18.1 XSS防护
```typescript
// utils/security.ts
import DOMPurify from 'dompurify';

export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
};

// 使用示例
const Comment = ({ content }) => {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }} />;
};
```

### 18.2 敏感数据处理
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

## 19. WebSocket通信规范

### 19.1 WebSocket服务
```typescript
// services/websocket.ts
class WebSocketService {
  private socket: WebSocket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initSocket();
  }

  private initSocket() {
    this.socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);
    
    this.socket.onopen = () => {
      console.log('WebSocket Connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onclose = () => {
      this.handleReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.initSocket(), 1000 * this.reconnectAttempts);
    }
  }

  public sendMessage(message: any) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }
}

export const wsService = new WebSocketService();
```

### 19.2 在线客服使用示例
```typescript
// pages/OnlineSupport/hooks/useChat.ts
export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    wsService.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    wsService.socket.onopen = () => {
      setIsConnected(true);
    };

    wsService.socket.onclose = () => {
      setIsConnected(false);
    };
  }, []);

  const sendMessage = (content: string) => {
    wsService.sendMessage({
      type: 'CHAT',
      content,
      timestamp: new Date().toISOString()
    });
  };

  return {
    messages,
    isConnected,
    sendMessage
  };
};
```

## 20. 缓存策略规范

### 20.1 数据缓存
```typescript
// utils/cache.ts
class CacheService {
  private cache: Map<string, {
    data: any,
    timestamp: number
  }> = new Map();

  private maxAge = 5 * 60 * 1000; // 5分钟

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const cacheService = new CacheService();
```

### 20.2 API缓存策略
```typescript
// hooks/useApiWithCache.ts
export const useApiWithCache = <T>(key: string, fetchFn: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // 先检查缓存
      const cached = cacheService.get(key);
      if (cached) {
        setData(cached);
        return;
      }

      // 没有缓存则请求
      setLoading(true);
      try {
        const result = await fetchFn();
        setData(result);
        cacheService.set(key, result);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key]);

  return { data, loading };
};
```

## 21. SEO优化规范

### 21.1 Meta标签管理
```tsx
// components/SEO.tsx
import Head from 'next/head';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  url
}) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const imageUrl = image ? `${siteUrl}${image}` : `${siteUrl}/default-og.jpg`;

  return (
    <Head>
      <title>{title} | Steam</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={fullUrl} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Head>
  );
};
```

[未完待续...]