import Image from 'next/image';

export default function H5Home() {
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