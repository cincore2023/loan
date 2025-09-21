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
}

export default function QuestionnairesPage() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 获取问卷列表
  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  const fetchQuestionnaires = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/questionnaires');
      const data = await response.json();
      
      if (response.ok) {
        setQuestionnaires(data.questionnaires);
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

  const handleDeleteQuestionnaire = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/questionnaires?id=${id}`, {
        method: 'DELETE',
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

  // 添加搜索过滤逻辑
  const filteredQuestionnaires = useMemo(() => {
    if (!searchTerm) return questionnaires;
    
    return questionnaires.filter(q => 
      q.questionnaireNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.questionnaireName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.remark && q.remark.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [questionnaires, searchTerm]);

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
      render: (count: number) => count || 0,
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
              </Row>
              <Spin spinning={loading}>
                <Table
                  columns={columns}
                  dataSource={filteredQuestionnaires}
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