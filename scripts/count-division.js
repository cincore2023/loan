const fs = require('fs');

// 读取文件内容
const content = fs.readFileSync('/Users/sado/code/cincore/loan/lib/china-division.ts', 'utf8');

// 统计省份数量
const provincesMatch = content.match(/export const provinces = \[/);
let provincesCount = 0;
if (provincesMatch) {
  // 简单统计，查找包含"name"的行数
  provincesCount = (content.match(/"name":/g) || []).length - (content.match(/"cityCode":/g) || []).length - (content.match(/"provinceCode":/g) || []).length;
  // 更准确的统计方式是查找 provinces 数组中的对象数量
  const provincesSection = content.substring(content.indexOf('export const provinces = ['), content.indexOf('];', content.indexOf('export const provinces = [')));
  provincesCount = (provincesSection.match(/{/g) || []).length - 1; // 减去数组开始的 {
}

// 统计城市数量
let citiesCount = 0;
const citiesMatch = content.match(/export const cities: Record<string, { code: string; name: string }]> = \{([^}]+\})+/g);
if (citiesMatch) {
  // 统计 cities 对象中的条目数量
  const citiesSection = citiesMatch[0];
  citiesCount = (citiesSection.match(/"code":/g) || []).length;
}

// 统计区县数量
let districtsCount = 0;
const districtsMatch = content.match(/export const districts: Record<string, { code: string; name: string }]> = \{([^}]+\})+/g);
if (districtsMatch) {
  // 统计 districts 对象中的条目数量
  const districtsSection = districtsMatch[0];
  districtsCount = (districtsSection.match(/"code":/g) || []).length;
}

console.log(`省份数量: ${provincesCount}`);
console.log(`城市数量: ${citiesCount}`);
console.log(`区县数量: ${districtsCount}`);
console.log(`总数量: ${provincesCount + citiesCount + districtsCount}`);