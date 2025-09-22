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
  Divider,
  Descriptions
} from 'antd';
import { formatCurrency, formatPhoneNumber, formatIdCard, formatDateTime } from '@/lib/utils';

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
}

interface Customer {
  id: string;
  customerName: string;
  applicationAmount: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  phoneNumber: string | null;
  idCard: string | null;
  submissionTime: string | null;
  channelLink: string | null;
  createdAt: string;
  updatedAt: string;
  selectedQuestions?: CustomerSelectedQuestion[] | null;
  questionnaireId?: string | null;
  questionnaireName?: string | null;
}

interface CustomerQuestionViewModalProps {
  open: boolean;
  onCancel: () => void;
  customer: Customer | null;
}

export default function CustomerQuestionViewModal({ 
  open, 
  onCancel,
  customer
}: CustomerQuestionViewModalProps) {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && customer?.questionnaireId) {
      fetchQuestionnaire();
    }
  }, [open, customer?.questionnaireId]);

  const fetchQuestionnaire = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/questionnaires/${customer?.questionnaireId}`);
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
    return customer?.selectedQuestions?.find(item => item.questionId === questionId);
  };

  return (
    <Modal
      title="客户选题详情"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Spin spinning={loading}>
        {customer && (
          <div>
            <Descriptions title="客户信息" column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="客户名称">{customer.customerName}</Descriptions.Item>
              <Descriptions.Item label="申请额度">{customer.applicationAmount ? formatCurrency(customer.applicationAmount) : '未填写'}</Descriptions.Item>
              <Descriptions.Item label="所属地区">
                {customer.province || ''}{customer.city || ''}{customer.district || ''}
              </Descriptions.Item>
              <Descriptions.Item label="手机号">{formatPhoneNumber(customer.phoneNumber)}</Descriptions.Item>
              <Descriptions.Item label="身份证">{formatIdCard(customer.idCard)}</Descriptions.Item>
              <Descriptions.Item label="渠道">{customer.channelLink || '未填写'}</Descriptions.Item>
              <Descriptions.Item label="问卷名称">{customer.questionnaireName || '未填写'}</Descriptions.Item>
              <Descriptions.Item label="提交时间">
                {formatDateTime(customer.submissionTime, 'YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>
            
            {questionnaire && (
              <div>
                <Card size="small" title="问卷信息" style={{ marginBottom: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                    <div>
                      <Typography.Text strong>问卷编号:</Typography.Text>
                      <br />
                      <Typography.Text>{questionnaire.questionnaireNumber}</Typography.Text>
                    </div>
                    <div>
                      <Typography.Text strong>问卷名称:</Typography.Text>
                      <br />
                      <Typography.Text>{questionnaire.questionnaireName}</Typography.Text>
                    </div>
                    <div>
                      <Typography.Text strong>备注:</Typography.Text>
                      <br />
                      <Typography.Text>{questionnaire.remark || '无'}</Typography.Text>
                    </div>
                    <div>
                      <Typography.Text strong>创建时间:</Typography.Text>
                      <br />
                      <Typography.Text>{formatDateTime(questionnaire.createdAt, 'YYYY-MM-DD HH:mm:ss')}</Typography.Text>
                    </div>
                    <div>
                      <Typography.Text strong>题目数量:</Typography.Text>
                      <br />
                      <Typography.Text>{questionnaire.questions?.length || 0}</Typography.Text>
                    </div>
                  </div>
                </Card>

                <Card size="small" title="问卷题目与客户选择">
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
                                <span style={{ marginLeft: 8 }}>客户选择: {userSelection.selectedOptionText}</span>
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
            
            {!questionnaire && customer?.selectedQuestions && customer.selectedQuestions.length > 0 && (
              <div>
                <Title level={5} style={{ marginBottom: 16 }}>客户选择详情</Title>
                <List
                  dataSource={customer.selectedQuestions}
                  renderItem={(item) => (
                    <List.Item>
                      <Card 
                        size="small" 
                        style={{ width: '100%' }}
                        title={item.questionTitle}
                      >
                        <div>
                          <span style={{ marginLeft: 8 }}>客户选择: {item.selectedOptionText}</span>
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              </div>
            )}
            
            {!questionnaire && (!customer?.selectedQuestions || customer.selectedQuestions.length === 0) && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text>该客户暂未选择任何题目</Text>
              </div>
            )}
          </div>
        )}
      </Spin>
    </Modal>
  );
}