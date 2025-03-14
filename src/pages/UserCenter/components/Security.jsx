import React, { useState } from 'react';
import { Shield, Lock, Smartphone, Eye, EyeOff, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const Security = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  // 模拟登录历史数据
  const loginHistory = [
    { id: 1, date: '2024-03-14 15:30:22', ip: '192.168.1.1', location: '北京, 中国', device: 'Chrome on Windows', status: 'success' },
    { id: 2, date: '2024-03-10 09:15:45', ip: '192.168.1.1', location: '北京, 中国', device: 'Firefox on Windows', status: 'success' },
    { id: 3, date: '2024-03-05 18:22:10', ip: '45.67.89.10', location: '上海, 中国', device: 'Safari on macOS', status: 'failed' },
  ];

  const handlePasswordChange = (e) => {
    e.preventDefault();
    // 密码修改逻辑
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('新密码与确认密码不匹配');
      return;
    }
    
    // 模拟API调用
    setTimeout(() => {
      alert('密码修改成功');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }, 1000);
  };

  const handleTwoFactorToggle = () => {
    if (!twoFactorEnabled) {
      // 显示二维码和验证步骤
      setShowQRCode(true);
    } else {
      // 关闭两步验证
      setTwoFactorEnabled(false);
      setShowQRCode(false);
    }
  };

  const handleVerifyAndEnable = () => {
    // 验证代码并启用两步验证
    if (verificationCode.length === 6) {
      setTwoFactorEnabled(true);
      setShowQRCode(false);
      setVerificationCode('');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 密码修改部分 */}
      <div className="bg-[#1e3a50] rounded-lg p-6 border border-blue-500/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-blue-400" /> 修改密码
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="relative">
            <label className="text-sm font-medium text-gray-300 mb-1 block">
              当前密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                className="w-full px-4 py-2 bg-[#2a475e]/50 border border-gray-600 
                  rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">
              新密码
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                className="w-full px-4 py-2 bg-[#2a475e]/50 border border-gray-600 
                  rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
              <button 
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="mt-2">
              <div className="text-xs text-gray-400 mb-1">密码强度</div>
              <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${passwordForm.newPassword.length > 8 ? 'bg-green-500' : passwordForm.newPassword.length > 4 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                  style={{ width: `${Math.min(100, passwordForm.newPassword.length * 10)}%` }}></div>
              </div>
              <ul className="mt-2 text-xs text-gray-400 space-y-1">
                <li className="flex items-center gap-1">
                  {passwordForm.newPassword.length >= 8 ? 
                    <CheckCircle className="h-3 w-3 text-green-500" /> : 
                    <AlertTriangle className="h-3 w-3 text-red-500" />}
                  至少8个字符
                </li>
                <li className="flex items-center gap-1">
                  {/[A-Z]/.test(passwordForm.newPassword) ? 
                    <CheckCircle className="h-3 w-3 text-green-500" /> : 
                    <AlertTriangle className="h-3 w-3 text-red-500" />}
                  至少包含一个大写字母
                </li>
                <li className="flex items-center gap-1">
                  {/[0-9]/.test(passwordForm.newPassword) ? 
                    <CheckCircle className="h-3 w-3 text-green-500" /> : 
                    <AlertTriangle className="h-3 w-3 text-red-500" />}
                  至少包含一个数字
                </li>
              </ul>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">
              确认新密码
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              className="w-full px-4 py-2 bg-[#2a475e]/50 border border-gray-600 
                rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
            {passwordForm.newPassword && passwordForm.confirmPassword && 
              passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">密码不匹配</p>
              )
            }
          </div>
          
          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 
              rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-600
              transition-all duration-300 transform hover:scale-105"
          >
            更新密码
          </button>
        </form>
      </div>

      {/* 两步验证部分 */}
      <div className="bg-[#1e3a50] rounded-lg p-6 border border-blue-500/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-blue-400" /> 两步验证
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-300">
              {twoFactorEnabled ? 
                '两步验证已启用，每次登录时需要输入验证码' : 
                '启用两步验证以增强账户安全性'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {twoFactorEnabled ? 
                '上次验证: 2024-03-14' : 
                '推荐使用 Google Authenticator 或 Authy 应用'}
            </p>
          </div>
          <div className="flex items-center">
            <span className="mr-3 text-sm text-gray-400">
              {twoFactorEnabled ? '已启用' : '未启用'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={twoFactorEnabled}
                onChange={handleTwoFactorToggle}
              />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full 
                peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
                after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {showQRCode && (
          <div className="mt-4 p-4 bg-[#2a475e]/50 rounded-lg border border-gray-600">
            <h4 className="text-lg font-medium text-white mb-3">设置两步验证</h4>
            <ol className="list-decimal list-inside space-y-4 text-gray-300">
              <li>
                <p>下载并安装 Google Authenticator 或 Authy 应用</p>
              </li>
              <li>
                <p>扫描下方二维码或手动输入密钥</p>
                <div className="mt-2 bg-white p-4 rounded-lg inline-block">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/SteamWebsite:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=SteamWebsite" 
                    alt="二维码" 
                    className="w-32 h-32"
                  />
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-400">密钥: JBSWY3DPEHPK3PXP</p>
                </div>
              </li>
              <li>
                <p>输入应用生成的6位验证码</p>
                <div className="mt-2 flex space-x-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6位验证码"
                    className="px-4 py-2 bg-[#2a475e]/50 border border-gray-600 
                      rounded-lg text-white focus:outline-none focus:border-blue-500"
                    maxLength={6}
                  />
                  <button
                    onClick={handleVerifyAndEnable}
                    disabled={verificationCode.length !== 6}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 
                      rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    验证并启用
                  </button>
                </div>
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* 登录历史部分 */}
      <div className="bg-[#1e3a50] rounded-lg p-6 border border-blue-500/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-400" /> 登录历史
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-gray-400 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3">时间</th>
                <th className="px-4 py-3">IP地址</th>
                <th className="px-4 py-3">位置</th>
                <th className="px-4 py-3">设备</th>
                <th className="px-4 py-3">状态</th>
              </tr>
            </thead>
            <tbody>
              {loginHistory.map((item) => (
                <tr key={item.id} className="border-b border-gray-800 text-sm">
                  <td className="px-4 py-3 text-gray-300">{item.date}</td>
                  <td className="px-4 py-3 text-gray-300">{item.ip}</td>
                  <td className="px-4 py-3 text-gray-300">{item.location}</td>
                  <td className="px-4 py-3 text-gray-300">{item.device}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {item.status === 'success' ? '成功' : '失败'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Security; 