'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LinkOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  CopyOutlined
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
  QRCode,
  Tooltip
} from 'antd';
import AntdSidebar from '@/components/admin/antd-sidebar';
import QuestionnaireViewModal from '@/components/admin/questionnaire-view-modal';
import ChannelQuestionnaireViewModal from '@/components/admin/channel-questionnaire-view-modal';
import { exportChannelsToExcel } from '@/lib/export-utils';
import { authFetch } from '@/libs/auth/auth-client';

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
  downloadLink: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface Questionnaire {
  id: string;
  questionnaireNumber: string;
  questionnaireName: string;
}

// 降级复制文本到剪贴板的函数
const fallbackCopyTextToClipboard = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // 避免滚动到底部
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      message.success('链接已复制到剪贴板');
    } else {
      message.error('复制失败');
    }
  } catch (err) {
    console.error('复制命令失败:', err);
    message.error('复制失败');
  }
  
  document.body.removeChild(textArea);
};

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);
  const [isQuestionnaireModalVisible, setIsQuestionnaireModalVisible] = useState(false);
  const [isChannelQuestionnaireModalVisible, setIsChannelQuestionnaireModalVisible] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string | null>(null);
  const [selectedCustomerSelectedQuestions, setSelectedCustomerSelectedQuestions] = useState<any[]>([]);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({
    startDate: '',
    endDate: ''
  });
  // 添加搜索关键词状态
  const [searchKeyword, setSearchKeyword] = useState('');
  // 添加渠道链接状态
  const [generatedLink, setGeneratedLink] = useState('');

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 监听渠道编号变化，实时更新生成的链接
  useEffect(() => {
    const channelNumber = form.getFieldValue('channelNumber');
    if (channelNumber) {
      const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'https://loan.example.com';
      setGeneratedLink(`${currentDomain}/h5?channelId=${channelNumber}`);
    } else {
      setGeneratedLink('');
    }
  }, [form, form.getFieldValue('channelNumber')]);

  // 获取渠道列表
  useEffect(() => {
    fetchChannels();
    fetchQuestionnaires();
  }, []);

  // 获取问卷列表
  const fetchQuestionnaires = async () => {
    try {
      setLoading(true);
      // 使用 authFetch 替代 fetch
      const response = await authFetch('/api/admin/questionnaires');
      const data = await response.json();

      if (response.ok) {
        setQuestionnaires(data.questionnaires);
      } else {
        message.error(data.error || '获取问卷列表失败');
      }
    } catch (error) {
      console.error('Failed to fetch questionnaires:', error);
      message.error('获取问卷列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async (searchKeywordLocal?: string) => {
    try {
      setLoading(true);
      let url = '/api/admin/channels';
      const params = new URLSearchParams();

      if (searchParams.startDate) {
        params.append('startDate', searchParams.startDate);
      }

      if (searchParams.endDate) {
        params.append('endDate', searchParams.endDate);
      }

      // 添加搜索关键词参数
      if (searchKeywordLocal !== undefined ? searchKeywordLocal : searchKeyword) {
        params.append('search', searchKeywordLocal !== undefined ? searchKeywordLocal : searchKeyword);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      // 使用 authFetch 替代 fetch
      const response = await authFetch(url);
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
      tags: record.tags ? record.tags.join(', ') : '',
      // 确保状态字段正确设置
      isActive: record.isActive !== undefined ? record.isActive : true,
      isDefault: record.isDefault !== undefined ? record.isDefault : false
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // 使用 authFetch 替代 fetch
      const response = await authFetch('/api/admin/channels', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
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

      // 使用 authFetch 替代 fetch
      const response = await authFetch('/api/admin/channels', {
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
          isDefault: channel.isDefault, // 确保包含 isDefault 字段
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

  // 添加搜索处理函数
  const handleSearch = () => {
    fetchChannels();
  };

  // 添加重置搜索处理函数
  const handleResetSearch = () => {
    setSearchKeyword('');
    setSearchParams({
      startDate: '',
      endDate: ''
    });
    // 重置后重新获取所有数据
    setTimeout(() => {
      fetchChannels('');
    }, 0);
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      // 处理 tags 字段，将逗号分隔的字符串转换为数组
      if (values.tags) {
        values.tags = values.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
      } else {
        values.tags = [];
      }
      
      // 确保布尔值字段正确设置
      values.isActive = values.isActive !== undefined ? values.isActive : true;
      values.isDefault = values.isDefault !== undefined ? values.isDefault : false;
      
      if (editingChannel) {
        // 编辑渠道
        // 使用 authFetch 替代 fetch
        const response = await authFetch('/api/admin/channels', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...values, id: editingChannel.id }),
        });

        const data = await response.json();

        if (response.ok) {
          message.success('渠道更新成功');
          fetchChannels(); // 重新获取渠道列表
        } else {
          message.error(data.error || '更新渠道失败');
        }
      } else {
        // 创建新渠道
        // 使用 authFetch 替代 fetch
        const response = await authFetch('/api/admin/channels', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
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
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = () => {
    form.validateFields()
      .then(values => {
        // 处理 tags 字段，将逗号分隔的字符串转换为数组
        if (values.tags) {
          values.tags = values.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
        } else {
          values.tags = [];
        }
        handleSubmit(values);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
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

  const handleViewQuestionnaire = async (id: string) => {
    try {
      // 使用 authFetch 替代 fetch
      const response = await authFetch(`/api/admin/channels?id=${id}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok) {
        setSelectedQuestionnaireId(data.channel.questionnaireId);
        setIsQuestionnaireModalVisible(true);
      } else {
        message.error(data.error || '获取问卷失败');
      }
    } catch (error) {
      console.error('Failed to fetch questionnaire:', error);
      message.error('获取问卷失败');
    }
  };

  // 新增函数：查看渠道问卷详情（带用户选择）
  const handleViewChannelQuestionnaire = (record: Channel) => {
    setSelectedChannel(record);
    setSelectedQuestionnaireId(record.questionnaireId || null);
    // 这里应该从客户数据中获取用户选择的答案
    // 由于渠道本身不直接关联客户数据，我们暂时传入空数组
    setSelectedCustomerSelectedQuestions([]);
    setIsChannelQuestionnaireModalVisible(true);
  };

  // 导出渠道数据
  const handleExportChannels = () => {
    if (channels.length === 0) {
      message.warning('没有可导出的数据');
      return;
    }

    // 转换数据格式以匹配导出函数的要求
    const exportData = channels.map(channel => ({
      ...channel,
      questionnaireName: questionnaires.find(q => q.id === channel.questionnaireId)?.questionnaireName || ''
    }));

    exportChannelsToExcel(exportData);
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
      title: '是否默认',
      dataIndex: 'isDefault',
      key: 'isDefault',
      render: (isDefault: boolean) => (
        <Tag color={isDefault ? 'green' : 'default'}>
          {isDefault ? '是' : '否'}
        </Tag>
      ),
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
        <Space>
          <a href={link} target="_blank" rel="noopener noreferrer">
            {link || '未设置'}
          </a>
          {link && (
            <Button 
              type="text" 
              icon={<CopyOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                // 首先尝试使用现代的 clipboard API
                if (navigator.clipboard && window.isSecureContext) {
                  navigator.clipboard.writeText(link).then(() => {
                    message.success('短链接已复制到剪贴板');
                  }).catch(err => {
                    console.error('Clipboard API 失败:', err);
                    // 如果 Clipboard API 失败，使用降级方案
                    fallbackCopyTextToClipboard(link);
                  });
                } else {
                  // 如果不支持 Clipboard API，直接使用降级方案
                  fallbackCopyTextToClipboard(link);
                }
              }}
            />
          )}
        </Space>
      ),
    },
    {
      title: 'app下载链接',
      dataIndex: 'downloadLink',
      key: 'downloadLink',
      render: (link: string) => (
        <Space>
          <a href={link} target="_blank" rel="noopener noreferrer">
            {link || '未设置'}
          </a>
          {link && (
            <Button 
              type="text" 
              icon={<CopyOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                // 首先尝试使用现代的 clipboard API
                if (navigator.clipboard && window.isSecureContext) {
                  navigator.clipboard.writeText(link).then(() => {
                    message.success('下载链接已复制到剪贴板');
                  }).catch(err => {
                    console.error('Clipboard API 失败:', err);
                    // 如果 Clipboard API 失败，使用降级方案
                    fallbackCopyTextToClipboard(link);
                  });
                } else {
                  // 如果不支持 Clipboard API，直接使用降级方案
                  fallbackCopyTextToClipboard(link);
                }
              }}
            />
          )}
        </Space>
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
              onClick={() => handleViewChannelQuestionnaire(record)}
            >
              查看选题
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
                <Space>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleExportChannels}
                  >
                    导出数据
                  </Button>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddChannel}>
                    添加渠道
                  </Button>
                </Space>
              }
            >
              {/* 添加筛选控件 */}
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }} justify="end">
                <Col>
                  <Input
                    placeholder="请输入渠道编号搜索"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    style={{ width: 200 }}
                  />
                </Col>
                <Col>
                  <RangePicker
                    onChange={handleDateChange}
                    placeholder={['开始日期', '结束日期']}
                    format="YYYY-MM-DD"
                  />
                </Col>
                <Col>
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
            <Input 
              placeholder="请输入渠道编号" 
              onChange={(e) => {
                // 手动触发链接更新
                const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'https://loan.example.com';
                setGeneratedLink(e.target.value ? `${currentDomain}/h5?channelId=${e.target.value}` : '');
              }}
            />
          </Form.Item>
          <Form.Item
            label="渠道名称"
            name="channelName"
            rules={[{ required: true, message: '请输入渠道名称' }]}
          >
            <Input placeholder="请输入渠道名称" />
          </Form.Item>
          <Form.Item
            label="是否默认渠道"
            name="isDefault"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="是"
              unCheckedChildren="否"
            />
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
          {/* 渠道链接字段 - 禁用状态，根据渠道编号自动生成 */}
          <Form.Item label="渠道链接">
            <Space.Compact style={{ width: '100%' }}>
              <Input 
                style={{ width: 'calc(100% - 32px)' }}
                disabled
                value={generatedLink}
                placeholder="填写渠道编号后自动生成"
              />
              <Tooltip title="复制链接">
                <Button 
                  icon={<CopyOutlined />} 
                  onClick={(e) => {
                    if (generatedLink) {
                      // 首先尝试使用现代的 clipboard API
                      if (navigator.clipboard && window.isSecureContext) {
                        navigator.clipboard.writeText(generatedLink).then(() => {
                          message.success('链接已复制到剪贴板');
                        }).catch(err => {
                          console.error('Clipboard API 失败:', err);
                          // 如果 Clipboard API 失败，使用降级方案
                          fallbackCopyTextToClipboard(generatedLink);
                        });
                      } else {
                        // 如果不支持 Clipboard API，直接使用降级方案
                        fallbackCopyTextToClipboard(generatedLink);
                      }
                    } else {
                      message.warning('没有可复制的链接');
                    }
                  }}
                />
              </Tooltip>
            </Space.Compact>
          </Form.Item>
          {/* 短链接字段 - 可自行填入 */}
          <Form.Item
            label="短链接"
            name="shortLink"
          >
            <Input placeholder="请输入短链接" />
          </Form.Item>
          <Form.Item
            label="app下载链接"
            name="downloadLink"
          >
            <Input placeholder="请输入app下载链接" />
          </Form.Item>
          <Form.Item
            label="是否启用"
            name="isActive"
            valuePropName="checked"
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
              <Space>
                <a href={selectedChannel.shortLink} target="_blank" rel="noopener noreferrer">
                  {selectedChannel.shortLink}
                </a>
                {selectedChannel.shortLink && (
                  <Button 
                    type="text" 
                    icon={<CopyOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedChannel.shortLink) {
                        // 首先尝试使用现代的 clipboard API
                        if (navigator.clipboard && window.isSecureContext) {
                          navigator.clipboard.writeText(selectedChannel.shortLink).then(() => {
                            message.success('短链接已复制到剪贴板');
                          }).catch(err => {
                            console.error('Clipboard API 失败:', err);
                            // 如果 Clipboard API 失败，使用降级方案
                            fallbackCopyTextToClipboard(selectedChannel.shortLink);
                          });
                        } else {
                          // 如果不支持 Clipboard API，直接使用降级方案
                          fallbackCopyTextToClipboard(selectedChannel.shortLink);
                        }
                      }
                    }}
                  />
                )}
              </Space>
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

      {/* 渠道问卷查看模态框（带用户选择） */}
      <ChannelQuestionnaireViewModal
        open={isChannelQuestionnaireModalVisible}
        onCancel={() => setIsChannelQuestionnaireModalVisible(false)}
        questionnaireId={selectedQuestionnaireId || undefined}
        customerSelectedQuestions={selectedCustomerSelectedQuestions}
      />
    </Layout>
  );
}