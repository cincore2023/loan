'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  CopyOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { 
  Button, 
  Table, 
  Tag, 
  Layout, 
  theme,
  Space,
  Card,
  message,
  Row,
  Col,
  Spin,
  Input
} from 'antd';
import AntdSidebar from '@/components/admin/antd-sidebar';
import { v4 as uuidv4 } from 'uuid';
import { authFetch } from '@/libs/auth/auth-client';

const { Header, Content, Footer } = Layout;

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  title: string;
  options: QuestionOption[];
}

interface Questionnaire {
  id: string;
  questionnaireNumber: string;
  questionnaireName: string;
  remark: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  isActive?: boolean; // 添加 isActive 属性
}

export default function QuestionnairesPage() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // 添加搜索关键词状态（用于按钮点击搜索）
  const [searchKeyword, setSearchKeyword] = useState('');
  const router = useRouter();
  
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 获取问卷列表
  useEffect(() => {
    fetchQuestionnaires();
  }, [searchKeyword]);

  const fetchQuestionnaires = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/admin/questionnaires');
      const data = await response.json();
      
      if (response.ok) {
        // 按问卷编号倒序排列
        let sortedQuestionnaires = data.questionnaires.sort((a: Questionnaire, b: Questionnaire) => {
          return b.questionnaireNumber.localeCompare(a.questionnaireNumber);
        });
        
        // 添加搜索过滤逻辑
        if (searchKeyword) {
          sortedQuestionnaires = sortedQuestionnaires.filter((q: Questionnaire) => 
            q.questionnaireNumber.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            q.questionnaireName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            (q.remark && q.remark.toLowerCase().includes(searchKeyword.toLowerCase()))
          );
        }
        
        setQuestionnaires(sortedQuestionnaires);
      } else {
        message.error(data.error || '获取问卷列表失败');
      }
    } catch (error) {
      console.error('Failed to fetch questionnaires:', error);
      message.error('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleAddQuestionnaire = () => {
    router.push('/admin/questionnaires/form');
  };

  const handleEditQuestionnaire = (record: Questionnaire) => {
    router.push(`/admin/questionnaires/form?id=${record.id}`);
  };

  const handleCopyQuestionnaire = (record: Questionnaire) => {
    // 复制问卷数据到添加页面，生成新的ID
    const copiedQuestionnaire = {
      ...record,
      id: uuidv4(), // 生成新的ID
      questionnaireNumber: `${record.questionnaireNumber}_copy`, // 修改问卷编号避免重复
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // 为每个题目和选项生成新的ID
      questions: record.questions.map(question => ({
        ...question,
        id: uuidv4(),
        options: question.options.map(option => ({
          ...option,
          id: uuidv4()
        }))
      }))
    };
    
    // 将复制的数据存储到localStorage
    localStorage.setItem('copiedQuestionnaire', JSON.stringify(copiedQuestionnaire));
    
    // 跳转到添加问卷页面
    router.push('/admin/questionnaires/form');
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await authFetch('/api/admin/questionnaires', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        message.success('问卷删除成功');
        fetchQuestionnaires(); // 重新获取问卷列表
      } else {
        message.error(data.error || '删除问卷失败');
      }
    } catch (error) {
      console.error('Failed to delete questionnaire:', error);
      message.error('删除问卷失败');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const questionnaire = questionnaires.find(q => q.id === id);
      if (!questionnaire) return;

      const response = await authFetch('/api/admin/questionnaires', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: questionnaire.id,
          questionnaireNumber: questionnaire.questionnaireNumber,
          questionnaireName: questionnaire.questionnaireName,
          remark: questionnaire.remark,
          isActive: !currentStatus
        }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('问卷状态更新成功');
        fetchQuestionnaires(); // 重新获取问卷列表
      } else {
        message.error(data.error || '更新问卷状态失败');
      }
    } catch (error) {
      console.error('Failed to update questionnaire status:', error);
      message.error('更新问卷状态失败');
    }
  };

  // 添加搜索处理函数
  const handleSearch = () => {
    setSearchKeyword(searchTerm);
  };

  // 添加重置搜索处理函数
  const handleResetSearch = () => {
    setSearchTerm('');
    setSearchKeyword('');
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
      title: '题目数量',
      dataIndex: 'questionCount',
      key: 'questionCount',
      render: (_: any, record: Questionnaire) => record.questions?.length || 0,
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
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Questionnaire) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditQuestionnaire(record)}>编辑问卷</Button>
          <Button type="link" icon={<CopyOutlined />} onClick={() => handleCopyQuestionnaire(record)}>复制问卷</Button>
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
              {/* 添加搜索框 */}
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }} justify="end">
                <Col xs={24} sm={12} md={6}>
                  <Input
                    placeholder="搜索问卷编号、名称、备注..."
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <Space>
                    <Button type="primary" onClick={handleSearch}>
                      查询
                    </Button>
                    <Button onClick={handleResetSearch}>
                      重置
                    </Button>
                  </Space>
                </Col>
              </Row>
              <Spin spinning={loading}>
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
              </Spin>
            </Card>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Admin 管理后台 ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
}