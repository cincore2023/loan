import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticatedInMiddleware } from '@/libs/auth/auth-middleware';

export async function middleware(request: NextRequest) {
  console.log('=== Middleware执行开始 ===');
  console.log('请求URL:', request.nextUrl.pathname);
  console.log('请求方法:', request.method);
  
  // 打印所有请求头
  console.log('请求头:');
  request.headers.forEach((value, key) => {
    console.log(`  ${key}: ${value}`);
  });
  
  // 只检查API路由的认证状态
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    console.log('匹配到API路由');
    
    // 特别允许访问登录API
    if (request.nextUrl.pathname === '/api/admin/login') {
      console.log('访问登录API');
      return NextResponse.next();
    }
    
    // 特别允许访问认证检查API
    if (request.nextUrl.pathname === '/api/admin/auth/check') {
      console.log('访问认证检查API');
      return NextResponse.next();
    }
    
    // 特别允许访问登出API
    if (request.nextUrl.pathname === '/api/admin/logout') {
      console.log('访问登出API');
      return NextResponse.next();
    }
    
    // 特别允许访问调试API
    if (request.nextUrl.pathname === '/api/admin/debug/cookies') {
      console.log('访问调试API');
      return NextResponse.next();
    }
    
    // 检查其他API的认证状态
    console.log('检查API认证状态');
    const auth = await isAuthenticatedInMiddleware(request);
    console.log('API认证状态:', auth);
    if (!auth) {
      // 未认证用户返回401错误
      console.log('用户未认证，返回401错误');
      return new NextResponse(
        JSON.stringify({ error: '未授权访问' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.log('用户已认证，允许访问');
  } else {
    console.log('非API路由，直接通过');
  }
  
  console.log('=== Middleware执行结束 ===');
  // 允许所有其他路由
  return NextResponse.next();
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    '/api/admin/:path*',
    '/admin/:path*',
  ],
};