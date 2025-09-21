import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 模拟认证检查
function isAuthenticated(request: NextRequest) {
  // 在实际应用中，这里应该检查 session 或 JWT token
  // 为了演示，我们简单检查是否存在 auth cookie
  const authCookie = request.cookies.get('admin-auth');
  return !!authCookie;
}

export function middleware(request: NextRequest) {
  // 检查是否访问管理员路由
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 允许访问登录页面
    if (request.nextUrl.pathname === '/admin') {
      return NextResponse.next();
    }
    
    // 检查其他管理员页面的认证状态
    if (!isAuthenticated(request)) {
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