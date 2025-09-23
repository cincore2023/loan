'use client';

import React from 'react';

const DownloadPage = () => {
    return (
        <div className="min-h-screen bg-[#f8f8f8] flex flex-col items-center justify-around p-3">
            <div className='w-full'>
                {/* 额度展示 */}
                <div className="bg-white rounded-2xl p-4 w-full max-w-md mb-4 shadow-sm border border-gray-100">
                    <div className="text-center mb-2">
                        <div className="inline-block bg-blue-50 rounded-full px-2 py-0.5">
                            <span className="text-blue-600 text-xs font-medium">专属额度</span>
                        </div>
                    </div>
                    <p className="text-green-600 text-xs font-medium text-center mb-2">恭喜你，已通过初审，下载app立即提现</p>
                    <div className="text-3xl font-bold text-center text-blue-600 my-1">80,000</div>
                    <div className="text-sm text-center text-gray-500 mb-1">元</div>
                </div>

                {/* 服务说明 */}
                <div className="bg-white rounded-2xl p-3 shadow-sm w-full max-w-md mb-4 border border-gray-100">
                    <h2 className="text-base font-bold text-gray-800 mb-2 text-center">服务说明</h2>
                    <div className="space-y-2">
                        <div className="flex items-start bg-blue-50 rounded-lg p-2">
                            <div className="bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                                <span className="text-white text-[10px] font-bold">1</span>
                            </div>
                            <p className="text-gray-700 text-xs">额度实时审批，最快1小时内完成审核</p>
                        </div>
                        <div className="flex items-start bg-blue-50 rounded-lg p-2">
                            <div className="bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                                <span className="text-white text-[10px] font-bold">2</span>
                            </div>
                            <p className="text-gray-700 text-xs">资金安全托管，银行级别安全保障</p>
                        </div>
                        <div className="flex items-start bg-blue-50 rounded-lg p-2">
                            <div className="bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                                <span className="text-white text-[10px] font-bold">3</span>
                            </div>
                            <p className="text-gray-700 text-xs">灵活还款方式，支持提前还款无手续费</p>
                        </div>
                        <div className="flex items-start bg-blue-50 rounded-lg p-2">
                            <div className="bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                                <span className="text-white text-[10px] font-bold">4</span>
                            </div>
                            <p className="text-gray-700 text-xs">7×24小时客服支持，随时为您解答疑问</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-md">
                {/* 下载按钮 */}
                <button
                    className="bg-blue-600 text-white font-bold py-3 px-6 rounded-full text-base w-full max-w-md shadow-md hover:opacity-90 transition-opacity mb-4"
                    onClick={() => {
                        // 模拟下载操作
                        alert('开始下载...');
                    }}
                >
                    立即下载 APP
                </button>

                {/* 服务优势 */}
                <div className="text-center text-gray-600 w-full max-w-md">
                    <div className="flex justify-center space-x-3 mb-2">
                        <div className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                            <span className="text-[10px]">安全可靠</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                            <span className="text-[10px]">极速放款</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                            <span className="text-[10px]">全天候服务</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DownloadPage;