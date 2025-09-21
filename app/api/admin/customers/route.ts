import { NextResponse } from 'next/server';
import { db } from '@/libs/database/db';
import { customers, questionnaires } from '@/libs/database/schema';
import { desc, like, and, gte, lte, eq, isNull, isNotNull, or } from 'drizzle-orm';
import { parseISO } from 'date-fns';

// 删除模拟客户数据

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const province = searchParams.get('province') || '';
    const city = searchParams.get('city') || '';
    const district = searchParams.get('district') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    
    console.log('API Parameters:', { search, province, city, district, startDate, endDate });
    
    // 构建查询条件
    let query: any = db
      .select({
        id: customers.id,
        customerNumber: customers.customerNumber,
        customerName: customers.customerName,
        applicationAmount: customers.applicationAmount,
        province: customers.province,
        city: customers.city,
        district: customers.district,
        phoneNumber: customers.phoneNumber,
        idCard: customers.idCard,
        submissionTime: customers.submissionTime,
        channelLink: customers.channelLink,
        createdAt: customers.createdAt,
        updatedAt: customers.updatedAt,
        selectedQuestions: customers.selectedQuestions,
        questionnaireName: questionnaires.questionnaireName
      })
      .from(customers)
      .leftJoin(questionnaires, eq(customers.questionnaireId, questionnaires.id));
    
    // 构建所有条件
    const whereConditions = [];
    
    // 搜索条件使用OR逻辑
    if (search) {
      whereConditions.push(or(
        like(customers.customerName, `%${search}%`),
        like(customers.phoneNumber, `%${search}%`),
        like(customers.idCard, `%${search}%`),
        like(customers.channelLink, `%${search}%`)
      ));
    }
    
    // 地域筛选条件使用AND逻辑
    if (province) {
      whereConditions.push(like(customers.province, `%${province}%`));
    }
    
    if (city) {
      whereConditions.push(like(customers.city, `%${city}%`));
    }
    
    if (district) {
      whereConditions.push(like(customers.district, `%${district}%`));
    }
    
    // 时间范围筛选条件使用AND逻辑
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      whereConditions.push(
        gte(customers.submissionTime, start),
        lte(customers.submissionTime, end)
      );
    } else if (startDate) {
      const start = new Date(startDate);
      whereConditions.push(gte(customers.submissionTime, start));
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereConditions.push(lte(customers.submissionTime, end));
    }
    
    // 应用所有条件
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }
    
    console.log('Query built successfully');
    
    // 添加排序（按创建时间倒序）
    const customerList = await query.orderBy(desc(customers.createdAt));
    
    console.log('Customer list fetched:', customerList.length);
    
    return NextResponse.json({
      customers: customerList,
      total: customerList.length
    });
  } catch (error) {
    console.error('获取客户数据失败:', error);
    return NextResponse.json(
      { error: '获取客户数据失败' },
      { status: 500 }
    );
  }
}