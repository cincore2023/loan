import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/libs/database/db';
import { admins } from '@/libs/database/schema';
import { eq } from 'drizzle-orm';

// 定义登录数据的验证模式
const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(6, '密码至少需要6个字符'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = loginSchema.parse(body);
    
    // 查询管理员用户（通过用户名）
    const adminUser = await db.select().from(admins).where(eq(admins.name, validatedData.username)).limit(1);
    
    if (adminUser.length === 0) {
      return NextResponse.json({ error: '管理员用户不存在' }, { status: 401 });
    }
    
    // 验证密码
    if (adminUser[0].password !== validatedData.password) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 });
    }
    
    // 检查账户是否激活
    if (!adminUser[0].isActive) {
      return NextResponse.json({ error: '账户已被禁用' }, { status: 401 });
    }
    
    // 更新最后登录时间
    await db.update(admins).set({ lastLoginAt: new Date() }).where(eq(admins.id, adminUser[0].id));
    
    // 登录成功，返回用户信息（实际应用中应该返回 token）
    return NextResponse.json({
      message: '登录成功',
      user: {
        id: adminUser[0].id,
        name: adminUser[0].name,
      }
    }, { status: 200 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: '验证失败', details: error.issues }, { status: 400 });
    }
    
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}