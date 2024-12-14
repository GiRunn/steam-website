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