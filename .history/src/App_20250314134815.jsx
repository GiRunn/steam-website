import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeContext';
import UserCenter from './pages/UserCenter/UserCenter';
// 导入其他页面组件...

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/user-center" element={<UserCenter />} />
          {/* 其他路由... */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 