import { logger } from '../utils/logger';

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
    logger.info(`尝试登录 - 邮箱: ${email}`);
    console.log(`尝试登录 - 邮箱: ${email}, 密码: ${password}`);

    if (!email || !password) {
      logger.error('登录失败 - 邮箱或密码为空');
      throw new Error('请输入邮箱和密码');
    }

    await delay(500); // 模拟网络请求延迟

    // 打印期望的用户凭据和实际输入的凭据进行比较
    console.log('期望的用户凭据:', { 
      email: MOCK_USER.email.toLowerCase(), 
      password: MOCK_USER.password 
    });
    console.log('实际输入的凭据:', { 
      email: email.toLowerCase(), 
      password 
    });

    // 严格验证邮箱和密码
    if (email.toLowerCase() === MOCK_USER.email.toLowerCase() && password === MOCK_USER.password) {
      const { password: _, ...userWithoutPassword } = MOCK_USER;
      // 存储用户信息和登录状态
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('isAuthenticated', 'true');
      logger.info(`登录成功 - 用户: ${userWithoutPassword.username}`);
      console.log('登录成功 - 用户信息已存储到localStorage');
      return { success: true, user: userWithoutPassword };
    }
    
    logger.error(`登录失败 - 邮箱: ${email} - 密码错误`);
    console.log('登录失败 - 邮箱或密码错误');
    throw new Error('邮箱或密码错误');
  },

  // 登出方法
  logout() {
    const user = this.getCurrentUser();
    if (user) {
      logger.info(`用户登出 - ${user.username}`);
      console.log(`用户登出 - ${user.username}`);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('isAuthenticated');
    console.log('已清除所有登录状态');
  },

  // 获取当前用户信息
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;
      console.log('获取当前用户:', parsedUser);
      return parsedUser;
    } catch (error) {
      logger.error(`解析用户数据错误: ${error.message}`);
      console.error(`解析用户数据错误: ${error.message}`);
      this.logout(); // 如果数据损坏，清除登录状态
      return null;
    }
  },

  // 检查是否已登录
  isAuthenticated() {
    try {
      // 直接检查localStorage中的isAuthenticated值
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      
      // 检查用户数据是否存在
      const user = this.getCurrentUser();
      
      // 记录详细的认证检查过程
      logger.debug(`认证检查 - isAuth: ${isAuth}, user存在: ${!!user}`);
      console.log(`认证检查 - isAuth: ${isAuth}, user存在: ${!!user}`);
      
      // 只有当isAuth为true且user存在时才认为已登录
      const authenticated = isAuth && !!user;
      
      logger.debug(`认证状态最终结果: ${authenticated}`);
      console.log(`认证状态最终结果: ${authenticated}`);
      return authenticated;
    } catch (error) {
      logger.error(`检查认证状态错误: ${error.message}`);
      console.error(`检查认证状态错误: ${error.message}`);
      return false;
    }
  }
}; 