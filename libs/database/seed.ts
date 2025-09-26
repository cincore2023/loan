import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { admins, questionnaires, channels } from './schema';
import { hashPassword } from '@/libs/auth/password';
import { sql } from 'drizzle-orm';

// 从环境变量获取数据库连接字符串
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/loan_db';
const client = postgres(connectionString);
const db = drizzle(client);

async function seed() {
  console.log('开始添加种子数据...');
  
  try {
    // 检查是否已存在管理员用户
    const existingAdmins = await db.select().from(admins).limit(1);
    
    if (existingAdmins.length === 0) {
      // 加密默认管理员密码
      const hashedPassword = await hashPassword('admin123');
      
      // 添加默认管理员用户（已移除邮箱字段）
      const result = await db.insert(admins).values({
        name: 'admin',
        password: hashedPassword, // 使用加密密码
        isActive: true,
      }).returning();
      
      console.log('默认管理员用户创建成功:', result[0]);
    } else {
      console.log('管理员用户已存在，跳过创建');
    }
    
    // 检查是否已存在问卷
    const existingQuestionnaires = await db.select().from(questionnaires).limit(1);
    
    if (existingQuestionnaires.length === 0) {
      // 添加默认问卷
      const questionnaireResult = await db.insert(questionnaires).values({
        questionnaireNumber: 'QN001',
        questionnaireName: '贷款申请问卷',
        remark: '默认贷款申请问卷',
        questions: [
          {
            id: 'q1',
            title: '您的年龄是？',
            options: [
              { id: 'o1', text: '18-25岁' },
              { id: 'o2', text: '26-35岁' },
              { id: 'o3', text: '36-45岁' },
              { id: 'o4', text: '46岁以上' }
            ]
          },
          {
            id: 'q2',
            title: '您的月收入范围是？',
            options: [
              { id: 'o1', text: '5000元以下' },
              { id: 'o2', text: '5000-10000元' },
              { id: 'o3', text: '10000-20000元' },
              { id: 'o4', text: '20000元以上' }
            ]
          }
        ]
      }).returning();
      
      console.log('默认问卷创建成功:', questionnaireResult[0]);
    } else {
      console.log('问卷已存在，跳过创建');
    }
    
    // 检查是否已存在渠道
    const existingChannels = await db.select().from(channels).limit(1);
    
    if (existingChannels.length === 0) {
      // 获取问卷ID
      const questionnaire = await db.select().from(questionnaires).limit(1);
      
      if (questionnaire.length > 0) {
        // 添加默认渠道
        const channelResult = await db.insert(channels).values({
          channelNumber: 'CH001',
          channelName: '默认渠道',
          questionnaireId: questionnaire[0].id,
          remark: '默认测试渠道',
          shortLink: 'https://loan.example.com/ch001',
          isActive: true
        }).returning();
        
        console.log('默认渠道创建成功:', channelResult[0]);
      }
    } else {
      console.log('渠道已存在，跳过创建');
      // 检查是否存在默认渠道，如果不存在则创建一个
      const defaultChannel = await db.select().from(channels).where(sql`channel_name = '默认渠道'`).limit(1);
      if (defaultChannel.length === 0) {
        // 获取问卷ID
        const questionnaire = await db.select().from(questionnaires).limit(1);
        
        if (questionnaire.length > 0) {
          // 添加默认渠道
          const channelResult = await db.insert(channels).values({
            channelNumber: 'CH001',
            channelName: '默认渠道',
            questionnaireId: questionnaire[0].id,
            remark: '默认测试渠道',
            shortLink: '',
            isActive: true,
            isDefault: true
          }).returning();
          
          console.log('默认渠道创建成功:', channelResult[0]);
        }
      }
    }

    // 注意：默认客户不创建
    
    console.log('种子数据添加完成');
  } catch (error) {
    console.error('添加种子数据时出错:', error);
  } finally {
    await client.end();
  }
}

seed();