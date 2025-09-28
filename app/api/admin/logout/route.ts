import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // 创建响应
  const response = NextResponse.json({
    message: '登出成功'
  }, { status: 200 });
  
  // 清除认证cookie
  response.cookies.delete('admin-auth-token');
  
  return response;
}