import { NextResponse } from 'next/server';
import { db } from '@/libs/database/db';
import { channels } from '@/libs/database/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // 查找默认渠道（isDefault为true的渠道）
    const defaultChannel = await db.select().from(channels).where(eq(channels.isDefault, true)).limit(1);
    
    // 如果没有设置默认渠道，查找渠道编号为CH001的渠道
    let channelData = null;
    if (defaultChannel.length > 0) {
      channelData = defaultChannel[0];
    } else {
      const fallbackChannel = await db.select().from(channels).where(eq(channels.channelNumber, 'CH001')).limit(1);
      if (fallbackChannel.length > 0) {
        channelData = fallbackChannel[0];
      }
    }
    
    if (!channelData) {
      return NextResponse.json({ error: '未找到默认渠道' }, { status: 404 });
    }
    
    return NextResponse.json({
      channel: {
        id: channelData.id,
        channelNumber: channelData.channelNumber,
        channelName: channelData.channelName,
        shortLink: channelData.shortLink,
        isDefault: channelData.isDefault,
        isActive: channelData.isActive, // 添加渠道活跃状态
      }
    });
  } catch (error) {
    console.error('获取默认渠道失败:', error);
    return NextResponse.json({ error: '获取默认渠道失败' }, { status: 500 });
  }
}