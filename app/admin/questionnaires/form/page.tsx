'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FileTextOutlined
} from '@ant-design/icons';
import { 
  Button, 
  Layout, 
  theme,
  Card,
  message,
  Spin
} from 'antd';
import AntdSidebar from '@/components/admin/antd-sidebar';
import QuestionnaireForm, { QuestionnaireFormRef } from '@/components/admin/questionnaire-form';

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

interface QuestionnaireFormData {
  id?: string;
  questionnaireNumber: string;
  questionnaireName: string;
  remark: string;
  questions: Question[];
  createdAt?: string;
  updatedAt?: string;
}

export default function QuestionnaireFormPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const formRef = useRef<QuestionnaireFormRef>(null);
  
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    if (id) {
      setMode('edit');
      fetchQuestionnaire();
    } else {
      setMode('create');
      setLoading(false);
    }
  }, [id]);

  const fetchQuestionnaire = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/questionnaires');
      const data = await response.json();
      
      if (response.ok) {
        const foundQuestionnaire = data.questionnaires.find((q: Questionnaire) => q.id === id);
        if (foundQuestionnaire) {
          setQuestionnaire(foundQuestionnaire);
        } else {
          message.error('未找到指定的问卷');
          router.push('/admin/questionnaires');
        }
      } else {
        message.error(data.error || '获取问卷失败');
        router.push('/admin/questionnaires');
      }
    } catch (error) {
      console.error('Failed to fetch questionnaire:', error);
      message.error('网络错误，请稍后再试');
      router.push('/admin/questionnaires');
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSubmit = async (values: QuestionnaireFormData) => {
    try {
      if (mode === 'edit' && id) {
        // 更新问卷
        const response = await fetch('/api/admin/questionnaires', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: id,
            ...values,
          }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          message.success('问卷更新成功');
          router.push('/admin/questionnaires');
        } else {
          message.error(data.error || '更新问卷失败');
        }
      } else {
        // 创建问卷
        const response = await fetch('/api/admin/questionnaires', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          message.success('问卷创建成功');
          router.push('/admin/questionnaires');
        } else {
          message.error(data.error || '创建问卷失败');
        }
      }
    } catch (error) {
      console.error('Failed to save questionnaire:', error);
      message.error('保存问卷失败');
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/admin/questionnaires');
  };

  if (loading && mode === 'edit') {
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
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FileTextOutlined style={{ marginRight: 8 }} />
                    <span>{mode === 'create' ? '添加问卷' : '编辑问卷'}</span>
                  </div>
                  <div>
                    <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                      取消
                    </Button>
                    <Button type="primary" onClick={async () => {
                      try {
                        if (formRef.current) {
                          const values = await formRef.current.validateFields();
                          await handleSubmit(values);
                        }
                      } catch (error) {
                        console.error('Validation failed:', error);
                        // 验证失败时显示错误信息
                        message.error('请检查表单填写是否正确');
                      }
                    }}>
                      保存
                    </Button>
                  </div>
                </div>
              }
            >
              <QuestionnaireForm 
                ref={formRef}
                mode={mode}
                initialValues={mode === 'edit' && questionnaire ? questionnaire : undefined}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
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