import { NextResponse } from 'next/server';
import { db } from '@/libs/database/db';
import { channels, questionnaires } from '@/libs/database/schema';
import { count, desc, eq } from 'drizzle-orm';

export async function GET() {
  try {
    // 获取渠道列表，包含关联的问卷信息，按创建时间倒序排列
    const channelList = await db
      .select({
        id: channels.id,
        channelNumber: channels.channelNumber,
        channelName: channels.channelName,
        questionnaireId: channels.questionnaireId,
        uvCount: channels.uvCount,
        questionnaireSubmitCount: channels.questionnaireSubmitCount,
        remark: channels.remark,
        shortLink: channels.shortLink,
        createdAt: channels.createdAt,
        updatedAt: channels.updatedAt,
        isActive: channels.isActive,
        questionnaireName: questionnaires.questionnaireName
      })
      .from(channels)
      .leftJoin(questionnaires, eq(channels.questionnaireId, questionnaires.id))
      .orderBy(desc(channels.createdAt))
      .limit(100);
    
    // 获取渠道总数
    const channelCountResult = await db.select({ count: count() }).from(channels);
    const channelCount = channelCountResult[0].count;

    return NextResponse.json({
      channels: channelList,
      total: channelCount
    });
  } catch (error) {
    console.error('Failed to fetch channels:', error);
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}