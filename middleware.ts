import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticatedInMiddleware } from '@/libs/auth/auth-middleware';

export async function middleware(request: NextRequest) {
  console.log('Middleware triggered for:', request.nextUrl.pathname);
  
  // 检查是否访问管理员路由
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('Admin route accessed:', request.nextUrl.pathname);
    
    // 允许访问登录页面
    if (request.nextUrl.pathname === '/admin' || request.nextUrl.pathname === '/admin/') {
      console.log('Accessing admin login page');
      // 检查是否已经认证，如果已认证则重定向到客户页面
      const auth = await isAuthenticatedInMiddleware(request);
      console.log('Auth status for login page:', auth);
      
      if (auth) {
        console.log('User is authenticated, redirecting to customers page');
        const url = request.nextUrl.clone();
        url.pathname = '/admin/customers';
        return NextResponse.redirect(url);
      }
      
      console.log('User is not authenticated, allowing access to login page');
      return NextResponse.next();
    }
    
    // 检查其他管理员页面的认证状态
    console.log('Checking authentication for admin page');
    const auth = await isAuthenticatedInMiddleware(request);
    console.log('Auth status for admin page:', auth);
    
    if (!auth) {
      console.log('User is not authenticated, redirecting to login page');
      // 未认证用户重定向到登录页面
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
    
    console.log('User is authenticated, allowing access to admin page');
  }
  
  return NextResponse.next();
}

// 配置中间件匹配的路径
export const config = {
  matcher: ['/admin/:path*'],
};