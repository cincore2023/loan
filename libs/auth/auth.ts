import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// JWT 密钥
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-secret-key-for-development-only'
);

// Token 过期时间 (1小时)
const TOKEN_EXPIRATION = 60 * 60;

/**
 * 生成 JWT token
 */
export async function generateToken(payload: any) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + TOKEN_EXPIRATION;

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(JWT_SECRET);
}

/**
 * 验证 JWT token
 */
export async function verifyToken(token: string) {
  try {
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * 从请求中获取认证 token
 */
export async function getAuthToken(request: NextRequest) {
  // 首先尝试从 cookie 中获取 token
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-auth-token')?.value;
  
  if (token) {
    return token;
  }
  
  // 如果 cookie 中没有 token，则尝试从 Authorization 头中获取
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7);
    return bearerToken;
  }
  
  return null;
}

/**
 * 验证请求是否已认证
 */
export async function isAuthenticated(request: NextRequest) {
  const token = await getAuthToken(request);
  
  if (!token) {
    return false;
  }

  const payload = await verifyToken(token);
  const isAuthenticated = payload !== null;
  return isAuthenticated;
}