// 客户端专用的身份验证工具
// 用于在浏览器中处理身份验证

/**
 * 检查用户是否已认证
 */
export async function isAuthenticated() {
  // 客户端直接调用API检查认证状态
  try {
    const response = await fetch('/api/admin/auth/check');
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
  // 客户端直接调用API，依赖cookie进行认证
  const config: RequestInit = {
    ...init,
    credentials: 'include', // 包含cookie
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
    credentials: 'include', // 包含cookie
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  if (response.ok) {
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
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include', // 包含cookie
    });
  } catch (error) {
    console.error('Logout API call failed:', error);
  }
}
