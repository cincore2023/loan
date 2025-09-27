// 客户端专用的身份验证工具
// 用于在浏览器中处理身份验证

const TOKEN_KEY = 'admin-auth-token';

/**
 * 从 localStorage 获取 token (向后兼容)
 * 主要通过服务端 cookie 进行认证
 */
export function getToken() {
  // 这个函数现在只用于向后兼容
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * 从 localStorage 删除 token (向后兼容)
 */
export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * 检查用户是否已认证
 */
export async function isAuthenticated() {
  try {
    // 直接调用服务端认证检查 API
    const response = await fetch('/api/admin/auth/check', {
      method: 'GET',
      credentials: 'include' // 确保发送 cookie
    });
    
    return response.ok;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}

/**
 * 获取认证头 (向后兼容)
 */
export function getAuthHeader(): { [key: string]: string } {
  // 使用 cookie 认证时，不需要手动添加 Authorization 头
  // 但为了向后兼容，仍然提供此函数
  const token = getToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`
    };
  }
  return {};
}

/**
 * 带认证的 fetch 包装函数
 */
export async function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  // 合并 headers
  const headers = new Headers(init?.headers);
  
  // 确保 Content-Type 设置正确
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  const config: RequestInit = {
    ...init,
    headers,
    credentials: 'include' // 确保发送 cookie
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
    credentials: 'include', // 确保发送和接收 cookie
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  if (response.ok) {
    // 服务端会设置 HttpOnly cookie
    // 客户端不需要存储 token
    return { success: true, data };
  } else {
    return { success: false, error: data.error };
  }
}

/**
 * 登出函数
 */
export async function logout() {
  try {
    // 调用后端登出 API
    // 服务端会清除 cookie
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include' // 确保发送 cookie
    });
  } catch (error) {
    console.error('Logout API call failed:', error);
  }
}