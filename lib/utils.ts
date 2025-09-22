/**
 * 格式化金额显示
 * @param amount 金额数值
 * @param currency 货币符号，默认为¥
 * @param decimals 小数位数，默认为2
 * @returns 格式化后的金额字符串
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = '¥',
  decimals: number = 2
): string {
  // 处理空值情况
  if (amount === null || amount === undefined || amount === '') {
    return `${currency}0.00`;
  }

  // 转换为数字
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  // 检查是否为有效数字
  if (isNaN(num)) {
    return `${currency}0.00`;
  }

  // 格式化数字，添加千位分隔符
  return `${currency}${num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

/**
 * 格式化金额显示（不带货币符号）
 * @param amount 金额数值
 * @param decimals 小数位数，默认为2
 * @returns 格式化后的金额字符串
 */
export function formatAmount(
  amount: number | string | null | undefined,
  decimals: number = 2
): string {
  // 处理空值情况
  if (amount === null || amount === undefined || amount === '') {
    return '0.00';
  }

  // 转换为数字
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  // 检查是否为有效数字
  if (isNaN(num)) {
    return '0.00';
  }

  // 格式化数字，添加千位分隔符
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * 格式化手机号码显示（隐藏中间四位）
 * @param phone 手机号码
 * @returns 格式化后的手机号码
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '未填写';
  
  // 确保是11位手机号
  if (phone.length === 11) {
    return `${phone.substring(0, 3)}****${phone.substring(7)}`;
  }
  
  return phone;
}

/**
 * 格式化身份证号码显示（隐藏中间部分）
 * @param idCard 身份证号码
 * @returns 格式化后的身份证号码
 */
export function formatIdCard(idCard: string | null | undefined): string {
  if (!idCard) return '未填写';
  
  // 18位身份证
  if (idCard.length === 18) {
    return `${idCard.substring(0, 6)}********${idCard.substring(14)}`;
  }
  
  // 15位身份证
  if (idCard.length === 15) {
    return `${idCard.substring(0, 6)}******${idCard.substring(12)}`;
  }
  
  return idCard;
}

/**
 * 格式化日期时间显示
 * @param date 日期时间
 * @param format 格式化字符串
 * @returns 格式化后的日期时间
 */
export function formatDateTime(date: string | Date | null | undefined, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return '未填写';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '无效日期';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}