'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileTextOutlined,
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
  message,
  Switch
} from 'antd';
import AntdSidebar from '@/components/admin/antd-sidebar';

const { Header, Content, Footer } = Layout;

interface Questionnaire {
  id: string;
  questionnaireNumber: string;
  questionnaireName: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
  isEnabled: boolean;
}

export default function QuestionnairesPage() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([
    {
      id: '1',
      questionnaireNumber: 'QN001',
      questionnaireName: '客户满意度调查',
      remark: '用于收集客户对服务的满意度反馈',
      createdAt: '2023-05-15T10:30:00Z',
      updatedAt: '2023-05-15T10:30:00Z',
      isEnabled: true
    },
    {
      id: '2',
      questionnaireNumber: 'QN002',
      questionnaireName: '产品使用体验',
      remark: '了解用户对产品的使用体验和建议',
      createdAt: '2023-05-16T14:45:00Z',
      updatedAt: '2023-05-16T14:45:00Z',
      isEnabled: true
    }
  ]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<Questionnaire | null>(null);
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

  const handleAddQuestionnaire = () => {
    setEditingQuestionnaire(null);
    setIsModalVisible(true);
  };

  const handleEditQuestionnaire = (record: Questionnaire) => {
    setEditingQuestionnaire(record);
    setIsModalVisible(true);
  };

  const handleDeleteQuestionnaire = (id: string) => {
    setQuestionnaires(questionnaires.filter(q => q.id !== id));
    message.success('问卷删除成功');
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    setQuestionnaires(questionnaires.map(questionnaire => 
      questionnaire.id === id ? { ...questionnaire, isEnabled: !currentStatus } : questionnaire
    ));
    message.success(`问卷${!currentStatus ? '启用' : '禁用'}成功`);
  };

  const handleModalOk = () => {
    // 这里应该处理表单提交逻辑
    setIsModalVisible(false);
    message.success(editingQuestionnaire ? '问卷更新成功' : '问卷创建成功');
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: '问卷编号',
      dataIndex: 'questionnaireNumber',
      key: 'questionnaireNumber',
    },
    {
      title: '问卷名称',
      dataIndex: 'questionnaireName',
      key: 'questionnaireName',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      render: (isEnabled: boolean, record: Questionnaire) => (
        <Switch 
          checked={isEnabled} 
          onChange={() => handleToggleStatus(record.id, isEnabled)} 
          checkedChildren="启用" 
          unCheckedChildren="禁用" 
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => new Date(time).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Questionnaire) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditQuestionnaire(record)}>编辑问卷</Button>
          <Button type="link" icon={<EyeOutlined />}>下载二维码</Button>
          <Button type="link" icon={<EyeOutlined />}>查看问卷</Button>
        </Space>
      ),
    },

  ];

  return (
    <Layout hasSider className="min-h-screen">
      <AntdSidebar 
        onLogout={handleLogout} 
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
                  <FileTextOutlined style={{ marginRight: 8 }} />
                  <span>问卷设置</span>
                </div>
              }
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddQuestionnaire}>
                  添加问卷
                </Button>
              }
            >
              <Table
                columns={columns}
                dataSource={questionnaires}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                rowKey="id"
              />
            </Card>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Admin 管理后台 ©{new Date().getFullYear()}
        </Footer>
      </Layout>
      
      <Modal
        title={editingQuestionnaire ? "编辑问卷" : "添加问卷"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="确定"
        cancelText="取消"
      >
        <Form layout="vertical">
          <Form.Item label="问卷编号" required>
            <Input placeholder="请输入问卷编号" />
          </Form.Item>
          <Form.Item label="问卷名称" required>
            <Input placeholder="请输入问卷名称" />
          </Form.Item>
          <Form.Item label="备注">
            <Input.TextArea placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}