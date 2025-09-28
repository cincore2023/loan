// 中间件专用的身份验证工具
// 用于在 Next.js 中间件中处理身份验证

import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

// JWT 密钥
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-secret-key-for-development-only'
);

/**
 * 验证 JWT token (中间件版本)
 */
export async function verifyTokenInMiddleware(token: string) {
  try {
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * 从请求中获取认证 token (中间件版本)
 */
export function getAuthTokenFromRequest(request: NextRequest) {
  // 首先尝试从 cookie 中获取 token
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
    const authTokenCookie = cookies.find(cookie => cookie.startsWith('admin-auth-token='));
    if (authTokenCookie) {
      const token = authTokenCookie.split('=')[1];
      console.log('中间件 - 从cookie中获取的token:', token);
      return token;
    }
  }
  
  // 如果 cookie 中没有 token，则尝试从 Authorization 头中获取
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7);
    console.log('中间件 - 从Authorization头中提取的token:', bearerToken);
    return bearerToken;
  }
  
  return null;
}

/**
 * 验证请求是否已认证 (中间件版本)
 */
export async function isAuthenticatedInMiddleware(request: NextRequest) {
  const token = getAuthTokenFromRequest(request);
  
  if (!token) {
    return false;
  }

  const payload = await verifyTokenInMiddleware(token);
  const isAuthenticated = payload !== null;
  return isAuthenticated;
}