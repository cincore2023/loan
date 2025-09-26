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
    console.log('Verifying token:', token ? 'Token present' : 'No token');
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log('Token verified successfully');
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * 从请求中获取认证 token (中间件版本)
 */
export function getAuthTokenFromRequest(request: Request) {
  console.log('Getting auth token from request');
  
  // 首先尝试从 Authorization 头中获取 token
  const authHeader = request.headers.get('authorization');
  console.log('Authorization header:', authHeader);
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
    console.log('Token from Authorization header:', token);
    return token;
  }
  
  // 如果 Authorization 头中没有 token，则尝试从 cookie 中获取
  const cookieHeader = request.headers.get('cookie');
  console.log('Cookie header:', cookieHeader);
  
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
    console.log('Cookies array:', cookies);
    
    const authCookie = cookies.find(cookie => cookie.startsWith('admin-auth-token='));
    console.log('Auth cookie:', authCookie);
    
    if (authCookie) {
      const token = authCookie.split('=')[1];
      console.log('Token from cookie:', token);
      return token;
    }
  }
  
  console.log('No token found');
  return null;
}

/**
 * 验证请求是否已认证 (中间件版本)
 */
export async function isAuthenticatedInMiddleware(request: Request) {
  console.log('Checking if request is authenticated');
  const token = getAuthTokenFromRequest(request);
  
  if (!token) {
    console.log('No token found, returning false');
    return false;
  }

  const payload = await verifyTokenInMiddleware(token);
  const isAuthenticated = payload !== null;
  console.log('Authentication result:', isAuthenticated);
  return isAuthenticated;
}