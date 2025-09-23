import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { customers } from '@/libs/database/schema';
import { v4 as uuidv4 } from 'uuid';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/loan_db';
const client = postgres(connectionString);
const db = drizzle(client);

async function seedCustomers() {
  console.log('开始添加客户数据...');
  
  try {
    // 添加客户数据
    const customerData = [
      {
        customerName: '张三',
        applicationAmount: '50000',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        phoneNumber: '13800138000',
        idCard: '110101199001011234',
        submissionTime: new Date('2023-05-15T10:30:00Z'),
        channelLink: '渠道A',
        createdAt: new Date('2023-05-15T10:30:00Z'),
        updatedAt: new Date('2023-05-15T10:30:00Z')
      },
      {
        customerName: '李四',
        applicationAmount: '80000',
        province: '上海市',
        city: '上海市',
        district: '浦东新区',
        phoneNumber: '13900139000',
        idCard: '310101199002021234',
        submissionTime: new Date('2023-05-16T14:45:00Z'),
        channelLink: '渠道B',
        createdAt: new Date('2023-05-16T14:45:00Z'),
        updatedAt: new Date('2023-05-16T14:45:00Z')
      },
      {
        customerName: '王五',
        applicationAmount: '120000',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        phoneNumber: '13700137000',
        idCard: '440101199003031234',
        submissionTime: new Date('2023-05-17T09:15:00Z'),
        channelLink: '渠道C',
        createdAt: new Date('2023-05-17T09:15:00Z'),
        updatedAt: new Date('2023-05-17T09:15:00Z')
      }
    ];

    for (const customer of customerData) {
      const result = await db.insert(customers).values(customer).returning();
      console.log('客户创建成功:', result[0]);
    }

    console.log('客户数据添加完成');
  } catch (error) {
    console.error('添加客户数据时出错:', error);
  } finally {
    await client.end();
  }
}

seedCustomers();