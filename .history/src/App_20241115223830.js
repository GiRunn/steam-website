import { useState, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';


// 使用 lazy 导入组件
const Homepage = lazy(() => import('./pages/home'));
const Store = lazy(() => import('./pages/Store'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const About = lazy(() => import('./pages/About'));
const Community = lazy(() => import('./pages/Community'));
const CustomerService = lazy(() => import('./pages/CustomerService'));
const VideoGuides = lazy(() => import('./pages/VideoGuides'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const GameDetail = lazy(() => import('./pages/GameDetail'));

function App() {
  // 全局状态
  const [darkMode, setDarkMode] = useState(true);
  const [locale, setLocale] = useState('zh');

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
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Homepage {...sharedProps} />} />
          <Route path="/store" element={<Store {...sharedProps} />} />
          <Route path="/login" element={<Login {...sharedProps} />} />
          <Route path="/register" element={<Register {...sharedProps} />} />
          <Route path="/about" element={<About {...sharedProps} />} />
          <Route path="/community" element={<Community {...sharedProps} />} />
          <Route path="/support" element={<CustomerService {...sharedProps} />} />
          <Route path="/video-guides" element={<VideoGuides {...sharedProps} />} />
          <Route path="/forgot-password" element={<ForgotPassword {...sharedProps} />} />
          <Route path="/game/:id" element={<GameDetail {...sharedProps} />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;