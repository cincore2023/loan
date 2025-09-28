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
 * 获取 localStorage 中的 token
 */
export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * 移除 localStorage 中的 token
 */
export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * 跳转到登录页
 */
export function redirectToLogin() {
  if (typeof window !== 'undefined') {
    // 清除token
    removeToken();
    // 跳转到登录页
    window.location.href = '/admin';
  }
}

/**
 * 检查用户是否已认证
 */
export async function isAuthenticated() {
  const token = getToken();
  if (!token) {
    return false;
  }
  
  try {
    const response = await fetch('/api/admin/auth/check', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const isAuthenticated = response.ok;
    return isAuthenticated;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}

/**
 * 带认证的 fetch 包装函数
 */
export async function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const token = getToken();
  
  const config: RequestInit = {
    ...init,
    headers: {
      ...init?.headers,
      'Authorization': `Bearer ${token}`
    }
  };
  
  const response = await fetch(input, config);
  
  // 如果响应是401未授权，跳转到登录页
  if (response.status === 401) {
    redirectToLogin();
  }
  
  return response;
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
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  if (response.ok) {
    // 保存token到localStorage
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
export async function logout() {
  try {
    const token = getToken();
    if (token) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    // 总是移除本地token并跳转到登录页
    redirectToLogin();
  }
}