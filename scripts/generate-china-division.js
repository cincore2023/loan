const fs = require('fs');

// 读取省份数据
const provincesData = JSON.parse(fs.readFileSync('/tmp/provinces.json', 'utf8'));

// 读取城市数据
const citiesData = JSON.parse(fs.readFileSync('/tmp/cities.json', 'utf8'));

// 读取区县数据
const areasData = JSON.parse(fs.readFileSync('/tmp/areas.json', 'utf8'));

// 生成省份数据
const provinces = provincesData.map(province => ({
  code: province.code,
  name: province.name
}));

// 生成城市数据
const cities = {};
citiesData.forEach(city => {
  if (!cities[city.provinceCode]) {
    cities[city.provinceCode] = [];
  }
  cities[city.provinceCode].push({
    code: city.code,
    name: city.name
  });
});

// 生成区县数据
const districts = {};
areasData.forEach(area => {
  if (!districts[area.cityCode]) {
    districts[area.cityCode] = [];
  }
  districts[area.cityCode].push({
    code: area.code,
    name: area.name
  });
});

// 生成完整的china-division.ts文件内容
const content = `// 中国省市区数据
export const provinces = ${JSON.stringify(provinces, null, 2)};

// 城市数据
export const cities: Record<string, { code: string; name: string }[]> = ${JSON.stringify(cities, null, 2)};

// 区县数据
export const districts: Record<string, { code: string; name: string }[]> = ${JSON.stringify(districts, null, 2)};
`;

// 写入文件
fs.writeFileSync('/Users/sado/code/cincore/loan/lib/china-division.ts', content);

console.log('china-division.ts 文件已生成完成');