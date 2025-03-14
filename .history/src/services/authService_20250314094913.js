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
    await delay(500); // 模拟网络请求延迟

    if (!email || !password) {
      throw new Error('请输入邮箱和密码');
    }

    if (email.toLowerCase() === MOCK_USER.email && password === MOCK_USER.password) {
      const { password: _, ...userWithoutPassword } = MOCK_USER;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }
    
    throw new Error('邮箱或密码错误');
  },

  // 登出方法
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
  },

  // 获取当前用户信息
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.logout(); // 如果数据损坏，清除登录状态
      return null;
    }
  },

  // 检查是否已登录
  isAuthenticated() {
    const user = this.getCurrentUser();
    return !!user && user.id && user.email;
  }
}; 