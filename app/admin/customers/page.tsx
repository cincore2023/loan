'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  UsergroupAddOutlined,
  EyeOutlined,
  SearchOutlined,
  DownloadOutlined
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
  Typography,
  Dropdown
} from 'antd';
import AntdSidebar from '@/components/admin/antd-sidebar';
import CustomerQuestionViewModal from '@/components/admin/customer-question-view-modal';
import { provinces, cities, districts } from '@/lib/china-division';
import { formatCurrency, formatPhoneNumber, formatIdCard, formatDateTime } from '@/lib/utils';
import { exportCustomersToExcel, exportMultipleQuestionnaires } from '@/lib/export-utils';
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
          {amount ? formatCurrency(amount) : '未填写'}
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
    },
    {
      title: '身份证',
      dataIndex: 'idCard',
      key: 'idCard',
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
      render: (time: string | null) => formatDateTime(time, 'YYYY-MM-DD HH:mm:ss'),
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

  // 按问卷分组客户数据
  const groupedCustomers = useMemo(() => {
    return customers.reduce((acc: Record<string, Customer[]>, customer) => {
      const questionnaireName = customer.questionnaireName || '未命名问卷';
      if (!acc[questionnaireName]) {
        acc[questionnaireName] = [];
      }
      acc[questionnaireName].push(customer);
      return acc;
    }, {});
  }, [customers]);

  // 导出单个问卷数据
  const handleExportQuestionnaire = async (questionnaireName: string) => {
    const customersToExport = groupedCustomers[questionnaireName] || [];
    if (customersToExport.length === 0) {
      message.warning('该问卷暂无客户数据');
      return;
    }
    exportCustomersToExcel(customersToExport, questionnaireName);
  };

  // 导出所有问卷数据
  const handleExportAll = async () => {
    if (customers.length === 0) {
      message.warning('暂无客户数据可导出');
      return;
    }
    
    try {
      // 调用API获取分组数据
      const response = await fetch('/api/admin/customers?action=export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          search: searchTerm,
          province: provinceFilter,
          city: cityFilter,
          district: districtFilter,
          startDate: dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : '',
          endDate: dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : '',
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        exportMultipleQuestionnaires(data.groupedCustomers);
      } else {
        message.error(data.error || '导出失败');
      }
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请稍后再试');
    }
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <UsergroupAddOutlined style={{ marginRight: 8 }} />
                    <span>客户资料</span>
                  </div>
                  <div>
                    <Dropdown
                      trigger={['click']}
                      menu={{
                        items: [
                          {
                            key: 'export-all',
                            label: '导出所有问卷数据',
                            onClick: handleExportAll
                          },
                          ...Object.keys(groupedCustomers).map((questionnaireName, index) => ({
                            key: `export-${index}`,
                            label: `导出 ${questionnaireName}`,
                            onClick: () => handleExportQuestionnaire(questionnaireName)
                          }))
                        ]
                      }}
                    >
                      <Button type="primary" icon={<DownloadOutlined />}>
                        导出数据
                      </Button>
                    </Dropdown>
                  </div>
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