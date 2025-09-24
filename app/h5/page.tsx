'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { h5Store } from '../../lib/store';

export default function H5Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        // 从 URL 查询参数中获取渠道 ID
        const urlParams = new URLSearchParams(window.location.search);
        const channelId = urlParams.get('channelId');
        
        let finalChannelId = channelId;
        
        // 如果没有渠道ID，从API获取默认渠道
        if (!finalChannelId) {
          const defaultChannelResponse = await fetch('/api/h5/default-channel');
          const defaultChannelData = await defaultChannelResponse.json();
          
          if (defaultChannelResponse.ok && defaultChannelData.channel) {
            finalChannelId = defaultChannelData.channel.id;
          } else {
            // 如果API获取失败，回退到硬编码的默认值
            finalChannelId = 'CH001';
          }
        }
        
        // 调用 API 获取渠道和问卷信息
        const response = await fetch(`/api/h5/questionnaire?channelId=${finalChannelId}`);
        const data = await response.json();
        
        if (response.ok) {
          // 将问卷数据存储到store中
          h5Store.setData('channelInfo', data.channel);
          h5Store.setData('questionnaire', data.questionnaire);
          h5Store.setData('channelId', finalChannelId);
          
          // 成功获取问卷信息，跳转到注册页面
          router.push(`/h5/register`);
        } else {
          setError(data.error || '获取问卷信息失败');
        }
      } catch (err) {
        console.error('Failed to fetch questionnaire:', err);
        setError('网络错误，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestionnaire();
  }, [router]);
  
  if (loading) {
    return (
      <div className="w-screen h-screen bg-white flex flex-col justify-center items-center text-black pt-0">
        <div className="overflow-hidden w-[220px] h-[280px] mx-auto text-center text-[16px] flex flex-col justify-center items-center relative">
          {/* 背景图作为单独的元素以确保居中 */}
          <div className="absolute inset-0 bg-[url('/images/loading-background-image.png')] bg-no-repeat bg-center bg-contain z-0"></div>
          <div className="w-[135px] h-[135px] my-[20px] mb-[15px] mx-auto relative flex justify-center items-center z-10">
            <Image
              src="/images/loading-image.gif"
              alt=""
              fill
              sizes="135px"
              style={{
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
        <div className="my-[15px] mb-[25px] mx-0 w-full text-center z-10">借款申请正在智能评估中…</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-screen h-screen bg-white flex flex-col justify-center items-center text-black pt-0">
        <div className="overflow-hidden w-[220px] h-[280px] mx-auto text-center text-[16px] flex flex-col justify-center items-center relative">
          {/* 背景图作为单独的元素以确保居中 */}
          <div className="absolute inset-0 bg-[url('/images/loading-background-image.png')] bg-no-repeat bg-center bg-contain z-0"></div>
          <div className="w-[135px] h-[135px] my-[20px] mb-[15px] mx-auto relative flex justify-center items-center z-10">
            <Image
              src="/images/loading-image.gif"
              alt=""
              fill
              sizes="135px"
              style={{
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
        <div className="my-[15px] mb-[25px] mx-0 w-full text-center z-10 text-red-500">错误: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-white flex flex-col justify-center items-center text-black pt-0">
      <div className="overflow-hidden w-[220px] h-[280px] mx-auto text-center text-[16px] flex flex-col justify-center items-center relative">
        {/* 背景图作为单独的元素以确保居中 */}
        <div className="absolute inset-0 bg-[url('/images/loading-background-image.png')] bg-no-repeat bg-center bg-contain z-0"></div>
        <div className="w-[135px] h-[135px] my-[20px] mb-[15px] mx-auto relative flex justify-center items-center z-10">
          <Image
            src="/images/loading-image.gif"
            alt=""
            fill
            sizes="135px"
            style={{
              objectFit: 'contain'
            }}
          />
        </div>
      </div>
      <div className="my-[15px] mb-[25px] mx-0 w-full text-center z-10">借款申请正在智能评估中…</div>

      <div className="fixed top-0 left-0 z-[3000] w-screen h-screen bg-white flex justify-center items-center" style={{ display: 'none' }}>
        <div className="w-[250px] h-[250px] m-0 relative flex justify-center items-center">
          <Image
            src="/images/count-down-cover-image.gif"
            alt=""
            fill
            sizes="250px"
            style={{
              objectFit: 'contain'
            }}
          />
        </div>
      </div>
    </div>
  );
}