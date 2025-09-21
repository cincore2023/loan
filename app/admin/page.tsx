'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  LockOutlined, 
  UserOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone 
} from '@ant-design/icons';
import { 
  Button, 
  Form, 
  Input, 
  Checkbox, 
  Card, 
  Row, 
  Col,
  Typography,
  theme
} from 'antd';

const { Title, Text } = Typography;

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { token } = theme.useToken();

  const handleSubmit = async (values: { username: string; password: string; remember: boolean }) => {
    setLoading(true);
    
    try {
      // 实际登录 API 调用
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: values.username, 
          password: values.password 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('登录成功');
        // 设置认证 cookie（实际应用中应该使用更安全的方式）
        document.cookie = "admin-auth=true; path=/; max-age=3600";
        // 登录成功后跳转到客户资料页面
        router.push('/admin/customers');
      } else {
        toast.error(data.error || '登录失败，请检查用户名和密码');
      }
    } catch (error) {
      console.error('网络错误:', error);
      toast.error('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card 
          style={{ 
            width: '100%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: 8
          }}
        >
          <div className="text-center mb-8">
            <Title level={3} style={{ margin: 0 }}>Admin 管理后台</Title>
            <Text type="secondary">登录到您的账户</Text>
          </div>
          
          <Form
            name="login"
            onFinish={handleSubmit}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名!' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="请输入用户名" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                size="large"
                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>记住我</Checkbox>
              <a 
                href="#" 
                className="float-right"
                style={{ color: token.colorPrimary }}
              >
                忘记密码?
              </a>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
                style={{ width: '100%' }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}