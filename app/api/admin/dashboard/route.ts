import { NextResponse } from 'next/server';
import { db } from '@/libs/database/db';
import { customers, questionnaires, channels } from '@/libs/database/schema';
import { count, eq } from 'drizzle-orm';

export async function GET() {
  try {
    // 获取客户总数
    const customerCountResult = await db.select({ count: count() }).from(customers);
    const customerCount = customerCountResult[0].count;

    // 获取问卷总数
    const questionnaireCountResult = await db.select({ count: count() }).from(questionnaires);
    const questionnaireCount = questionnaireCountResult[0].count;

    // 获取渠道总数
    const channelCountResult = await db.select({ count: count() }).from(channels);
    const channelCount = channelCountResult[0].count;

    // 获取启用的渠道数量
    const activeChannelCountResult = await db
      .select({ count: count() })
      .from(channels)
      .where(eq(channels.isActive, true));
    const activeChannelCount = activeChannelCountResult[0].count;

    return NextResponse.json({
      customerCount,
      questionnaireCount,
      channelCount,
      activeChannelCount
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}