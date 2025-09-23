'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const SuperLoanPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // 轮播图数据 - 使用本地图片
    const swipeItems = [
        '/images/super-loan/loan-swipe-info1.png',
        '/images/super-loan/loan-swipe-info2.png',
        '/images/super-loan/loan-swipe-info3.png',
        '/images/super-loan/loan-swipe-info4.png'
    ];

    // 产品列表数据 - 使用本地图片
    const products = [
        {
            id: 1,
            logo: '/images/super-loan/product-logo1.png',
            name: '产品名称1',
            label: '标签1',
            loanAmount: '80000',
            loanTime: '12个月',
            interestRate: '0.1%'
        },
        {
            id: 2,
            logo: '/images/super-loan/product-logo2.png',
            name: '产品名称2',
            label: '标签2',
            loanAmount: '50000',
            loanTime: '6个月',
            interestRate: '0.2%'
        }
    ];

    // 轮播图自动播放
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % swipeItems.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [swipeItems.length]);

    return (
        <div className="overflow-hidden min-h-screen p-4 pb-10 bg-[#f7f7f7] bg-no-repeat bg-cover flex flex-col justify-between">
            <div>
                <header
                    className="relative h-[307px] pt-[92px] px-8 bg-no-repeat bg-cover rounded-lg"
                    style={{
                        backgroundImage: 'url(/images/background.png)',
                        backgroundSize: '100%',
                    }}
                >
                    <div className="mb-[98px] text-4xl text-white font-bold text-center leading-none">
                        80000
                    </div>
                    <div className="flex items-center justify-center h-12 bg-white rounded-full font-medium text-base text-[#333] shadow-md">
                        领取额度
                    </div>

                    <div className="overflow-hidden absolute left-[85px] top-[185px]">
                        <div className="my-swipe van-swipe" style={{ height: '26px' }}>
                            <div
                                className="van-swipe__track van-swipe__track--vertical flex flex-col"
                                style={{
                                    transitionDuration: '500ms',
                                    transform: `translateY(-${currentSlide * 24}px)`,
                                    height: `${swipeItems.length * 24}px`
                                }}
                            >
                                {swipeItems.map((src, index) => (
                                    <div key={index} className="van-swipe-item" style={{ height: '24px' }}>
                                        123
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Image
                        src="/images/ai.gif"
                        alt="AI"
                        width={32}
                        height={32}
                        className="absolute left-8 top-[182px] w-8 h-8"
                    />
                </header>

                <div className="flex items-center justify-center my-4 bg-[#282a2c] p-5 rounded-xl">
                    <img src="/images/product-container-title-dark.png" className='w-[80%]' />
                </div>

            </div>
            <a href="">
                <img src="/images/download-button-image-new.png" className='w-full' />
            </a>

        </div>
    );
};

export default SuperLoanPage;