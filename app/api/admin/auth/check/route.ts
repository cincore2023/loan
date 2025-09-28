import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/libs/auth/auth';

export async function GET(request: NextRequest) {
  try {
    // 验证请求是否已认证
    const auth = await isAuthenticated(request);
    
    if (auth) {
      return NextResponse.json({ authenticated: true }, { status: 200 });
    } else {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth check API error:', {
      error: error,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}