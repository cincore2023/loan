import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticatedInMiddleware } from '@/libs/auth/auth-middleware';

export async function middleware(request: NextRequest) {
  // H5 API不需要认证
  if (request.nextUrl.pathname.startsWith('/api/h5')) {
    return NextResponse.next();
  }
  
  // 管理员API需要认证检查
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    // 特殊API不需要认证
    const publicApiPaths = [
      '/api/admin/login',
      '/api/admin/logout',
      '/api/admin/customers'
    ];
    
    if (publicApiPaths.includes(request.nextUrl.pathname)) {
      return NextResponse.next();
    }
    
    // 检查认证状态
    const auth = await isAuthenticatedInMiddleware(request);
    if (!auth) {
      return new NextResponse(
        JSON.stringify({ error: '未授权访问' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  
  return NextResponse.next();
}

// 使用默认的路径匹配规则
export const config = {
  matcher: ['/((?!.*\\.).*)'],
};