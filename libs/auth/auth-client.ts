// 客户端专用的身份验证工具
// 用于在浏览器中处理身份验证

const TOKEN_KEY = 'admin-auth-token';

/**
 * 保存 token 到 localStorage
 */
export function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * 从 localStorage 获取 token
 */
export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * 从 localStorage 删除 token
 */
export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * 检查用户是否已认证
 */
export function isAuthenticated() {
  const token = getToken();
  return !!token; // 简单检查，实际应用中可能需要验证 token 的有效性
}

/**
 * 获取认证头
 */
export function getAuthHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * 带认证的 fetch 包装函数
 */
export async function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const authHeader = getAuthHeader();
  
  // 合并 headers
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  
  // 只有当 authHeader 有内容时才设置 Authorization 头
  if (authHeader.Authorization) {
    headers.set('Authorization', authHeader.Authorization);
  }
  
  const config: RequestInit = {
    ...init,
    headers,
  };
  
  return fetch(input, config);
}

/**
 * 登录函数
 */
export async function login(username: string, password: string) {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (response.ok) {
    // 保存 token (虽然现在使用 cookie，但仍保存到 localStorage 作为备用)
    if (data.token) {
      saveToken(data.token);
    }
    return { success: true, data };
  } else {
    return { success: false, error: data.error };
  }
}

/**
 * 登出函数
 */
export function logout() {
  // 删除 localStorage 中的 token
  removeToken();
  
  // 注意：由于我们使用的是 HttpOnly cookie，无法通过 JavaScript 删除
  // 需要调用后端 API 来删除 cookie，或者刷新页面后 cookie 会自动过期
}