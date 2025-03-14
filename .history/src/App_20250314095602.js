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

  // 共享props
  const sharedProps = {
    isAuthenticated,
    setIsAuthenticated
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#0a0f16] text-white transition-colors duration-300 overflow-x-hidden">
        <ScrollToTop />
        <Suspense fallback={<LoadingScreen />}>
          <AnimatePresence mode="wait">
            <Routes location={location}>
              {/* 受保护的路由 */}
              <Route
                path="/user-center"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingScreen />}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <UserCenter {...sharedProps} />
                      </motion.div>
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* 登录路由 */}
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/user-center" replace />
                  ) : (
                    <Suspense fallback={<LoadingScreen />}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Login {...sharedProps} />
                      </motion.div>
                    </Suspense>
                  )
                }
              />

              {/* 其他路由 */}
              <Route path="/" element={<Homepage {...sharedProps} />} />
              <Route path="/store" element={<Store {...sharedProps} />} />
              <Route path="/register" element={<Register {...sharedProps} />} />
              <Route path="/about" element={<About {...sharedProps} />} />
              <Route path="/community" element={<Community {...sharedProps} />} />
              <Route path="/support" element={<CustomerService {...sharedProps} />} />
              <Route path="/video-guides" element={<VideoGuides {...sharedProps} />} />
              <Route path="/forgot-password" element={<ForgotPassword {...sharedProps} />} />
              <Route path="/store/game/:id" element={<GameDetail {...sharedProps} />} />
              <Route path="/store/activity/:id" element={<ActivityDetail {...sharedProps} />} />
              <Route path="/customer-service/unavailable" element={<ServiceUnavailable {...sharedProps} />} />
              <Route path="/online-support" element={<OnlineSupportPage {...sharedProps} />} />
              <Route path="/payment" element={<PaymentPage {...sharedProps} />} />
              <Route path="/payment/success" element={<PaymentSuccess {...sharedProps} />} />

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