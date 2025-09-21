import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/libs/database/db';
import { questionnaires } from '@/libs/database/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: '缺少问卷ID' }, { status: 400 });
    }
    
    // 获取指定ID的问卷
    const questionnaireList = await db.select().from(questionnaires).where(eq(questionnaires.id, id)).limit(1);
    
    if (questionnaireList.length === 0) {
      return NextResponse.json({ error: '问卷不存在' }, { status: 404 });
    }
    
    return NextResponse.json(questionnaireList[0]);
  } catch (error) {
    console.error('Failed to fetch questionnaire:', error);
    return NextResponse.json({ error: 'Failed to fetch questionnaire' }, { status: 500 });
  }
}