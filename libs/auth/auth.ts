import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// JWT 密钥 - 确保获取方式一致
function getJwtSecret() {
  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-secret-key-for-development-only';
  return new TextEncoder().encode(secret);
}

const JWT_SECRET = getJwtSecret();

// Token 过期时间 (1小时)
const TOKEN_EXPIRATION = 60 * 60;

// Cookie 名称
const TOKEN_COOKIE_NAME = 'admin-auth-token';

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
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * 设置认证 token 到 HttpOnly Cookie
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: TOKEN_EXPIRATION,
    path: '/',
    sameSite: 'strict',
  });
}

/**
 * 从请求中获取认证 token (优先从 cookie)
 */
export async function getAuthToken(request: NextRequest) {
  // 首先尝试从 cookie 中获取 token
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
  
  if (token) {
    return token;
  }
  
  // 如果 cookie 中没有 token，则尝试从 Authorization 头中获取（向后兼容）
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7); // 移除 'Bearer ' 前缀
    return bearerToken;
  }
  
  return null;
}

/**
 * 清除认证 cookie
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
}

/**
 * 验证请求是否已认证
 */
export async function isAuthenticated(request: NextRequest) {
  // 获取 token
  const token = await getAuthToken(request);
  if (!token) {
    return false;
  }

  // 验证 token
  const payload = await verifyToken(token);
  return payload !== null;
}

/**
 * 获取当前认证用户信息
 */
export async function getCurrentUser(request: NextRequest) {
  // 获取 token
  const token = await getAuthToken(request);
  if (!token) {
    return null;
  }

  // 验证并返回用户信息
  const payload = await verifyToken(token);
  return payload;
}