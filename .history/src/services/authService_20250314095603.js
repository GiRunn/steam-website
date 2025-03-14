// 模拟用户数据
const MOCK_USER = {
  id: 1,
  username: 'admin',
  email: 'admin@gamestore.com',
  password: 'admin', // 实际项目中应该使用加密密码
  avatar: 'https://via.placeholder.com/150',
  balance: 1000,
  followers: 128,
  following: 56
};

// 模拟登录延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // 登录方法
  async login(email, password) {
    if (!email || !password) {
      throw new Error('请输入邮箱和密码');
    }

    await delay(500); // 模拟网络请求延迟

    // 严格验证邮箱和密码
    if (email.toLowerCase() === MOCK_USER.email.toLowerCase() && password === MOCK_USER.password) {
      const { password: _, ...userWithoutPassword } = MOCK_USER;
      // 存储用户信息和登录状态
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('isAuthenticated', 'true');
      return { success: true, user: userWithoutPassword };
    }
    
    throw new Error('邮箱或密码错误');
  },

  // 登出方法
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('rememberMe');
    window.dispatchEvent(new Event('storage')); // 触发存储事件以更新状态
  },

  // 获取当前用户信息
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      this.logout();
      return null;
    }
  },

  // 检查是否已登录
  isAuthenticated() {
    try {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      const user = this.getCurrentUser();
      return isAuth && !!user && !!user.email;
    } catch (error) {
      this.logout();
      return false;
    }
  }
}; 