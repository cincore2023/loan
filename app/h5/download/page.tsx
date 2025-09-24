'use client';

import React, { useEffect, useState } from 'react';
import { h5Store } from '../../../lib/store';

const DownloadPage = () => {
  const [applicationAmount, setApplicationAmount] = useState('80000');

  // 从store获取申请金额
  useEffect(() => {
    const storedAmount = h5Store.getData('applicationAmount');
    if (storedAmount) {
      setApplicationAmount(storedAmount);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col items-center justify-center p-4">
      {/* 额度展示 */}
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mb-6 shadow-sm border border-gray-100">
        <div className="text-center mb-4">
          <div className="inline-block bg-blue-50 rounded-full px-3 py-1">
            <span className="text-blue-600 text-sm font-medium">专属额度</span>
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2 text-center">您的贷款额度</h1>
        <p className="text-green-600 text-sm font-medium text-center mb-4">恭喜你，已通过初审，下载app立即提现</p>
        <div className="text-4xl font-bold text-center text-blue-600 my-2">¥{applicationAmount}</div>
        <div className="text-center text-green-500 text-sm font-medium mt-4">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          额度已激活
        </div>
      </div>

      {/* 服务说明 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm w-full max-w-md mb-6 border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">服务说明</h2>
        <div className="space-y-3">
          <div className="flex items-start bg-blue-50 rounded-lg p-3">
            <div className="bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <p className="text-gray-700 text-sm">额度实时审批，最快1小时内完成审核</p>
          </div>
          <div className="flex items-start bg-blue-50 rounded-lg p-3">
            <div className="bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <p className="text-gray-700 text-sm">资金安全托管，银行级别安全保障</p>
          </div>
          <div className="flex items-start bg-blue-50 rounded-lg p-3">
            <div className="bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
              <span className="text-white text-xs font-bold">3</span>
            </div>
            <p className="text-gray-700 text-sm">灵活还款方式，支持提前还款无手续费</p>
          </div>
          <div className="flex items-start bg-blue-50 rounded-lg p-3">
            <div className="bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
              <span className="text-white text-xs font-bold">4</span>
            </div>
            <p className="text-gray-700 text-sm">7×24小时客服支持，随时为您解答疑问</p>
          </div>
        </div>
      </div>

      {/* 下载按钮 */}
      <button 
        className="bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-lg w-full max-w-md shadow-md hover:opacity-90 transition-opacity mb-6"
        onClick={() => {
          // 模拟下载操作
          alert('开始下载...');
        }}
      >
        立即下载 APP
      </button>

      {/* 服务优势 */}
      <div className="text-center text-gray-600 w-full max-w-md">
        <div className="flex justify-center space-x-4 mb-3">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs">安全可靠</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs">极速放款</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs">全天候服务</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">© 2025 金融服务平台 版权所有</p>
      </div>
    </div>
  );
};

export default DownloadPage;