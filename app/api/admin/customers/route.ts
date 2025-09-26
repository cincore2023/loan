import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/libs/database/db';
import { customers, questionnaires, channels } from '@/libs/database/schema';
import { desc, like, and, gte, lte, eq, isNull, isNotNull, or } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// 定义客户数据的验证模式
const customerSchema = z.object({
  id: z.string().optional(),
  customerName: z.string().optional(),
  applicationAmount: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  phoneNumber: z.string().optional(),
  idCard: z.string().optional(),
  submissionTime: z.string().optional(),
  questionnaireId: z.string().optional(),
  selectedQuestions: z.array(z.object({
    questionId: z.string(),
    questionTitle: z.string(),
    selectedOptionId: z.string(),
    selectedOptionText: z.string(),
  })).optional(),
  channelLink: z.string().optional(),
  channelId: z.string().optional(), // 添加渠道ID字段
});

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
        customerName: customers.customerName,
        applicationAmount: customers.applicationAmount,
        province: customers.province,
        city: customers.city,
        district: customers.district,
        phoneNumber: customers.phoneNumber,
        idCard: customers.idCard,
        submissionTime: customers.submissionTime,
        channelLink: customers.channelLink,
        channelId: customers.channelId, // 添加渠道ID
        createdAt: customers.createdAt,
        updatedAt: customers.updatedAt,
        selectedQuestions: customers.selectedQuestions,
        questionnaireName: questionnaires.questionnaireName,
        channelName: channels.channelName // 添加渠道名称
      })
      .from(customers)
      .leftJoin(questionnaires, eq(customers.questionnaireId, questionnaires.id))
      .leftJoin(channels, eq(customers.channelLink, channels.shortLink)); // 连接渠道表
    
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

// 创建客户数据
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // 如果是导出请求
    if (action === 'export') {
      const body = await request.json();
      const { search, province, city, district, startDate, endDate } = body;
      
      console.log('Export Parameters:', { search, province, city, district, startDate, endDate });
      
      // 构建查询条件
      let query: any = db
        .select({
          id: customers.id,
          customerName: customers.customerName,
          applicationAmount: customers.applicationAmount,
          province: customers.province,
          city: customers.city,
          district: customers.district,
          phoneNumber: customers.phoneNumber,
          idCard: customers.idCard,
          submissionTime: customers.submissionTime,
          channelLink: customers.channelLink,
          channelId: customers.channelId, // 添加渠道ID
          createdAt: customers.createdAt,
          updatedAt: customers.updatedAt,
          selectedQuestions: customers.selectedQuestions,
          questionnaireName: questionnaires.questionnaireName,
          channelName: channels.channelName // 添加渠道名称
        })
        .from(customers)
        .leftJoin(questionnaires, eq(customers.questionnaireId, questionnaires.id))
        .leftJoin(channels, eq(customers.channelLink, channels.shortLink)); // 连接渠道表

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
      
      console.log('Export query built successfully');
      
      // 添加排序（按创建时间倒序）
      const customerList = await query.orderBy(desc(customers.createdAt));
      
      console.log('Customer list for export fetched:', customerList.length);
      
      // 按问卷分组
      const groupedCustomers: Record<string, any[]> = {};
      customerList.forEach((customer: any) => {
        const questionnaireName = customer.questionnaireName || '未命名问卷';
        if (!groupedCustomers[questionnaireName]) {
          groupedCustomers[questionnaireName] = [];
        }
        groupedCustomers[questionnaireName].push(customer);
      });
      
      return NextResponse.json({
        groupedCustomers,
        total: customerList.length
      });
    }
    
    // 创建客户数据的处理
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = customerSchema.parse(body);
    
    // 创建新客户
    const newCustomer = await db.insert(customers).values({
      id: uuidv4(),
      customerName: validatedData.customerName || null,
      applicationAmount: validatedData.applicationAmount,
      province: validatedData.province,
      city: validatedData.city,
      district: validatedData.district,
      phoneNumber: validatedData.phoneNumber,
      idCard: validatedData.idCard,
      submissionTime: validatedData.submissionTime ? new Date(validatedData.submissionTime) : new Date(),
      questionnaireId: validatedData.questionnaireId && validatedData.questionnaireId !== '' ? validatedData.questionnaireId : null,
      selectedQuestions: validatedData.selectedQuestions || [],
      channelLink: validatedData.channelLink,
      channelId: validatedData.channelId, // 添加渠道ID
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // 如果有提交时间且有选择的问题，则更新渠道的问卷填写总数
    if (validatedData.submissionTime && validatedData.selectedQuestions && validatedData.selectedQuestions.length > 0) {
      // 优先使用渠道ID，如果没有则尝试使用渠道链接
      let channel = null;
      
      if (validatedData.channelId) {
        // 根据渠道编号找到对应的渠道（注意：前端传递的是渠道编号，不是数据库ID）
        channel = await db.select().from(channels).where(eq(channels.channelNumber, validatedData.channelId)).limit(1);
      } else if (validatedData.channelLink) {
        // 根据渠道链接找到对应的渠道
        channel = await db.select().from(channels).where(eq(channels.shortLink, validatedData.channelLink)).limit(1);
      }
      
      if (channel && channel.length > 0) {
        await db.update(channels).set({
          questionnaireSubmitCount: (channel[0].questionnaireSubmitCount || 0) + 1,
          updatedAt: new Date()
        }).where(eq(channels.id, channel[0].id));
      }
    }
    
    return NextResponse.json(newCustomer[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: '验证失败', details: error.issues }, { status: 400 });
    }
    
    console.error('创建客户数据失败:', error);
    return NextResponse.json({ error: '创建客户数据失败' }, { status: 500 });
  }
}

