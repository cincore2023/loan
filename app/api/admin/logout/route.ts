import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/libs/auth/auth';

export async function POST(request: NextRequest) {
  try {
    // 清除认证 cookie
    await clearAuthCookie();
    
    // 创建响应
    const response = NextResponse.json({
      message: '登出成功'
    }, { status: 200 });
    
    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}