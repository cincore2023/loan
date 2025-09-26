import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticatedInMiddleware } from '@/libs/auth/auth-middleware';

export async function middleware(request: NextRequest) {
  // 检查是否访问管理员路由
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 允许访问登录页面
    if (request.nextUrl.pathname === '/admin' || request.nextUrl.pathname === '/admin/') {
      // 检查是否已经认证，如果已认证则重定向到客户页面
      const auth = await isAuthenticatedInMiddleware(request);
      if (auth) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/customers';
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }
    
    // 检查其他管理员页面的认证状态
    const auth = await isAuthenticatedInMiddleware(request);
    if (!auth) {
      // 未认证用户重定向到登录页面
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// 配置中间件匹配的路径
export const config = {
  matcher: ['/admin/:path*'],
};