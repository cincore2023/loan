import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticated } from '@/libs/auth/auth';

export async function middleware(request: NextRequest) {
  // 检查是否访问管理员路由
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 允许访问登录页面
    if (request.nextUrl.pathname === '/admin') {
      return NextResponse.next();
    }
    
    // 检查其他管理员页面的认证状态
    if (!(await isAuthenticated(request))) {
      // 未认证用户重定向到登录页面
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  
  return NextResponse.next();
}

// 配置中间件匹配的路径
export const config = {
  matcher: ['/admin/:path*'],
};