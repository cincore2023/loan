'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UsergroupAddOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { 
  Button, 
  Input, 
  Table, 
  Tag, 
  Select, 
  DatePicker, 
  Layout, 
  theme,
  Space,
  Card,
  Row,
  Col,
  Popconfirm,
  message,
  Cascader,
  Modal,
  List,
  Descriptions,
  Empty,
  Typography
} from 'antd';
import AntdSidebar from '@/components/admin/antd-sidebar';
import { provinces, cities, districts } from '@/lib/china-division';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { Header, Content, Footer, Sider } = Layout;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

// 级联选择器选项类型
interface CascaderOption {
  value: string;
  label: string;
  children?: CascaderOption[];
}

interface Customer {
  id: string;
  customerNumber: string;
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
  questionnaireName?: string | null;
}

// 用户选择的题目和答案类型
interface CustomerSelectedQuestion {
  questionId: string;
  questionTitle: string;
  selectedOptionId: string;
  selectedOptionText: string;
  isCorrect: boolean;
  correctOptionId?: string;
  correctOptionText?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [regionCascaderValue, setRegionCascaderValue] = useState<string[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isViewQuestionsModalVisible, setIsViewQuestionsModalVisible] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const router = useRouter();
  
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // 模拟数据获取
        const mockCustomers: Customer[] = [
          {
            id: '1',
            customerNumber: 'CUST001',
            customerName: '张三',
            applicationAmount: '50000',
            province: '北京市',
            city: '北京市',
            district: '朝阳区',
            phoneNumber: '13800138000',
            idCard: '110101199001011234',
            submissionTime: '2023-05-15T10:30:00Z',
            channelLink: '渠道A',
            createdAt: '2023-05-15T10:30:00Z',
            updatedAt: '2023-05-15T10:30:00Z',
            selectedQuestions: [
              {
                questionId: 'q1',
                questionTitle: '您最喜欢的贷款产品类型是什么？',
                selectedOptionId: 'o1',
                selectedOptionText: '个人消费贷款',
                isCorrect: true,
                correctOptionId: 'o1',
                correctOptionText: '个人消费贷款'
              },
              {
                questionId: 'q2',
                questionTitle: '您希望的贷款期限是多长？',
                selectedOptionId: 'o3',
                selectedOptionText: '1-3年',
                isCorrect: true,
                correctOptionId: 'o3',
                correctOptionText: '1-3年'
              }
            ]
          },
          {
            id: '2',
            customerNumber: 'CUST002',
            customerName: '李四',
            applicationAmount: '80000',
            province: '上海市',
            city: '上海市',
            district: '浦东新区',
            phoneNumber: '13900139000',
            idCard: '310101199002021234',
            submissionTime: '2023-05-16T14:45:00Z',
            channelLink: '渠道B',
            createdAt: '2023-05-16T14:45:00Z',
            updatedAt: '2023-05-16T14:45:00Z',
            selectedQuestions: [
              {
                questionId: 'q1',
                questionTitle: '您最喜欢的贷款产品类型是什么？',
                selectedOptionId: 'o2',
                selectedOptionText: '房屋抵押贷款',
                isCorrect: false,
                correctOptionId: 'o1',
                correctOptionText: '个人消费贷款'
              }
            ]
          },
          {
            id: '3',
            customerNumber: 'CUST003',
            customerName: '王五',
            applicationAmount: '120000',
            province: '广东省',
            city: '深圳市',
            district: '南山区',
            phoneNumber: '13700137000',
            idCard: '440101199003031234',
            submissionTime: '2023-05-17T09:15:00Z',
            channelLink: '渠道C',
            createdAt: '2023-05-17T09:15:00Z',
            updatedAt: '2023-05-17T09:15:00Z'
          }
        ];
        
