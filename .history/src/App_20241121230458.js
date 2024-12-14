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
const Homepage = lazy(() => import('./pages/home'));
const Store = lazy(() => import('./pages/store/index')); 
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const About = lazy(() => import('./pages/About'));
const Community = lazy(() => import('./pages/Community/index'));
const CustomerService = lazy(() => import('./pages/CustomerService'));
const VideoGuides = lazy(() => import('./pages/VideoGuides'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const GameDetail = lazy(() => import('./pages/store/GameDetail'));
const ActivityDetail = lazy(() => import('./pages/store/activity-detail'));


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
            <motion.div
              key={location.pathname}
              {...pageTransition}
              className="w-full"
            >
              <Routes location={location}>
                <Route path="/" 
                  element={
                    <motion.div {...pageTransition}>
                      <Homepage {...sharedProps} />
                    </motion.div>
                  } 
                />
                <Route path="/store" 
                  element={
                    <motion.div {...pageTransition}>
                      <Store {...sharedProps} />
                    </motion.div>
                  } 
                />
                <Route path="/store/activity/:id" 
                  element={
                    <motion.div {...pageTransition}>
                      <ActivityDetail {...sharedProps} />
                    </motion.div>
                  } 
                />
                <Route path="/login" 
                  element={
                    <motion.div {...pageTransition}>
                      <Login {...sharedProps} />
                    </motion.div>
                  } 
                />
                <Route path="/register" 
                  element={
                    <motion.div {...pageTransition}>
                      <Register {...sharedProps} />
                    </motion.div>
                  } 
                />
                <Route path="/about" 
                  element={
                    <motion.div {...pageTransition}>
                      <About {...sharedProps} />
                    </motion.div>
                  } 
                />
                <Route path="/community" 
                  element={
                    <motion.div {...pageTransition}>
                      <Community {...sharedProps} />
                    </motion.div>
                  } 
                />
                <Route 
                path="/community/post/:id" 
                element={
                  <motion.div {...pageTransition}>
                    <PostDetail {...sharedProps} />
                  </motion.div>
                } 
/>
                <Route path="/support" 
                  element={
                    <motion.div {...pageTransition}>
                      <CustomerService {...sharedProps} />
                    </motion.div>
                  } 
                />
                <Route path="/video-guides" 
                  element={
                    <motion.div {...pageTransition}>
                      <VideoGuides {...sharedProps} />
                    </motion.div>
                  } 
                />
                <Route path="/forgot-password" 
                  element={
                    <motion.div {...pageTransition}>
                      <ForgotPassword {...sharedProps} />
                    </motion.div>
                  } 
                />
                <Route path="/store/game/:id"
                  element={
                    <motion.div {...pageTransition}>
                      <GameDetail {...sharedProps} />
                    </motion.div>
                  } 
                />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>
    </ThemeProvider>
  );
}

export default App;