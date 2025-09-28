import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticatedInMiddleware } from '@/libs/auth/auth-middleware';

export async function middleware(request: NextRequest) {
  console.log('=== Middleware执行开始 ===');
  console.log('请求URL:', request.nextUrl.pathname);
  
  // 只检查管理员路由
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('匹配到admin路由');
    
    // 允许访问登录页面
    if (request.nextUrl.pathname === '/admin' || request.nextUrl.pathname === '/admin/') {
      console.log('访问登录页面');
      // 检查是否已经认证，如果已认证则重定向到客户页面
      const auth = await isAuthenticatedInMiddleware(request);
      console.log('登录页面认证状态:', auth);
      if (auth) {
        console.log('用户已认证，重定向到客户页面');
        return NextResponse.redirect(new URL('/admin/customers', request.url));
      }
      console.log('用户未认证，允许访问登录页面');
      return NextResponse.next();
    }
    
    // 特别允许访问认证检查API
    if (request.nextUrl.pathname === '/api/admin/auth/check') {
      console.log('访问认证检查API');
      return NextResponse.next();
    }
    
    // 检查其他管理员页面的认证状态
    console.log('检查管理员页面认证状态');
    const auth = await isAuthenticatedInMiddleware(request);
    console.log('管理员页面认证状态:', auth);
    if (!auth) {
      // 未认证用户重定向到登录页面
      console.log('用户未认证，重定向到登录页面');
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    console.log('用户已认证，允许访问');
  } else {
    console.log('非admin路由，直接通过');
  }
  
  console.log('=== Middleware执行结束 ===');
  // 允许所有其他路由
  return NextResponse.next();
}