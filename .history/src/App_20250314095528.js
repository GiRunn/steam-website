import { useState, Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingScreen from './components/LoadingScreen';
import { ThemeProvider } from './contexts/ThemeContext';
import PostDetail from './pages/Community/PostDetail';
import ProtectedRoute from './components/ProtectedRoute';
import { authService } from './services/authService';

// ScrollToTop 组件
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname]);
  
  return null;
};

// 使用 lazy 导入组件
const Homepage = lazy(() => import('./pages/home'));
const Store = lazy(() => import('./pages/store/index')); 
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const About = lazy(() => import('./pages/About'));
const Community = lazy(() => import('./pages/Community/index'));
const CustomerService = lazy(() => import('./pages/CustomerService/index'));
const VideoGuides = lazy(() => import('./pages/VideoGuides/index'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const GameDetail = lazy(() => import('./pages/store/GameDetail'));
const ActivityDetail = lazy(() => import('./pages/store/activity-detail'));
const ServiceUnavailable = lazy(() => import('./pages/CustomerService/ServiceUnavailable'));
const OnlineSupportPage = lazy(() => import('./pages/OnlineSupport'));
const PaymentPage = lazy(() => import('./pages/payment/index'));
const PaymentSuccess = lazy(() => import('./pages/payment/PaymentSuccess'));
const UserCenter = lazy(() => import('./pages/UserCenter/UserCenter'));

// 页面切换动画配置
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  
  // 监听认证状态变化
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(authService.isAuthenticated());
    };

    // 检查初始认证状态
    checkAuth();

    // 添加存储事件监听器
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // 全局状态
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });
  
  const [locale, setLocale] = useState(() => {
    const savedLocale = localStorage.getItem('locale');
    return savedLocale || 
      (navigator.language.startsWith('zh') ? 'zh' : 'en');
  });

  // 保存主题设置
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // 保存语言设置
  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleLocale = () => setLocale(locale === 'zh' ? 'en' : 'zh');

  // 共享props
  const sharedProps = {
    isAuthenticated,
    setIsAuthenticated,
    darkMode,
    toggleDarkMode,
    locale,
    toggleLocale
  };

  return (
    <ThemeProvider value={{ darkMode, toggleDarkMode }}>
      <div className={`min-h-screen bg-[#0a0f16] text-white 
        transition-colors duration-300 overflow-x-hidden
        ${darkMode ? 'dark' : ''}`}>
        <ScrollToTop />
        <Suspense fallback={<LoadingScreen />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* 受保护的路由 */}
              <Route
                path="/user-center"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingScreen />}>
                      <motion.div {...pageTransition}>
                        <UserCenter {...sharedProps} />
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <ProtectedRoute>
                        <UserCenter {...sharedProps} />
                      </ProtectedRoute>
                    </motion.div>
                  </Suspense>
                }
              />

              <Route path="/" 
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <Homepage {...sharedProps} />
                    </motion.div>
                  </Suspense>
                } 
              />

              <Route path="/store" 
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <Store {...sharedProps} />
                    </motion.div>
                  </Suspense>
                } 
              />

              <Route path="/login" 
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <Login {...sharedProps} />
                    </motion.div>
                  </Suspense>
                } 
              />

              <Route 
                path="/online-support" 
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <OnlineSupportPage {...sharedProps} />
                    </motion.div>
                  </Suspense>
                } 
              />

              {/* 添加支付相关路由 */}
              <Route 
                path="/payment" 
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <PaymentPage {...sharedProps} />
                    </motion.div>
                  </Suspense>
                } 
              />
              
              <Route 
                path="/payment/success" 
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <PaymentSuccess {...sharedProps} />
                    </motion.div>
                  </Suspense>
                } 
              />

              <Route path="/store/activity/:id" 
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <ActivityDetail {...sharedProps} />
                    </motion.div>
                  </Suspense>
                } 
              />

              <Route 
                path="/customer-service/unavailable"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <ServiceUnavailable {...sharedProps} />
                    </motion.div>
                  </Suspense>
                } 
              />

              <Route path="/register" 
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <Register {...sharedProps} />
                    </motion.div>
                  </Suspense>
                } 
              />

              <Route path="/about" 
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <About {...sharedProps} />
                    </motion.div>
                  </Suspense>
                } 
              />

              <Route path="/community" 
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <Community {...sharedProps} />
                    </motion.div>
                  </Suspense>
                } 
              />

              <Route 
                path="/community/post/:id" 
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <PostDetail {...sharedProps} />
                    </motion.div>
                  </Suspense>
                } 
              />

              <Route path="/support" 
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <CustomerService {...sharedProps} />
                    </motion.div>
                  </Suspense>
                } 
              />

              <Route path="/video-guides" 
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <VideoGuides {...sharedProps} />
                    </motion.div>
                  </Suspense>
                } 
              />

              <Route path="/forgot-password" 
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <ForgotPassword {...sharedProps} />
                    </motion.div>
                  </Suspense>
                } 
              />

              <Route path="/store/game/:id"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <GameDetail {...sharedProps} />
                    </motion.div>
                  </Suspense>
                } 
              />

              {/* 404 路由 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </div>
    </ThemeProvider>
  );
}

export default App;