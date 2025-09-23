import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/libs/database/db';
import { channels, questionnaires } from '@/libs/database/schema';
import { eq, or } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    
    if (!channelId) {
      return NextResponse.json({ error: '缺少渠道ID参数' }, { status: 400 });
    }
    
    // 查找渠道信息（支持按ID或渠道编号查找）
    let channel;
    if (channelId.startsWith('CH')) {
      // 按渠道编号查找
      channel = await db.select().from(channels).where(eq(channels.channelNumber, channelId)).limit(1);
    } else {
      // 按渠道ID查找
      channel = await db.select().from(channels).where(eq(channels.id, channelId)).limit(1);
    }
    
    if (channel.length === 0) {
      return NextResponse.json({ error: '渠道不存在' }, { status: 404 });
    }
    
    const channelData = channel[0];
    
    // 获取绑定的问卷信息
    let questionnaireData = null;
    if (channelData.questionnaireId) {
      const questionnaire = await db.select().from(questionnaires).where(eq(questionnaires.id, channelData.questionnaireId)).limit(1);
      if (questionnaire.length > 0) {
        questionnaireData = questionnaire[0];
      }
    }
    
    // 如果渠道没有绑定问卷，尝试查找默认问卷
    if (!questionnaireData) {
      const defaultQuestionnaire = await db.select().from(questionnaires).limit(1);
      if (defaultQuestionnaire.length > 0) {
        questionnaireData = defaultQuestionnaire[0];
      }
    }
    
    if (!questionnaireData) {
      return NextResponse.json({ error: '未找到问卷信息' }, { status: 404 });
    }
    
    // 更新渠道的UV访问次数
    await db.update(channels).set({
      uvCount: (channelData.uvCount || 0) + 1,
      updatedAt: new Date()
    }).where(eq(channels.id, channelData.id));
    
    return NextResponse.json({
      channel: {
        id: channelData.id,
        channelNumber: channelData.channelNumber,
        channelName: channelData.channelName,
        shortLink: channelData.shortLink,
      },
      questionnaire: {
        id: questionnaireData.id,
        questionnaireNumber: questionnaireData.questionnaireNumber,
        questionnaireName: questionnaireData.questionnaireName,
        questions: questionnaireData.questions || [],
      }
    });
  } catch (error) {
    console.error('获取问卷信息失败:', error);
    return NextResponse.json({ error: '获取问卷信息失败' }, { status: 500 });
  }
}