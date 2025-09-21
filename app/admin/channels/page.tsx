'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LinkOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { 
  Button, 
  Table, 
  Tag, 
  Layout, 
  theme,
  Space,
  Card,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  message
} from 'antd';
import AntdSidebar from '@/components/admin/antd-sidebar';

const { Header, Content, Footer } = Layout;

interface Channel {
  id: string;
  channelNumber: string;
  channelName: string;
  boundQuestionnaire: string;
  uvCount: number;
  formCount: number;
  remark: string;
  shortLink: string;
  createdAt: string;
  updatedAt: string;
  isEnabled: boolean;
  tags?: string[]; // 添加渠道标签字段
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: '1',
      channelNumber: 'CH001',
      channelName: '官方渠道',
      boundQuestionnaire: '客户满意度调查',
      uvCount: 1250,
      formCount: 860,
      remark: '官方网站推广渠道',
      shortLink: 'https://short.link/abc123',
      createdAt: '2023-05-15T10:30:00Z',
      updatedAt: '2023-05-15T10:30:00Z',
      isEnabled: true,
      tags: ['官网', '推荐']
    },
    {
      id: '2',
      channelNumber: 'CH002',
      channelName: '社交媒体',
      boundQuestionnaire: '产品使用体验',
      uvCount: 890,
      formCount: 620,
      remark: '微信、微博等社交平台',
      shortLink: 'https://short.link/def456',
      createdAt: '2023-05-16T14:45:00Z',
      updatedAt: '2023-05-16T14:45:00Z',
      isEnabled: true,
      tags: ['社交', '移动端']
    }
  ]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const router = useRouter();
  
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      // 清除认证 cookie
      document.cookie = "admin-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      // 跳转到登录页面
      router.push('/admin');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleAddChannel = () => {
    setEditingChannel(null);
    setIsModalVisible(true);
  };

  const handleEditChannel = (record: Channel) => {
    setEditingChannel(record);
    setIsModalVisible(true);
  };

  const handleDeleteChannel = (id: string) => {
    setChannels(channels.filter(c => c.id !== id));
    message.success('渠道删除成功');
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    setChannels(channels.map(channel => 
      channel.id === id ? { ...channel, isEnabled: !currentStatus } : channel
    ));
    message.success(`渠道${!currentStatus ? '启用' : '禁用'}成功`);
  };

  const handleModalOk = () => {
    // 这里应该处理表单提交逻辑
    setIsModalVisible(false);
    message.success(editingChannel ? '渠道更新成功' : '渠道创建成功');
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: '渠道编号',
      dataIndex: 'channelNumber',
      key: 'channelNumber',
    },
    {
      title: '渠道名称',
      dataIndex: 'channelName',
      key: 'channelName',
    },
    {
      title: '渠道标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[] | undefined) => (
        <>
          {tags && tags.map(tag => (
            <Tag key={tag} color="blue">{tag}</Tag>
          ))}
        </>
      ),
    },
    {
      title: '绑定问卷',
      dataIndex: 'boundQuestionnaire',
      key: 'boundQuestionnaire',
    },
    {
      title: 'UV访问次数',
      dataIndex: 'uvCount',
      key: 'uvCount',
    },
    {
      title: '问卷填写总数',
      dataIndex: 'formCount',
      key: 'formCount',
    },
    {
      title: '短链接',
      dataIndex: 'shortLink',
      key: 'shortLink',
      render: (link: string) => (
        <a href={link} target="_blank" rel="noopener noreferrer">
          {link}
        </a>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => new Date(time).toLocaleDateString(),
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      fixed: 'right' as const,
      render: (isEnabled: boolean, record: Channel) => (
        <Switch 
          checked={isEnabled} 
          onChange={() => handleToggleStatus(record.id, isEnabled)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      render: (_: any, record: Channel) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEditChannel(record)}>编辑渠道</Button>
          <Button type="link" >下载二维码</Button>
          <Button type="link" >查看问卷</Button>
        </Space>
      ),
    },
  ];

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
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <LinkOutlined style={{ marginRight: 8 }} />
                  <span>渠道管理</span>
                </div>
              }
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddChannel}>
                  添加渠道
                </Button>
              }
            >
              <div style={{ overflowX: 'auto' }}>
                <Table
                  scroll={{ x: 'max-content' }}
                  columns={columns}
                  dataSource={channels}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                  }}
                  rowKey="id"
                />
              </div>
            </Card>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Admin 管理后台 ©{new Date().getFullYear()}
        </Footer>
      </Layout>
      
      <Modal
        title={editingChannel ? "编辑渠道" : "添加渠道"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="确定"
        cancelText="取消"
      >
        <Form layout="vertical">
          <Form.Item label="渠道编号" required>
            <Input placeholder="请输入渠道编号" />
          </Form.Item>
          <Form.Item label="渠道名称" required>
            <Input placeholder="请输入渠道名称" />
          </Form.Item>
          <Form.Item label="渠道标签">
            <Input placeholder="请输入渠道标签，多个标签用逗号分隔" />
          </Form.Item>
          <Form.Item label="绑定问卷">
            <Input placeholder="请选择绑定问卷" />
          </Form.Item>
          <Form.Item label="备注">
            <Input.TextArea placeholder="请输入备注" />
          </Form.Item>
          <Form.Item label="短链接">
            <Input placeholder="请输入短链接" />
          </Form.Item>
          <Form.Item 
            label="是否启用" 
            name="isEnabled"
            valuePropName="checked"
            initialValue={editingChannel ? editingChannel.isEnabled : true}
          >
            <Switch 
              checkedChildren="启用" 
              unCheckedChildren="禁用" 
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
