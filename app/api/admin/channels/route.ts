import { NextResponse } from 'next/server';
import { db } from '@/libs/database/db';
import { channels, questionnaires } from '@/libs/database/schema';
import { count, desc, eq, like, and, gte, lte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// 获取渠道列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    
    console.log('API Parameters:', { page, pageSize, search, startDate, endDate });
    
    // 构建查询条件
    let query: any = db
      .select({
        id: channels.id,
        channelNumber: channels.channelNumber,
        channelName: channels.channelName,
        questionnaireId: channels.questionnaireId,
        uvCount: channels.uvCount,
        questionnaireSubmitCount: channels.questionnaireSubmitCount,
        remark: channels.remark,
        shortLink: channels.shortLink,
        tags: channels.tags,
        downloadLink: channels.downloadLink,
        isDefault: channels.isDefault,
        createdAt: channels.createdAt,
        updatedAt: channels.updatedAt,
        isActive: channels.isActive,
        questionnaireName: questionnaires.questionnaireName
      })
      .from(channels)
      .leftJoin(questionnaires, eq(channels.questionnaireId, questionnaires.id));
    
    // 添加搜索条件
    if (search) {
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // 设置结束时间为当天的最后一毫秒
        
        query = query.where(
          and(
            like(channels.channelNumber, `%${search}%`),
            gte(channels.createdAt, start),
            lte(channels.createdAt, end)
          )
        );
      } else if (startDate) {
        const start = new Date(startDate);
        query = query.where(
          and(
            like(channels.channelNumber, `%${search}%`),
            gte(channels.createdAt, start)
          )
        );
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // 设置结束时间为当天的最后一毫秒
        query = query.where(
          and(
            like(channels.channelNumber, `%${search}%`),
            lte(channels.createdAt, end)
          )
        );
      } else {
        // 只有搜索条件，没有日期条件
        query = query.where(like(channels.channelNumber, `%${search}%`));
      }
    } else {
      // 只有日期条件，没有搜索条件
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // 设置结束时间为当天的最后一毫秒
        
        query = query.where(
          and(
            gte(channels.createdAt, start),
            lte(channels.createdAt, end)
          )
        );
      } else if (startDate) {
        const start = new Date(startDate);
        query = query.where(gte(channels.createdAt, start));
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // 设置结束时间为当天的最后一毫秒
        query = query.where(lte(channels.createdAt, end));
      }
    }
    
    console.log('Query built successfully');
    
    // 添加排序和分页
    const channelList = await query
      .orderBy(desc(channels.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    
    console.log('Channel list fetched:', channelList.length);
    
    // 获取渠道总数（需要考虑筛选条件）
    let countQuery: any = db.select({ count: count() }).from(channels);
    
    // 添加相同的筛选条件到计数查询
    if (search) {
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        countQuery = countQuery.where(
          and(
            like(channels.channelNumber, `%${search}%`),
            gte(channels.createdAt, start),
            lte(channels.createdAt, end)
          )
        );
      } else if (startDate) {
        const start = new Date(startDate);
        countQuery = countQuery.where(
          and(
            like(channels.channelNumber, `%${search}%`),
            gte(channels.createdAt, start)
          )
        );
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        countQuery = countQuery.where(
          and(
            like(channels.channelNumber, `%${search}%`),
            lte(channels.createdAt, end)
          )
        );
      } else {
        // 只有搜索条件，没有日期条件
        countQuery = countQuery.where(like(channels.channelNumber, `%${search}%`));
      }
    } else {
      // 只有日期条件，没有搜索条件
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        countQuery = countQuery.where(
          and(
            gte(channels.createdAt, start),
            lte(channels.createdAt, end)
          )
        );
      } else if (startDate) {
        const start = new Date(startDate);
        countQuery = countQuery.where(gte(channels.createdAt, start));
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        countQuery = countQuery.where(lte(channels.createdAt, end));
      }
    }
    
    const channelCountResult = await countQuery;
    const channelCount = channelCountResult[0].count;
    
    console.log('Channel count:', channelCount);

    return NextResponse.json({
      channels: channelList,
      total: channelCount,
      page,
      pageSize
    });
  } catch (error: any) {
    console.error('Failed to fetch channels:', error);
    return NextResponse.json({ error: 'Failed to fetch channels', details: error.message }, { status: 500 });
  }
}

// 创建渠道
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 生成唯一的渠道编号
    const channelNumber = body.channelNumber || `CH${Date.now()}`;
    
    const newChannel = await db.insert(channels).values({
      id: uuidv4(),
      channelNumber,
      channelName: body.channelName,
      questionnaireId: body.questionnaireId,
      remark: body.remark,
      shortLink: body.shortLink, // 用户自定义的短链接
      downloadLink: body.downloadLink,
      isDefault: body.isDefault !== undefined ? body.isDefault : false,
      tags: body.tags || [],
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return NextResponse.json({ 
      channel: newChannel[0],
      message: '渠道创建成功'
    });
  } catch (error: any) {
    console.error('Failed to create channel:', error);
    return NextResponse.json({ error: 'Failed to create channel', details: error.message }, { status: 500 });
  }
}

// 更新渠道
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: '渠道ID不能为空' }, { status: 400 });
    }
    
    const updatedChannel = await db.update(channels)
      .set({
        channelName: body.channelName,
        questionnaireId: body.questionnaireId,
        remark: body.remark,
        shortLink: body.shortLink, // 用户自定义的短链接
        downloadLink: body.downloadLink,
        isDefault: body.isDefault,
        tags: body.tags || [],
        isActive: body.isActive,
        updatedAt: new Date()
      })
      .where(eq(channels.id, body.id))
      .returning();
    
    return NextResponse.json({ 
      channel: updatedChannel[0],
      message: '渠道更新成功'
    });
  } catch (error: any) {
    console.error('Failed to update channel:', error);
    return NextResponse.json({ error: 'Failed to update channel', details: error.message }, { status: 500 });
  }
}

// 删除渠道
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: '渠道ID不能为空' }, { status: 400 });
    }
    
    await db.delete(channels).where(eq(channels.id, id));
    
    return NextResponse.json({ message: '渠道删除成功' });
  } catch (error) {
    console.error('Failed to delete channel:', error);
    return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 });
  }
}