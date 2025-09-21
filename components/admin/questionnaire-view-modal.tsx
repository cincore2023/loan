'use client';

import { useState, useEffect } from 'react';
import { 
  Modal, 
  Spin, 
  message, 
  Typography, 
  Card, 
  List, 
  Tag,
  Space
} from 'antd';

const { Title, Text } = Typography;

// 定义问卷相关的类型
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

interface QuestionnaireViewModalProps {
  open: boolean;
  onCancel: () => void;
  questionnaireId?: string;
}

export default function QuestionnaireViewModal({ 
  open, 
  onCancel, 
  questionnaireId 
}: QuestionnaireViewModalProps) {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && questionnaireId) {
      fetchQuestionnaire();
    }
  }, [open, questionnaireId]);

  const fetchQuestionnaire = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/questionnaires/${questionnaireId}`);
      const data = await response.json();
      
      if (response.ok) {
        setQuestionnaire(data);
      } else {
        message.error(data.error || '获取问卷详情失败');
      }
    } catch (error) {
      console.error('Failed to fetch questionnaire:', error);
      message.error('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="问卷详情"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Spin spinning={loading}>
        {questionnaire && (
          <div>
            <Card size="small" title="问卷基本信息" style={{ marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div>
                  <Text strong>问卷编号:</Text>
                  <br />
                  <Text>{questionnaire.questionnaireNumber}</Text>
                </div>
                <div>
                  <Text strong>问卷名称:</Text>
                  <br />
                  <Text>{questionnaire.questionnaireName}</Text>
                </div>
                <div>
                  <Text strong>备注:</Text>
                  <br />
                  <Text>{questionnaire.remark || '无'}</Text>
                </div>
                <div>
                  <Text strong>创建时间:</Text>
                  <br />
                  <Text>{new Date(questionnaire.createdAt).toLocaleString()}</Text>
                </div>
                <div>
                  <Text strong>题目数量:</Text>
                  <br />
                  <Text>{questionnaire.questions?.length || 0}</Text>
                </div>
              </div>
            </Card>

            <Card size="small" title="问卷题目">
              <List
                dataSource={questionnaire.questions || []}
                renderItem={(question: Question, index: number) => (
                  <List.Item key={question.id}>
                    <div style={{ width: '100%' }}>
                      <div style={{ marginBottom: 10 }}>
                        <Tag color="blue">{index + 1}</Tag>
                        <Text strong>{question.title}</Text>
                      </div>
                      <List
                        dataSource={question.options}
                        renderItem={(option: QuestionOption, optionIndex: number) => (
                          <List.Item key={option.id} style={{ paddingLeft: 20 }}>
                            <Text>
                              <strong>{String.fromCharCode(65 + optionIndex)}.</strong> {option.text}
                            </Text>
                          </List.Item>
                        )}
                      />
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </Spin>
    </Modal>
  );
}