const { jwtVerify } = require('jose');

// JWT 密钥 - 与服务器端使用相同的密钥
function getJwtSecret() {
  const secret = 'your-super-secret-jwt-secret-key-for-development-only';
  return new TextEncoder().encode(secret);
}

const JWT_SECRET = getJwtSecret();

// 验证 JWT token
async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log('Token 有效');
    console.log('Payload:', payload);
    return payload;
  } catch (error) {
    console.log('Token 无效:', error.message);
    return null;
  }
}

// 您的 token
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjRkNzViMzI2LTg2M2QtNDQ1NC1iNjI1LTU4ZDEzYWY5NDQ5MiIsIm5hbWUiOiJhZG1pbiIsImlhdCI6MTc1ODg5OTIxNywiZXhwIjoxNzU4OTAyODE3fQ.cw-YQrFDlHvf7Vf2Hm0X1d3m3VFRcUCkdlOcXm9TIeI';

verifyToken(token);