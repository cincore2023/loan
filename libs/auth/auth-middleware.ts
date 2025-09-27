// 中间件专用的身份验证工具
// 用于在 Next.js 中间件中处理身份验证

import { jwtVerify } from 'jose';

// JWT 密钥 - 确保与服务器端使用相同的密钥
function getJwtSecret() {
  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-secret-key-for-development-only';
  return new TextEncoder().encode(secret);
}

const JWT_SECRET = getJwtSecret();

// Cookie 名称
const TOKEN_COOKIE_NAME = 'admin-auth-token';

/**
 * 验证 JWT token (中间件版本)
 */
export async function verifyTokenInMiddleware(token: string) {
  try {
    if (!token) {
      return null;
    }
    
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
  // 从 cookie 中获取 token
  const cookieHeader = request.headers.get('cookie');
  
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
    const authCookie = cookies.find(cookie => cookie.startsWith(`${TOKEN_COOKIE_NAME}=`));
    
    if (authCookie) {
      const token = authCookie.split('=')[1];
      return token;
    }
  }
  
  // 如果 cookie 中没有 token，则尝试从 Authorization 头中获取（向后兼容）
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
    return token;
  }
  
  return null;
}

/**
 * 验证请求是否已认证 (中间件版本)
 */
export async function isAuthenticatedInMiddleware(request: Request) {
  console.log('=== Middleware Authentication Check ===');
  const token = getAuthTokenFromRequest(request);
  console.log('Token from request:', token ? 'found' : 'not found');
  
  if (!token) {
    console.warn('No token found in request for middleware authentication');
    return false;
  }

  console.log('Verifying token in middleware...');
  const payload = await verifyTokenInMiddleware(token);
  const isValid = payload !== null;
  console.log('Token verification result:', isValid);
  
  return isValid;
}