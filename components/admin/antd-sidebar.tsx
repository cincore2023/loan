'use client';

import { Menu, Layout, Button, theme } from 'antd';
import {
  UsergroupAddOutlined,
  FileTextOutlined,
  LinkOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { logout } from '@/libs/auth/auth-client';

const { Sider } = Layout;

interface AntdSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function AntdSidebar({ isCollapsed, onToggle }: AntdSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const menuItems = [
    {
      key: '/admin/customers',
      icon: <UsergroupAddOutlined />,
      label: '客户资料',
    },
    {
      key: '/admin/questionnaires',
      icon: <FileTextOutlined />,
      label: '问卷设置',
    },
    {
      key: '/admin/channels',
      icon: <LinkOutlined />,
      label: '渠道管理',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleMenuClick = async ({ key }: { key: string }) => {
    console.log('key', key);
    if (key === 'logout') {
      // 调用登出函数
      await logout();
      // 跳转到登录页面
      router.push('/admin');
    } else {
      router.push(key);
    }
  };

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={isCollapsed}
      width={256}
      className="min-h-screen"
      theme="light"
    >
      <div className="demo-logo-vertical" />
      <div className="flex items-center justify-between p-4">
        {isCollapsed ? '' : (
          <h1 className="text-lg font-medium text-gray-900 flex items-center">
            Admin 管理后台
          </h1>
        )}
        <Button
          type="text"
          icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700"
        />
      </div>
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        className="mt-4"
      />
    </Sider>
  );
}