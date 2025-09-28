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
  Checkbox,
  Divider
} from 'antd';
import { authFetch } from '@/libs/auth/auth-client';

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

// 用户选择的题目和答案类型
interface CustomerSelectedQuestion {
  questionId: string;
  questionTitle: string;
  selectedOptionId: string;
  selectedOptionText: string;
  isCorrect: boolean;
}

interface ChannelQuestionnaireViewModalProps {
  open: boolean;
  onCancel: () => void;
  questionnaireId?: string;
  customerSelectedQuestions?: CustomerSelectedQuestion[];
}

export default function ChannelQuestionnaireViewModal({ 
  open, 
  onCancel, 
  questionnaireId,
  customerSelectedQuestions = []
}: ChannelQuestionnaireViewModalProps) {
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
      const response = await authFetch(`/api/admin/questionnaires/${questionnaireId}`);
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

  // 获取用户选择的答案
  const getUserSelectedOption = (questionId: string) => {
    return customerSelectedQuestions?.find(item => item.questionId === questionId);
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
                renderItem={(question: Question, index: number) => {
                  const userSelection = getUserSelectedOption(question.id);
                  
                  return (
                    <List.Item key={question.id}>
                      <div style={{ width: '100%' }}>
                        <div style={{ marginBottom: 10 }}>
                          <Tag color="blue">{index + 1}</Tag>
                          <Text strong>{question.title}</Text>
                        </div>
                        
                        {userSelection && (
                          <div style={{ marginBottom: 10 }}>
                            <Tag color={userSelection.isCorrect ? 'success' : 'error'}>
                              {userSelection.isCorrect ? '正确' : '错误'}
                            </Tag>
                            <span style={{ marginLeft: 8 }}>用户选择: {userSelection.selectedOptionText}</span>
                          </div>
                        )}
                        
                        <List
                          dataSource={question.options}
                          renderItem={(option: QuestionOption, optionIndex: number) => {
                            const isSelected = userSelection?.selectedOptionId === option.id;
                            
                            return (
                              <List.Item key={option.id} style={{ paddingLeft: 20 }}>
                                <Checkbox checked={isSelected} disabled>
                                  <Text>
                                    <strong>{String.fromCharCode(65 + optionIndex)}.</strong> {option.text}
                                  </Text>
                                </Checkbox>
                              </List.Item>
                            );
                          }}
                        />
                        
                        <Divider style={{ margin: '12px 0' }} />
                      </div>
                    </List.Item>
                  );
                }}
              />
            </Card>
          </div>
        )}
      </Spin>
    </Modal>
  );
}