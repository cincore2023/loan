'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const SuperLoanPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // 轮播图数据 - 使用文案
    const swipeItems = [
        '恭喜用户7456成功借款20000元！',
        '恭喜用户3210成功借款15000元！',
        '恭喜用户9876成功借款30000元！',
        '恭喜用户5567成功借款25000元！'
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
                    <Link href="/h5/download">
                        <div className="flex items-center justify-center h-12 bg-white rounded-full font-medium text-base text-[#333] shadow-md cursor-pointer">
                            领取额度
                        </div>
                    </Link>

                    <div className="overflow-hidden absolute left-10 right-0 top-[185px] px-4">
                        <div className="my-swipe van-swipe" style={{ height: '26px' }}>
                            <div
                                className="van-swipe__track van-swipe__track--vertical flex flex-col"
                                style={{
                                    transitionDuration: '500ms',
                                    transform: `translateY(-${currentSlide * 24}px)`,
                                    height: `${swipeItems.length * 24}px`
                                }}
                            >
                                {swipeItems.map((text, index) => (
                                    <div key={index} className="van-swipe-item flex items-center justify-center" style={{ height: '24px' }}>
                                        <div className="text-white text-sm font-medium truncate">
                                            {text}
                                        </div>
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

                <div className="flex items-center justify-center my-4 bg-[#fff] p-5 rounded-xl">
                    <img src="/images/product-container-title.png" className='w-[80%]' />
                </div>

            </div>
            <a href="">
                <img src="/images/download-button-image-new.png" className='w-full' />
            </a>

        </div>
    );
};

export default SuperLoanPage;