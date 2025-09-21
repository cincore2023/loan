'use client';

import { useState, useEffect } from 'react';
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
  message,
  Spin,
  Row,
  Col,
  DatePicker,
  Select,
  QRCode
} from 'antd';
import AntdSidebar from '@/components/admin/antd-sidebar';
import QuestionnaireViewModal from '@/components/admin/questionnaire-view-modal';
import dayjs from 'dayjs';

const { Header, Content, Footer } = Layout;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface Channel {
  id: string;
  channelNumber: string;
  channelName: string;
  questionnaireId?: string;
  uvCount: number;
  questionnaireSubmitCount: number;
  remark: string;
  shortLink: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface Questionnaire {
  id: string;
  questionnaireNumber: string;
  questionnaireName: string;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);
  const [isQuestionnaireModalVisible, setIsQuestionnaireModalVisible] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string | null>(null);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({
    startDate: '',
    endDate: ''
  });
  const router = useRouter();
  
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 获取渠道列表
  useEffect(() => {
    fetchChannels();
    fetchQuestionnaires();
  }, [searchParams]);

  // 获取问卷列表
  const fetchQuestionnaires = async () => {
    try {
      const response = await fetch('/api/admin/questionnaires');
      const data = await response.json();
      
      if (response.ok) {
        setQuestionnaires(data.questionnaires);
      } else {
        message.error(data.error || '获取问卷列表失败');
      }
    } catch (error) {
      console.error('Failed to fetch questionnaires:', error);
      message.error('获取问卷列表失败');
    }
  };

  const fetchChannels = async () => {
    try {
      setLoading(true);
      // 构建查询参数
      let url = '/api/admin/channels';
      const params = new URLSearchParams();
      
      if (searchParams.startDate) {
        params.append('startDate', searchParams.startDate);
      }
      
      if (searchParams.endDate) {
        params.append('endDate', searchParams.endDate);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setChannels(data.channels);
      } else {
        message.error(data.error || '获取渠道列表失败');
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      message.error('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleAddChannel = () => {
    setEditingChannel(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditChannel = (record: Channel) => {
    setEditingChannel(record);
    form.setFieldsValue({
      ...record,
      tags: record.tags ? record.tags.join(', ') : ''
    });
    setIsModalVisible(true);
  };

  const handleDeleteChannel = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/channels?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        message.success('渠道删除成功');
        fetchChannels(); // 重新获取渠道列表
      } else {
        message.error(data.error || '删除渠道失败');
      }
    } catch (error) {
      console.error('Failed to delete channel:', error);
      message.error('删除渠道失败');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const channel = channels.find(c => c.id === id);
      if (!channel) return;
      
      const response = await fetch('/api/admin/channels', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: channel.id,
          channelName: channel.channelName,
          questionnaireId: channel.questionnaireId,
          uvCount: channel.uvCount,
          questionnaireSubmitCount: channel.questionnaireSubmitCount,
          remark: channel.remark,
          shortLink: channel.shortLink,
          tags: channel.tags,
          isActive: !currentStatus
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setChannels(channels.map(channel => 
          channel.id === id ? { ...channel, isActive: !currentStatus } : channel
        ));
        message.success(`渠道${!currentStatus ? '启用' : '禁用'}成功`);
      } else {
        message.error(data.error || '更新渠道状态失败');
      }
    } catch (error) {
      console.error('Failed to update channel status:', error);
      message.error('更新渠道状态失败');
    }
  };

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    setSearchParams({
      startDate: dateStrings[0],
      endDate: dateStrings[1]
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // 处理标签字段，兼容中英文逗号
      let tags = [];
      if (values.tags) {
        // 使用正则表达式分割中英文逗号
        tags = values.tags.split(/[,\，]/)
          .map((tag: string) => tag.trim())
          .filter(Boolean);
      }
      
      if (editingChannel) {
        // 更新渠道
        const response = await fetch('/api/admin/channels', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingChannel.id,
            channelName: values.channelName,
            questionnaireId: values.questionnaireId,
            uvCount: editingChannel.uvCount,
            questionnaireSubmitCount: editingChannel.questionnaireSubmitCount,
            remark: values.remark,
            shortLink: values.shortLink,
            tags,
            isActive: values.isActive
          }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          message.success('渠道更新成功');
          fetchChannels(); // 重新获取渠道列表
        } else {
          message.error(data.error || '更新渠道失败');
        }
      } else {
        // 创建渠道
        const response = await fetch('/api/admin/channels', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...values,
            tags
          }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          message.success('渠道创建成功');
          fetchChannels(); // 重新获取渠道列表
        } else {
          message.error(data.error || '创建渠道失败');
        }
      }
      
      setIsModalVisible(false);
    } catch (error) {
      console.error('Failed to save channel:', error);
      message.error('保存渠道失败');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleShowQRCode = (record: Channel) => {
    setSelectedChannel(record);
    setIsQRModalVisible(true);
  };

  const handleDownloadQRCode = (record: Channel) => {
    // 创建一个临时的a标签来下载二维码
    const canvas = document.querySelector(`#qr-code-${record.id} canvas`) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL();
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-code-${record.channelNumber}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      message.error('二维码生成失败');
    }
  };

  const handleViewQuestionnaire = (questionnaireId: string) => {
    setSelectedQuestionnaireId(questionnaireId);
    setIsQuestionnaireModalVisible(true);
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
      dataIndex: 'questionnaireName',
      key: 'questionnaireName',
    },
    {
      title: 'UV访问次数',
      dataIndex: 'uvCount',
      key: 'uvCount',
    },
    {
      title: '问卷填写总数',
      dataIndex: 'questionnaireSubmitCount',
      key: 'questionnaireSubmitCount',
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
      dataIndex: 'isActive',
      key: 'isActive',
      fixed: 'right' as const,
      render: (isActive: boolean, record: Channel) => (
        <Switch 
          checked={isActive} 
          onChange={() => handleToggleStatus(record.id, isActive)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      render: (_: any, record: Channel) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEditChannel(record)}>编辑渠道</Button>
          <Button type="link" onClick={() => handleShowQRCode(record)}>下载二维码</Button>
          {record.questionnaireId && (
            <Button 
              type="link" 
              onClick={() => handleViewQuestionnaire(record.questionnaireId!)}
            >
              查看问卷
            </Button>
          )}
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
              {/* 添加筛选控件 */}
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }} justify="end">
                <Col>
                  <RangePicker 
                    onChange={handleDateChange}
                    placeholder={['开始日期', '结束日期']}
                    format="YYYY-MM-DD"
                  />
                </Col>
              </Row>
              
              <div style={{ overflowX: 'auto' }}>
                <Spin spinning={loading}>
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
                </Spin>
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
        <Form form={form} layout="vertical">
          <Form.Item 
            label="渠道编号" 
            name="channelNumber"
            rules={[{ required: true, message: '请输入渠道编号' }]}
          >
            <Input placeholder="请输入渠道编号" />
          </Form.Item>
          <Form.Item 
            label="渠道名称" 
            name="channelName"
            rules={[{ required: true, message: '请输入渠道名称' }]}
          >
            <Input placeholder="请输入渠道名称" />
          </Form.Item>
          <Form.Item label="渠道标签" name="tags">
            <Input placeholder="请输入渠道标签，多个标签用逗号分隔" />
          </Form.Item>
          <Form.Item label="绑定问卷" name="questionnaireId">
            <Select placeholder="请选择绑定问卷" allowClear>
              {questionnaires.map(questionnaire => (
                <Option key={questionnaire.id} value={questionnaire.id}>
                  {questionnaire.questionnaireNumber} - {questionnaire.questionnaireName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea placeholder="请输入备注" />
          </Form.Item>
          {/* 短链接字段 - 添加生成按钮 */}
          <Form.Item label="短链接">
            <Input.Group compact>
              <Form.Item
                name="shortLink"
                noStyle
                rules={[{ required: false }]}
              >
                <Input 
                  style={{ width: 'calc(100% - 100px)' }} 
                  placeholder="点击生成按钮根据渠道编号自动生成"
                />
              </Form.Item>
              <Button 
                type="primary" 
                onClick={() => {
                  const channelNumber = form.getFieldValue('channelNumber');
                  if (channelNumber) {
                    form.setFieldsValue({
                      shortLink: `https://loan.example.com/${channelNumber}`
                    });
                  } else {
                    message.warning('请先输入渠道编号');
                  }
                }}
              >
                生成
              </Button>
            </Input.Group>
          </Form.Item>
          <Form.Item 
            label="是否启用" 
            name="isActive"
            valuePropName="checked"
            initialValue={editingChannel ? editingChannel.isActive : true}
          >
            <Switch 
              checkedChildren="启用" 
              unCheckedChildren="禁用" 
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 二维码显示模态框 */}
      <Modal
        title="渠道二维码"
        open={isQRModalVisible}
        onCancel={() => setIsQRModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsQRModalVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            onClick={() => selectedChannel && handleDownloadQRCode(selectedChannel)}
          >
            下载二维码
          </Button>
        ]}
      >
        {selectedChannel && (
          <div style={{ textAlign: 'center' }}>
            <p>渠道编号: {selectedChannel.channelNumber}</p>
            <p>渠道名称: {selectedChannel.channelName}</p>
            <div className="flex justify-center">
              <div id={`qr-code-${selectedChannel.id}`}>
              <QRCode 
                className='flex-1'
                value={selectedChannel.shortLink} 
                size={200}
                bordered={false}
              />
            </div>
            </div>
            <p style={{ marginTop: 16 }}>
              <a href={selectedChannel.shortLink} target="_blank" rel="noopener noreferrer">
                {selectedChannel.shortLink}
              </a>
            </p>
          </div>
        )}
      </Modal>

      {/* 问卷查看模态框 */}
      <QuestionnaireViewModal
        open={isQuestionnaireModalVisible}
        onCancel={() => setIsQuestionnaireModalVisible(false)}
        questionnaireId={selectedQuestionnaireId || undefined}
      />
    </Layout>
  );
}
