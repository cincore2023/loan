import { NextResponse } from 'next/server';

// 模拟客户数据
const mockCustomers = [
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
    updatedAt: '2023-05-15T10:30:00Z'
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
    updatedAt: '2023-05-16T14:45:00Z'
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

export async function GET() {
  try {
    // 模拟数据库查询延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      customers: mockCustomers,
      total: mockCustomers.length
    });
  } catch (error) {
    console.error('获取客户数据失败:', error);
    return NextResponse.json(
      { error: '获取客户数据失败' },
      { status: 500 }
    );
  }
}