import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/libs/database/db';
import { questionnaires } from '@/libs/database/schema';
import { count, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

// 定义问卷题选项的验证模式
const questionOptionSchema = z.object({
  id: z.string().min(1, '选项ID不能为空'),
  text: z.string().min(1, '选项内容不能为空'),
});

// 定义问卷题的验证模式
const questionSchema = z.object({
  id: z.string().min(1, '题目ID不能为空'),
  title: z.string().min(1, '题目标题不能为空'),
  options: z.array(questionOptionSchema).min(1, '题目至少需要一个选项'),
});

// 定义问卷数据的验证模式
const questionnaireSchema = z.object({
  questionnaireNumber: z.string().min(1, '问卷编号不能为空'),
  questionnaireName: z.string().min(1, '问卷名称不能为空'),
  remark: z.string().optional(),
  questions: z.array(questionSchema).optional(),
});

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = questionnaireSchema.parse(body);
    
    // 检查问卷编号是否已存在
    const existingQuestionnaire = await db.select().from(questionnaires).where(eq(questionnaires.questionnaireNumber, validatedData.questionnaireNumber)).limit(1);
    
    if (existingQuestionnaire.length > 0) {
      return NextResponse.json({ error: '问卷编号已存在' }, { status: 400 });
    }
    
    // 创建新问卷
    const newQuestionnaire = await db.insert(questionnaires).values({
      questionnaireNumber: validatedData.questionnaireNumber,
      questionnaireName: validatedData.questionnaireName,
      remark: validatedData.remark,
      questions: validatedData.questions || [], // 默认空的题目数组
    }).returning();
    
    return NextResponse.json(newQuestionnaire[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: '验证失败', details: error.issues }, { status: 400 });
    }
    
    console.error('Failed to create questionnaire:', error);
    return NextResponse.json({ error: 'Failed to create questionnaire' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = questionnaireSchema.parse({
      ...body,
      questionnaireNumber: body.questionnaireNumber || undefined,
      questionnaireName: body.questionnaireName || undefined,
    });
    
    // 检查问卷是否存在
    const existingQuestionnaire = await db.select().from(questionnaires).where(eq(questionnaires.id, body.id)).limit(1);
    
    if (existingQuestionnaire.length === 0) {
      return NextResponse.json({ error: '问卷不存在' }, { status: 404 });
    }
    
    // 检查问卷编号是否被其他问卷使用
    if (validatedData.questionnaireNumber && validatedData.questionnaireNumber !== existingQuestionnaire[0].questionnaireNumber) {
      const duplicateQuestionnaire = await db.select().from(questionnaires).where(eq(questionnaires.questionnaireNumber, validatedData.questionnaireNumber)).limit(1);
      
      if (duplicateQuestionnaire.length > 0) {
        return NextResponse.json({ error: '问卷编号已存在' }, { status: 400 });
      }
    }
    
    // 更新问卷
    const updatedQuestionnaire = await db.update(questionnaires).set({
      questionnaireNumber: validatedData.questionnaireNumber || existingQuestionnaire[0].questionnaireNumber,
      questionnaireName: validatedData.questionnaireName || existingQuestionnaire[0].questionnaireName,
      remark: validatedData.remark,
      questions: validatedData.questions || existingQuestionnaire[0].questions || [],
      updatedAt: new Date(),
    }).where(eq(questionnaires.id, body.id)).returning();
    
    return NextResponse.json(updatedQuestionnaire[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: '验证失败', details: error.issues }, { status: 400 });
    }
    
    console.error('Failed to update questionnaire:', error);
    return NextResponse.json({ error: 'Failed to update questionnaire' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: '缺少问卷ID' }, { status: 400 });
    }
    
    // 检查问卷是否存在
    const existingQuestionnaire = await db.select().from(questionnaires).where(eq(questionnaires.id, id)).limit(1);
    
    if (existingQuestionnaire.length === 0) {
      return NextResponse.json({ error: '问卷不存在' }, { status: 404 });
    }
    
    // 删除问卷
    await db.delete(questionnaires).where(eq(questionnaires.id, id));
    
    return NextResponse.json({ message: '问卷删除成功' });
  } catch (error) {
    console.error('Failed to delete questionnaire:', error);
    return NextResponse.json({ error: 'Failed to delete questionnaire' }, { status: 500 });
  }
}