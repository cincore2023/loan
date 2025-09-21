import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/libs/database/db';
import { users } from '@/libs/database/schema';
import { z, ZodError } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// 验证用户数据的 Zod 模式
const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

export async function GET() {
  try {
    // 获取所有用户
    const allUsers = await db.select().from(users);
    return NextResponse.json(allUsers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = userSchema.parse(body);
    
    // 创建新用户
    const newUser = await db.insert(users).values({
      id: uuidv4(),
      name: validatedData.name,
      email: validatedData.email,
    }).returning();
    
    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}