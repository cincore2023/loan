import { users } from '@/libs/database/schema';
import { db } from '@/libs/database/db';

export default async function H5Home() {
  // 获取用户数据
  const usersData = await db.select().from(users).limit(10);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">H5 应用首页</h1>
          <p className="mb-6">欢迎来到 H5 应用</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-center">用户列表</h2>
          {usersData.length > 0 ? (
            <ul className="space-y-2">
              {usersData.map((user) => (
                <li key={user.id} className="border-b pb-2">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">暂无用户数据</p>
          )}
        </div>
      </div>
    </div>
  );
}