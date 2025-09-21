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
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';

const { Sider } = Layout;

interface AntdSidebarProps {
  onLogout: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function AntdSidebar({ onLogout, isCollapsed, onToggle }: AntdSidebarProps) {
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

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      onLogout();
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
        {isCollapsed ? (
          <div className="bg-gray-200 p-2 rounded-lg">
            <UsergroupAddOutlined className="text-gray-700" />
          </div>
        ) : (
          <h1 className="text-lg font-medium text-gray-900 flex items-center">
            <div className="bg-gray-200 p-2 rounded-lg mr-2">
              <UsergroupAddOutlined className="text-gray-700" />
            </div>
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