'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UsergroupAddOutlined,
  FileTextOutlined,
  LinkOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Layout, 
  theme,
  Spin,
  message
} from 'antd';
import AntdSidebar from '@/components/admin/antd-sidebar';
import { isAuthenticated } from '@/libs/auth/auth-client';
import { authFetch } from '@/libs/auth/auth-client';

const { Header, Content, Footer } = Layout;

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    customerCount: 0,
    questionnaireCount: 0,
    channelCount: 0,
    activeChannelCount: 0
  });
  const router = useRouter();
  
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 检查用户是否已经登录
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await isAuthenticated();
        if (!auth) {
          router.push('/admin');
        } else {
          fetchDashboardData();
        }
      } catch (error) {
        console.error('检查认证状态失败:', error);
        router.push('/admin');
      }
    };

    checkAuth();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/admin/dashboard');
      const data = await response.json();
      
      if (response.ok) {
        setDashboardData(data);
      } else {
        message.error(data.error || '获取仪表板数据失败');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      message.error('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (loading) {
    return (
      <Layout hasSider className="min-h-screen">
        <AntdSidebar 
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
        />
        <Layout className="site-layout">
          <Header style={{ padding: 0, background: colorBgContainer }} />
          <Content style={{ margin: '24px 16px 0' }}>
            <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Spin size="large" />
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Admin 管理后台 ©{new Date().getFullYear()}
          </Footer>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout hasSider className="min-h-screen">
      <AntdSidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <Layout className="site-layout">
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
            <Row gutter={16}>
              <Col span={12}>
                <Card bordered={false}>
                  <Statistic
                    title="客户总数"
                    value={dashboardData.customerCount}
                    prefix={<UsergroupAddOutlined />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card bordered={false}>
                  <Statistic
                    title="问卷总数"
                    value={dashboardData.questionnaireCount}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card bordered={false}>
                  <Statistic
                    title="渠道总数"
                    value={dashboardData.channelCount}
                    prefix={<LinkOutlined />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card bordered={false}>
                  <Statistic
                    title="启用渠道数"
                    value={dashboardData.activeChannelCount}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Admin 管理后台 ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
}