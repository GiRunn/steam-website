import { useState, Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingScreen from './components/LoadingScreen';
import { ThemeProvider } from './contexts/ThemeContext';
import PostDetail from './pages/Community/PostDetail';

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
const Homepage = lazy(() => import('./pages/home').then(module => ({ default: module.default })));
const Store = lazy(() => import('./pages/store/index').then(module => ({ default: module.default }))); 
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.default })));
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.default })));
const About = lazy(() => import('./pages/About').then(module => ({ default: module.default })));
const Community = lazy(() => import('./pages/Community/index').then(module => ({ default: module.default })));
const CustomerService = lazy(() => import('./pages/CustomerService/index').then(module => ({ default: module.default })));
const VideoGuides = lazy(() => import('./pages/VideoGuides/index').then(module => ({ default: module.default })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(module => ({ default: module.default })));
const GameDetail = lazy(() => import('./pages/store/GameDetail').then(module => ({ default: module.default })));
const ActivityDetail = lazy(() => import('./pages/store/activity-detail').then(module => ({ default: module.default })));
const ServiceUnavailable = lazy(() => import('./pages/CustomerService/ServiceUnavailable').then(module => ({ default: module.default })));
const OnlineSupportPage = lazy(() => import('./pages/OnlineSupport').then(module => ({ default: module.default })));
const PaymentPage = lazy(() => import('./pages/payment/index').then(module => ({ default: module.default })));
const PaymentSuccess = lazy(() => import('./pages/payment/PaymentSuccess').then(module => ({ default: module.default })));

// 页面切换动画配置
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

function App() {
  const location = useLocation();
  
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
            <Routes location={location}>
              <Route path="/" 
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <Homepage {...sharedProps} />
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

              <Route path="/store" 
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <Store {...sharedProps} />
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

              <Route path="/login" 
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <motion.div {...pageTransition}>
                      <Login {...sharedProps} />
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
            </Routes>
          </AnimatePresence>
        </Suspense>
      </div>
    </ThemeProvider>
  );
}

export default App;