        setCustomers(mockCustomers);
      } catch (error) {
        console.error('获取客户数据失败:', error);
        message.error('获取客户数据时发生错误');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // 构建级联选择器选项
  const regionOptions = useMemo(() => {
    const options: CascaderOption[] = provinces.map(province => {
      const provinceCities = cities[province.code] || [];
      return {
        value: province.name,
        label: province.name,
        children: provinceCities.map(city => {
          const cityDistricts = districts[city.code] || [];
          return {
            value: city.name,
            label: city.name,
            children: cityDistricts.map(district => ({
              value: district.name,
              label: district.name
            }))
          };
        })
      };
    });
    return options;
  }, []);

  // 处理级联选择器变化
  const handleRegionChange = (value: string[]) => {
    setRegionCascaderValue(value);
    if (value.length > 0) {
      setProvinceFilter(value[0] || '');
    } else {
      setProvinceFilter('');
    }
    if (value.length > 1) {
      setCityFilter(value[1] || '');
    } else {
      setCityFilter('');
    }
    if (value.length > 2) {
      setDistrictFilter(value[2] || '');
    } else {
      setDistrictFilter('');
    }
  };

  // 筛选和搜索客户数据
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // 模糊搜索：客户名称、手机号、身份证、渠道
      const matchesSearch = 
        !searchTerm ||
        customer.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.idCard?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.channelLink?.toLowerCase().includes(searchTerm.toLowerCase());

      // 地域筛选
      const matchesProvince = !provinceFilter || customer.province === provinceFilter;
      const matchesCity = !cityFilter || customer.city === cityFilter;
      const matchesDistrict = !districtFilter || customer.district === districtFilter;

      // 提交时间筛选
      let matchesDate = true;
      if (dateRange[0] || dateRange[1]) {
        if (customer.submissionTime) {
          const submissionDate = new Date(customer.submissionTime);
          
          if (dateRange[0] && submissionDate < dateRange[0].toDate()) {
            matchesDate = false;
          }
          
          if (dateRange[1] && submissionDate > dateRange[1].toDate()) {
            matchesDate = false;
          }
        } else {
          matchesDate = false;
        }
      }

      return matchesSearch && matchesProvince && matchesCity && matchesDistrict && matchesDate;
    });
  }, [customers, searchTerm, provinceFilter, cityFilter, districtFilter, dateRange]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setProvinceFilter('');
    setCityFilter('');
    setDistrictFilter('');
    setDateRange([null, null]);
    setRegionCascaderValue([]);
  };

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates) {
      setDateRange(dates);
    } else {
      setDateRange([null, null]);
    }
  };

  const columns = [
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '申请额度',
      dataIndex: 'applicationAmount',
      key: 'applicationAmount',
      render: (amount: string | null) => (
        <Tag color={amount ? 'blue' : 'default'}>
          {amount ? `¥${amount}` : '未填写'}
        </Tag>
      ),
    },
    {
      title: '所属地区',
      key: 'region',
      render: (_: any, record: Customer) => (
        <span>{record.province || ''}{record.city || ''}{record.district || ''}</span>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone: string | null) => phone || '未填写',
    },
    {
      title: '身份证',
      dataIndex: 'idCard',
      key: 'idCard',
      render: (idCard: string | null) => 
        idCard ? idCard : '未填写',
    },
    {
      title: '渠道',
      dataIndex: 'channelLink',
      key: 'channelLink',
      render: (channel: string | null) => channel || '未填写',
    },
    {
      title: '问卷名称',
      dataIndex: 'questionnaireName',
      key: 'questionnaireName',
      render: (name: string | null) => name || '未填写',
    },
    {
      title: '提交时间',
      dataIndex: 'submissionTime',
      key: 'submissionTime',
      render: (time: string | null) => 
        time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '未填写',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Customer) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewQuestions(record)}>查看选题</Button>
        </Space>
      ),
    },
  ];

  const handleViewQuestions = (record: Customer) => {
    setCurrentCustomer(record);
    setIsViewQuestionsModalVisible(true);
  };

  const handleViewQuestionsModalClose = () => {
    setIsViewQuestionsModalVisible(false);
    setCurrentCustomer(null);
  };

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
                  <UsergroupAddOutlined style={{ marginRight: 8 }} />
                  <span>客户资料</span>
                </div>
              }
            >
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }} justify="end">
                <Col xs={24} sm={12} md={6}>
                  <Input
                    placeholder="搜索客户..."
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Cascader
                    options={regionOptions}
                    onChange={handleRegionChange}
                    value={regionCascaderValue}
                    placeholder="请选择省/市/区"
                    showSearch
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <RangePicker 
                    style={{ width: '100%' }}
                    value={dateRange}
                    onChange={handleDateChange}
                    placeholder={['开始时间', '结束时间']}
                  />
                </Col>
                <Col xs={24} sm={12} md={2}>
                  <Button onClick={handleClearFilters}>
                    清除筛选
                  </Button>
                </Col>
              </Row>
              <Table
                columns={columns}
                dataSource={filteredCustomers}
                loading={loading}
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
      
      {/* 查看选题模态框 */}
      <Modal
        title="用户选题详情"
        open={isViewQuestionsModalVisible}
        onCancel={handleViewQuestionsModalClose}
        footer={[
          <Button key="close" onClick={handleViewQuestionsModalClose}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {currentCustomer && (
          <div>
            <Descriptions title="客户信息" column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="客户编号">{currentCustomer.customerNumber}</Descriptions.Item>
              <Descriptions.Item label="客户名称">{currentCustomer.customerName}</Descriptions.Item>
            </Descriptions>
            
            {currentCustomer.selectedQuestions && currentCustomer.selectedQuestions.length > 0 ? (
              <div>
                <Title level={5} style={{ marginBottom: 16 }}>选题详情</Title>
                <List
                  dataSource={currentCustomer.selectedQuestions}
                  renderItem={(item) => (
                    <List.Item>
                      <Card 
                        size="small" 
                        style={{ width: '100%' }}
                        title={item.questionTitle}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Tag color={item.isCorrect ? 'success' : 'error'}>
                              {item.isCorrect ? '正确' : '错误'}
                            </Tag>
                            <span style={{ marginLeft: 8 }}>用户选择: {item.selectedOptionText}</span>
                          </div>
                          {!item.isCorrect && item.correctOptionText && (
                            <div>
                              <span style={{ marginLeft: 8 }}>正确答案: {item.correctOptionText}</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />

              </div>
            ) : (
              <Empty description="该客户暂未选择任何题目" />
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
}