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

## 22. 在线客服模块规范

### 22.1 聊天组件结构
```tsx
// pages/OnlineSupport/components/ChatWindow.tsx
interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isAgentTyping: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  isAgentTyping
}) => {
  return (
    <div className={styles.chatWindow}>
      <MessageList messages={messages} />
      {isAgentTyping && <TypingIndicator />}
      <MessageInput onSend={onSendMessage} />
    </div>
  );
};
```

### 22.2 消息处理
```typescript
// pages/OnlineSupport/hooks/useMessageHandler.ts
export const useMessageHandler = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  const handleIncomingMessage = (message: Message) => {
    if (message.type === 'TYPING_START') {
      setIsAgentTyping(true);
    } else if (message.type === 'TYPING_END') {
      setIsAgentTyping(false);
    } else {
      setMessages(prev => [...prev, message]);
    }
  };

  return {
    messages,
    isAgentTyping,
    handleIncomingMessage
  };
};
```

## 23. 支付系统规范

### 23.1 支付表单验证
```typescript
// pages/payment/utils/validation.ts
import * as yup from 'yup';

export const paymentSchema = yup.object({
  cardNumber: yup
    .string()
    .required('Card number is required')
    .matches(/^\d{16}$/, 'Invalid card number'),
    
  expiryDate: yup
    .string()
    .required('Expiry date is required')
    .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Invalid expiry date'),
    
  cvv: yup
    .string()
    .required('CVV is required')
    .matches(/^\d{3,4}$/, 'Invalid CVV')
});
```

### 23.2 支付处理
```typescript
// pages/payment/utils/payment.ts
export const processPayment = async (paymentData: PaymentData) => {
  try {
    // 1. 验证支付数据
    await paymentSchema.validate(paymentData);
    
    // 2. 加密敏感数据
    const encryptedData = encryptPaymentData(paymentData);
    
    // 3. 发送支付请求
    const response = await api.post('/payments', encryptedData);
    
    // 4. 处理响应
    if (response.status === 'success') {
      return {
        success: true,
        transactionId: response.transactionId
      };
    }
    
    throw new Error(response.error);
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
};
```

## 24. 视频指南模块规范

### 24.1 视频播放器组件
```tsx
// pages/VideoGuides/components/VideoPlayer.tsx
interface VideoPlayerProps {
  videoUrl: string;
  poster?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  poster,
  onProgress,
  onComplete
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      onProgress?.(progress);
    };
    
    const handleEnded = () => {
      onComplete?.();
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onProgress, onComplete]);
  
  return (
    <div className={styles.videoPlayer}>
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        controls
        className={styles.video}
      />
    </div>
  );
};
```

### 24.2 视频列表管理
```typescript
// pages/VideoGuides/hooks/useVideoList.ts
interface VideoGuide {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: number;
  category: string;
}

export const useVideoList = (category?: string) => {
  const [videos, setVideos] = useState<VideoGuide[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await api.get('/video-guides', {
          params: { category }
        });
        setVideos(response.data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, [category]);
  
  return { videos, loading };
};
```

## 25. 性能优化最佳实践

### 25.1 图片懒加载
```tsx
// components/LazyImage.tsx
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = '/images/placeholder.jpg',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (imageRef.current) {
            imageRef.current.src = src;
          }
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );
    
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }
    
    return () => observer.disconnect();
  }, [src]);
  
  return (
    <img
      ref={imageRef}
      src={placeholder}
      alt={alt}
      className={`${styles.image} ${isLoaded ? styles.loaded : ''}`}
      onLoad={() => setIsLoaded(true)}
      {...props}
    />
  );
};
```

## 26. 代码审查规范

### 26.1 代码审查清单
```markdown
## 代码审查要点

1. 功能完整性
- [ ] 是否实现了所有需求
- [ ] 边界情况是否考虑完善
- [ ] 错误处理是否完善

2. 代码质量
- [ ] 代码是否遵循项目规范
- [ ] 是否有重复代码
- [ ] 命名是否清晰易懂
- [ ] 注释是否充分

3. 性能考虑
- [ ] 是否有性能隐患
- [ ] 是否正确使用React hooks
- [ ] 是否有不必要的渲染
- [ ] 是否实现了必要的缓存

4. 安全性
- [ ] 是否有安全漏洞
- [ ] 敏感信息是否安全处理
- [ ] 是否实现了必要的数据验证

5. 可维护性
- [ ] 代码结构是否清晰
- [ ] 是否有充分的注释
- [ ] 是否便于测试
- [ ] 是否遵循SOLID原则
```

