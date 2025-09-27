'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Input, message } from 'antd';
import { login, logout, isAuthenticated } from '@/libs/auth/auth-client';

export default function TestCookieAuthPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // 检查认证状态
  useEffect(() => {
    const checkAuth = async () => {
      const auth = await isAuthenticated();
      setIsLoggedIn(auth);
    };
    
    checkAuth();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await login(username, password);
      
      if (result.success) {
        setIsLoggedIn(true);
        message.success('登录成功');
      } else {
        message.error(result.error || '登录失败');
      }
    } catch (error) {
      console.error('登录错误:', error);
      message.error('登录过程出现错误');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setIsLoggedIn(false);
      message.success('登出成功');
    } catch (error) {
      console.error('登出错误:', error);
      message.error('登出过程出现错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <Card title="Cookie 认证测试页面">
        <div style={{ marginBottom: '16px' }}>
          <h3>当前状态:</h3>
          <p>已登录: {isLoggedIn ? '是' : '否'}</p>
        </div>

        {!isLoggedIn ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Input
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input.Password
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button 
              type="primary" 
              onClick={handleLogin} 
              loading={loading}
            >
              登录
            </Button>
          </div>
        ) : (
          <Button 
            danger 
            onClick={handleLogout} 
            loading={loading}
          >
            登出
          </Button>
        )}
        
        <div style={{ marginTop: '24px' }}>
          <h3>测试说明:</h3>
          <p>1. 使用用户名 "admin" 和密码 "123456" 登录</p>
          <p>2. 登录成功后，token 会被存储在 HttpOnly Cookie 中</p>
          <p>3. 页面刷新后应该保持登录状态</p>
          <p>4. 点击登出会清除 Cookie 中的 token</p>
          <p>5. 由于是 HttpOnly Cookie，JavaScript 无法直接访问</p>
        </div>
      </Card>
    </div>
  );
}