// 更新客户数据
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: '客户ID不能为空' }, { status: 400 });
    }
    
    // 验证请求数据
    const validatedData = customerSchema.parse({
      ...body,
      customerName: body.customerName || undefined,
    });
    
    // 检查客户是否存在
    const existingCustomer = await db.select().from(customers).where(eq(customers.id, body.id)).limit(1);
    
    if (existingCustomer.length === 0) {
      return NextResponse.json({ error: '客户不存在' }, { status: 404 });
    }
    
    // 更新客户
    const updatedCustomer = await db.update(customers).set({
      customerName: validatedData.customerName || existingCustomer[0].customerName || null,
      applicationAmount: validatedData.applicationAmount || existingCustomer[0].applicationAmount,
      province: validatedData.province || existingCustomer[0].province,
      city: validatedData.city || existingCustomer[0].city,
      district: validatedData.district || existingCustomer[0].district,
      phoneNumber: validatedData.phoneNumber || existingCustomer[0].phoneNumber,
      idCard: validatedData.idCard || existingCustomer[0].idCard,
      submissionTime: validatedData.submissionTime ? new Date(validatedData.submissionTime) : existingCustomer[0].submissionTime,
      questionnaireId: validatedData.questionnaireId && validatedData.questionnaireId !== '' ? validatedData.questionnaireId : (existingCustomer[0].questionnaireId || null),
      selectedQuestions: validatedData.selectedQuestions || existingCustomer[0].selectedQuestions || [],
      channelLink: validatedData.channelLink || existingCustomer[0].channelLink,
      channelId: validatedData.channelId || existingCustomer[0].channelId, // 更新渠道ID
      updatedAt: new Date(),
    }).where(eq(customers.id, body.id)).returning();
    
    // 如果这是第一次提交完整的个人信息（之前没有提交时间或者selectedQuestions为空），则更新渠道的问卷填写总数
    const isFirstSubmission = !existingCustomer[0].submissionTime || 
                             !existingCustomer[0].selectedQuestions || 
                             existingCustomer[0].selectedQuestions.length === 0;
    
    if (isFirstSubmission) {
      // 优先使用渠道ID，如果没有则尝试使用渠道链接
      let channel = null;
      
      if (validatedData.channelId) {
        // 根据渠道编号找到对应的渠道（注意：前端传递的是渠道编号，不是数据库ID）
        channel = await db.select().from(channels).where(eq(channels.channelNumber, validatedData.channelId)).limit(1);
      } else if (validatedData.channelLink) {
        // 根据渠道链接找到对应的渠道
        channel = await db.select().from(channels).where(eq(channels.shortLink, validatedData.channelLink)).limit(1);
      }
      
      if (channel && channel.length > 0) {
        await db.update(channels).set({
          questionnaireSubmitCount: (channel[0].questionnaireSubmitCount || 0) + 1,
          updatedAt: new Date()
        }).where(eq(channels.id, channel[0].id));
      }
    }
    
    return NextResponse.json(updatedCustomer[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: '验证失败', details: error.issues }, { status: 400 });
    }
    
    console.error('更新客户数据失败:', error);
    return NextResponse.json({ error: '更新客户数据失败' }, { status: 500 });
  }
}
