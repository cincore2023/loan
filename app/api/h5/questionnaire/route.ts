import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/libs/database/db';
import { channels, questionnaires } from '@/libs/database/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    
    console.log('Received channelId:', channelId);
    
    if (!channelId) {
      return NextResponse.json({ error: '缺少渠道ID参数' }, { status: 400 });
    }
    
    // 首先尝试按ID查找渠道
    let channelList = await db
      .select({
        id: channels.id,
        channelNumber: channels.channelNumber,
        channelName: channels.channelName,
        questionnaireId: channels.questionnaireId,
        shortLink: channels.shortLink,
        isActive: channels.isActive,
        uvCount: channels.uvCount,
        questionnaireName: questionnaires.questionnaireName
      })
      .from(channels)
      .leftJoin(questionnaires, eq(channels.questionnaireId, questionnaires.id))
      .where(eq(channels.id, channelId))
      .limit(1)
      .catch((error) => {
        // 如果按ID查找失败（可能是UUID格式错误），则返回空数组
        console.log('Failed to find channel by ID, trying by channel number');
        return [];
      });
    
    // 如果按ID没找到，尝试按渠道编号查找
    if (channelList.length === 0) {
      channelList = await db
        .select({
          id: channels.id,
          channelNumber: channels.channelNumber,
          channelName: channels.channelName,
          questionnaireId: channels.questionnaireId,
          shortLink: channels.shortLink,
          isActive: channels.isActive,
          uvCount: channels.uvCount,
          questionnaireName: questionnaires.questionnaireName
        })
        .from(channels)
        .leftJoin(questionnaires, eq(channels.questionnaireId, questionnaires.id))
        .where(eq(channels.channelNumber, channelId))
        .limit(1);
    }
    
    console.log('Channel list result:', channelList);
    
    if (channelList.length === 0) {
      return NextResponse.json({ error: '渠道不存在' }, { status: 404 });
    }
    
    const channel = channelList[0];
    
    if (!channel.isActive) {
      return NextResponse.json({ error: '渠道已停用' }, { status: 400 });
    }
    
    if (!channel.questionnaireId) {
      return NextResponse.json({ error: '渠道未绑定问卷' }, { status: 400 });
    }
    
    // 增加渠道的UV访问次数
    const updatedChannel = await db
      .update(channels)
      .set({
        uvCount: (channel.uvCount || 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(channels.id, channel.id))
      .returning();
    
    console.log('Updated channel:', updatedChannel);
    
    // 获取问卷详情
    const questionnaireList = await db
      .select()
      .from(questionnaires)
      .where(eq(questionnaires.id, channel.questionnaireId))
      .limit(1);
    
    console.log('Questionnaire list result:', questionnaireList);
    
    if (questionnaireList.length === 0) {
      return NextResponse.json({ error: '问卷不存在' }, { status: 404 });
    }
    
    const questionnaire = questionnaireList[0];
    
    return NextResponse.json({
      channel: {
        id: updatedChannel[0].id,
        channelNumber: updatedChannel[0].channelNumber,
        channelName: updatedChannel[0].channelName,
        shortLink: updatedChannel[0].shortLink,
        uvCount: updatedChannel[0].uvCount
      },
      questionnaire: {
        id: questionnaire.id,
        questionnaireNumber: questionnaire.questionnaireNumber,
        questionnaireName: questionnaire.questionnaireName,
        remark: questionnaire.remark,
        questions: questionnaire.questions,
        createdAt: questionnaire.createdAt,
        updatedAt: questionnaire.updatedAt
      }
    });
  } catch (error) {
    console.error('Failed to fetch channel and questionnaire:', error);
    return NextResponse.json({ error: '获取渠道和问卷信息失败' }, { status: 500 });
  }
}