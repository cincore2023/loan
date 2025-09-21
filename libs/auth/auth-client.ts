// 客户端认证工具库
// 用于处理浏览器端的认证相关操作

/**
 * 清除认证 cookie
 */
export async function clearAuthCookie() {
  // 在客户端清除 cookie
  document.cookie = "admin-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

/**
 * 检查用户是否已认证（客户端简单检查）
 */
export function isClientAuthenticated() {
  // 在客户端简单检查是否存在认证 cookie
  return document.cookie.includes('admin-auth-token=');
}