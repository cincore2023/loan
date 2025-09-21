import { NextResponse } from 'next/server';
import { db } from '@/libs/database/db';
import { questionnaires } from '@/libs/database/schema';
import { count, desc } from 'drizzle-orm';

export async function GET() {
  try {
    // 获取问卷列表，按创建时间倒序排列
    const questionnaireList = await db.select().from(questionnaires).orderBy(desc(questionnaires.createdAt)).limit(100);
    
    // 获取问卷总数
    const questionnaireCountResult = await db.select({ count: count() }).from(questionnaires);
    const questionnaireCount = questionnaireCountResult[0].count;

    // 计算每个问卷的题目数量
    const questionnairesWithCount = questionnaireList.map(q => ({
      ...q,
      questionCount: q.questions ? q.questions.length : 0
    }));

    return NextResponse.json({
      questionnaires: questionnairesWithCount,
      total: questionnaireCount
    });
  } catch (error) {
    console.error('Failed to fetch questionnaires:', error);
    return NextResponse.json({ error: 'Failed to fetch questionnaires' }, { status: 500 });
  }
}