## 27. 发布流程规范

### 27.1 发布前检查清单
```markdown
## 发布前检查项

1. 代码质量
- [ ] ESLint检查通过
- [ ] TypeScript类型检查通过
- [ ] 单元测试通过
- [ ] E2E测试通过
- [ ] 代码审查完成

2. 性能检查
- [ ] Lighthouse性能评分
- [ ] 首屏加载时间
- [ ] 代码分割是否合理
- [ ] 资源加载优化

3. 兼容性检查
- [ ] 跨浏览器测试
- [ ] 响应式布局测试
- [ ] 设备兼容性测试
- [ ] 网络环境测试

4. 安全检查
- [ ] 依赖包安全检查
- [ ] XSS防护
- [ ] CSRF防护
- [ ] 敏感信息保护

5. SEO检查
- [ ] Meta标签完整性
- [ ] 语义化标签使用
- [ ] 图片alt属性
- [ ] 页面结构合理性

6. 文档更新
- [ ] API文档更新
- [ ] 组件文档更新
- [ ] 更新日志更新
- [ ] 使用说明更新
```

## 28. 项目文件结构说明

### 28.1 模块说明
```markdown
## 主要模块

1. 全局组件
- src/components/ui/ - 基础UI组件
- src/components/layout/ - 布局组件
- src/components/shared/ - 共享组件

2. 页面模块
- src/pages/home/ - 首页模块
- src/pages/store/ - 商城模块
- src/pages/Community/ - 社区模块
- src/pages/CustomerService/ - 客服中心
- src/pages/OnlineSupport/ - 在线客服
- src/pages/VideoGuides/ - 视频指南
- src/pages/payment/ - 支付系统

3. 功能模块
- src/features/auth/ - 认证模块
- src/features/store/ - 商城功能
- src/features/community/ - 社区功能

4. 工具和服务
- src/services/ - API服务
- src/utils/ - 工具函数
- src/hooks/ - 自定义Hooks
```

### 28.2 字体规范
```css
/* styles/typography.css */
:root {
  /* 主标题 */
  --heading-font: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI";
  --heading-size-lg: 18px;
  --heading-weight: 600;
  --heading-color: #e5e7eb;

  /* 正文 */
  --body-font: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI";
  --body-size: 16px;
  --body-weight: 400;
  --body-color: #d1d5db;

  /* 辅助文本 */
  --caption-font: "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI";
  --caption-size: 14px;
  --caption-weight: 500;
  --caption-color: #9ca3af;
}
```

## 29. 总结

本规范文档涵盖了Steam Website前端开发的主要方面，包括：

1. 项目结构和文件组织
2. 编码规范和最佳实践
3. 组件开发和状态管理
4. 样式开发和主题管理
5. API调用和错误处理
6. 性能优化和监控
7. 安全性和国际化
8. 测试和文档
9. 发布流程和代码审查

开发团队应该严格遵循这些规范，以确保代码质量和项目可维护性。规范会随着项目的发展不断更新和完善。

### 相关文档
- [开发标准](DEVELOPMENT_STANDARDS.md)
- [数据库标准](DATABASE_STANDARDS.md)
- [项目说明](README.md)
```

## 30. 前端测试规范

### 30.1 单元测试规范
```typescript
// 组件测试示例
describe('Component Tests', () => {
    // 渲染测试
    it('should render correctly', () => {
        const { container } = render(<Component />);
        expect(container).toMatchSnapshot();
    });

    // 交互测试
    it('should handle user interactions', async () => {
        const { getByRole } = render(<Component />);
        await userEvent.click(getByRole('button'));
        // 验证交互结果
    });
});
```

### 30.2 集成测试规范
```typescript
// API集成测试
describe('API Integration', () => {
    // API调用测试
    it('should fetch data correctly', async () => {
        const response = await api.getData();
        expect(response).toMatchSchema(schema);
    });

    // 错误处理测试
    it('should handle API errors', async () => {
        // 模拟API错误
        server.use(
            rest.get('/api/data', (req, res, ctx) => {
                return res(ctx.status(500));
            })
        );
        // 验证错误处理
    });
});
```
