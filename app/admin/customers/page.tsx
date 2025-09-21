'use client';

import { useState, useEffect, useMemo } from 'react';
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
  message,
  Cascader,
  Typography
} from 'antd';
import AntdSidebar from '@/components/admin/antd-sidebar';
import CustomerQuestionViewModal from '@/components/admin/customer-question-view-modal';
import { provinces, cities, districts } from '@/lib/china-division';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { Header, Content, Footer, Sider } = Layout;
const { RangePicker } = DatePicker;

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
  
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        
        // 构建查询参数
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (provinceFilter) params.append('province', provinceFilter);
        if (cityFilter) params.append('city', cityFilter);
        if (districtFilter) params.append('district', districtFilter);
        if (dateRange[0]) params.append('startDate', dateRange[0].format('YYYY-MM-DD'));
        if (dateRange[1]) params.append('endDate', dateRange[1].format('YYYY-MM-DD'));
        
        // 调用真实的API获取客户数据
        const response = await fetch(`/api/admin/customers?${params.toString()}`);
        const data = await response.json();
        
        if (response.ok) {
          setCustomers(data.customers);
        } else {
          throw new Error(data.error || '获取客户数据失败');
        }
      } catch (error) {
        console.error('获取客户数据失败:', error);
        message.error('获取客户数据时发生错误');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [searchTerm, provinceFilter, cityFilter, districtFilter, dateRange]);

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
  const handleRegionChange = (value: string[] | null) => {
    // 确保value不为null或undefined
    const safeValue = value || [];
    setRegionCascaderValue(safeValue);
    
    if (safeValue.length > 0) {
      setProvinceFilter(safeValue[0] || '');
    } else {
      setProvinceFilter('');
    }
    
    if (safeValue.length > 1) {
      setCityFilter(safeValue[1] || '');
    } else {
      setCityFilter('');
    }
    
    if (safeValue.length > 2) {
      setDistrictFilter(safeValue[2] || '');
    } else {
      setDistrictFilter('');
    }
  };

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
                dataSource={customers}
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                rowKey="id"
                scroll={{ x: 'max-content' }}
              />
            </Card>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Admin 管理后台 ©{new Date().getFullYear()}
        </Footer>
      </Layout>
      
      {/* 查看选题模态框 */}
      <CustomerQuestionViewModal
        customer={currentCustomer}
        open={isViewQuestionsModalVisible}
        onCancel={handleViewQuestionsModalClose}
      />
    </Layout>
  );
}