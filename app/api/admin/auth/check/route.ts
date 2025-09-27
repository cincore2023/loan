import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/libs/auth/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('开始检查请求认证状态...');
    // 验证请求是否已认证
    const auth = await isAuthenticated(request);
    console.log('请求认证检查结果:', auth);
    
    if (auth) {
      console.log('用户已认证，返回成功响应');
      return NextResponse.json({ authenticated: true }, { status: 200 });
    } else {
      console.warn('用户未认证，返回401响应');
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