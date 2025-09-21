'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MinusCircleOutlined,
  PlusCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { 
  Button, 
  Form,
  Input,
  message,
  Divider,
  Card
} from 'antd';
import { v4 as uuidv4 } from 'uuid';

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  title: string;
  options: QuestionOption[];
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

interface QuestionnaireFormProps {
  mode: 'create' | 'edit';
  initialValues?: QuestionnaireFormData;
  onSubmit: (values: QuestionnaireFormData) => Promise<void>;
  onCancel: () => void;
}

export interface QuestionnaireFormRef {
  validateFields: () => Promise<QuestionnaireFormData>;
}

const QuestionnaireForm = forwardRef<QuestionnaireFormRef, QuestionnaireFormProps>(({
  mode, 
  initialValues, 
  onSubmit, 
  onCancel 
}, ref) => {
  const [form] = Form.useForm();
  const router = useRouter();

  // 暴露表单实例的方法
  useImperativeHandle(ref, () => ({
    validateFields: () => form.validateFields(),
  }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else if (mode === 'create') {
      // 检查是否有复制的问卷数据
      const copiedQuestionnaire = localStorage.getItem('copiedQuestionnaire');
      if (copiedQuestionnaire) {
        try {
          const parsedData = JSON.parse(copiedQuestionnaire);
          form.setFieldsValue(parsedData);
          // 清除localStorage中的数据
          localStorage.removeItem('copiedQuestionnaire');
        } catch (error) {
          console.error('Failed to parse copied questionnaire data:', error);
        }
      }
    }
  }, [initialValues, mode, form]);

  const handleFinish = async (values: QuestionnaireFormData) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Failed to save questionnaire:', error);
      message.error('保存问卷失败');
    }
  };

  return (
    <Form 
      form={form} 
      layout="vertical" 
      onFinish={handleFinish}
      style={{ maxWidth: 600, margin: '0 auto' }}
    >
      <Form.Item 
        label="问卷编号" 
        name="questionnaireNumber"
        rules={[{ required: true, message: '请输入问卷编号' }]}
      >
        <Input placeholder="请输入问卷编号" />
      </Form.Item>
      <Form.Item 
        label="问卷名称" 
        name="questionnaireName"
        rules={[{ required: true, message: '请输入问卷名称' }]}
      >
        <Input placeholder="请输入问卷名称" />
      </Form.Item>
      <Form.Item 
        label="备注" 
        name="remark"
      >
        <Input.TextArea placeholder="请输入备注" />
      </Form.Item>
      
      <Divider orientation="left">题目设置</Divider>
      
      <Form.List name="questions">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card 
                size="small" 
                title={`题目 ${name + 1}`} 
                key={key}
                extra={
                  fields.length > 1 && (
                    <MinusCircleOutlined 
                      onClick={() => remove(name)} 
                      style={{ color: 'red' }}
                    />
                  )
                }
                style={{ marginBottom: 16 }}
              >
                <Form.Item
                  {...restField}
                  name={[name, 'title']}
                  label="题目标题"
                  rules={[{ required: true, message: '请输入题目标题' }]}
                >
                  <Input placeholder="请输入题目标题" />
                </Form.Item>
                
                <Form.Item
                  label="选项"
                  required
                >
                  <Form.List name={[name, 'options']}>
                    {(optionFields, { add: addOption, remove: removeOption }) => (
                      <>
                        {optionFields.map(({ key: optionKey, name: optionName, ...restOptionField }) => (
                          <div 
                            key={optionKey} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              marginBottom: 12,
                              padding: '8px 12px',
                              background: '#fafafa',
                              borderRadius: 6,
                              transition: 'all 0.3s'
                            }}
                          >
                            <span 
                              style={{ 
                                marginRight: 12, 
                                fontWeight: 'bold',
                                minWidth: 20,
                                display: 'inline-block'
                              }}
                            >
                              {String.fromCharCode(65 + optionName)}.
                            </span>
                            <Form.Item
                              {...restOptionField}
                              name={[optionName, 'text']}
                              style={{ 
                                flex: 1, 
                                marginRight: 12, 
                                marginBottom: 0
                              }}
                              rules={[{ required: true, message: '请输入选项内容' }]}
                            >
                              <Input placeholder="请输入选项内容" />
                            </Form.Item>
                            <Button 
                              type="text" 
                              icon={<MinusCircleOutlined />} 
                              onClick={() => removeOption(optionName)} 
                              danger
                            />
                          </div>
                        ))}
                        <Button 
                          type="dashed" 
                          onClick={() => addOption({ id: uuidv4(), text: '' })} 
                          icon={<PlusOutlined />}
                          style={{ width: '100%' }}
                        >
                          添加选项
                        </Button>
                      </>
                    )}
                  </Form.List>
                </Form.Item>
              </Card>
            ))}
            <Button 
              type="dashed" 
              onClick={() => add({ id: uuidv4(), title: '', options: [{ id: uuidv4(), text: '' }] })} 
              icon={<PlusCircleOutlined />}
              style={{ width: '100%' }}
            >
              添加题目
            </Button>
          </>
        )}
      </Form.List>
      
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          取消
        </Button>
        <Button type="primary" htmlType="submit">
          保存
        </Button>
      </div>
    </Form>
  );
});

QuestionnaireForm.displayName = 'QuestionnaireForm';

export default QuestionnaireForm;