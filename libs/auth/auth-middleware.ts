// 中间件专用的身份验证工具
// 用于在 Next.js 中间件中处理身份验证

import { jwtVerify } from 'jose';

// JWT 密钥 - 确保与服务器端使用相同的密钥
function getJwtSecret() {
  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-secret-key-for-development-only';
  return new TextEncoder().encode(secret);
}

const JWT_SECRET = getJwtSecret();

/**
 * 验证 JWT token (中间件版本)
 */
export async function verifyTokenInMiddleware(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * 从请求中获取认证 token (中间件版本)
 */
export function getAuthTokenFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const authCookie = cookies.find(cookie => cookie.startsWith('admin-auth-token='));
  if (!authCookie) return null;
  
  return authCookie.split('=')[1];
}

/**
 * 验证请求是否已认证 (中间件版本)
 */
export async function isAuthenticatedInMiddleware(request: Request) {
  const token = getAuthTokenFromRequest(request);
  
  if (!token) {
    return false;
  }

  const payload = await verifyTokenInMiddleware(token);
  return payload !== null;
}