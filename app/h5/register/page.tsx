import Image from 'next/image';
import { CloseOutlined } from '@ant-design/icons';

export default function Register() {
  // 获取今天的日期字符串
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');

  return (
    <div className="min-h-screen p-4 bg-[#f8f8f8]">
      {/* 贷款信息容器 */}
      <div className="p-4 bg-white rounded-lg">
        <img src="/images/loan-info-container-title-new.png"  alt="" />
        
        <div className="my-2 mb-4 text-sm text-[#999]">
          <span>最高可借</span>
          <span style={{ display: 'none' }}>最高可借(具体金额以实际审批为准)</span>
        </div>
        
        <div className="flex items-center justify-between pb-2 border-b border-[#e0e0e0] whitespace-nowrap">
          <input 
            type="number" 
            className="w-3/5 bg-transparent border-0 outline-none text-xl font-bold text-[#333]"
            style={{ background: 'transparent' }}
            placeholder="请输入金额"
          />
          <div className="flex items-center flex-1 text-[12px] text-[#366df7]">
            <span>全部借出</span>
            <em className="mx-1 my-0 text-[#999]">(金额可修改)</em>
            <CloseOutlined className="text-[12px]" />
          </div>
        </div>
        
        <div className="mt-3 bg-[#f8f8f8] rounded-lg text-xs text-[#999]">
          <div className="flex items-center justify-between px-4 h-12">
            <span className="text-base font-bold text-[#333]">借款期限</span>
            <em className="text-sm text-[#333]">可选3,6,12,36期</em>
          </div>
          <div className="flex items-center justify-between px-4 h-12">
            <span className="text-base font-bold text-[#333]">还款方式</span>
            <div className="text-right">
              <div>
                <em className="text-sm text-[#333]">随借随还</em>
                <em className="text-sm text-[#333]" style={{ display: 'none' }}>还款灵活</em>
              </div>
              <div>具体方式需根据最终资方而定</div>
            </div>
          </div>
          <div style={{ display: 'none' }}>
            <span className="text-base font-bold text-[#333]">年化利率</span>
            <div>
              <div>
                <em className="text-sm text-[#333]">24%-36%(单利)</em>
              </div>
              <div className="text-[#333]">实际以审核为准</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 登录表单容器 */}
      <div className="my-2 p-4 pt-4 pb-6 bg-white rounded-lg">
        <input 
          type="text" 
          placeholder="请输入手机号" 
          className="w-full h-12 bg-[#f8f8f8] border-0 rounded-md text-base text-[#9a9a9a] px-4 mb-4"
        />
        <div className="flex justify-center items-center h-12 my-4 mb-3 bg-[#325ef3] rounded-md text-lg font-medium text-white">
          去借钱
        </div>
        <div className="flex justify-center items-center text-sm text-[#5a5a5a]">
          <div className="relative size-3 mr-2">
            <Image 
              src="/images/protocol-is-selected.png" 
              alt="" 
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className="relative size-3 mr-2" style={{ display: 'none' }}>
            <Image 
              src="/images/protocol-is-not-selected.png" 
              alt="" 
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <span>我已阅读并同意</span>
          <em className="text-[#325ef3] ml-1">《注册协议》</em>
          <em className="text-[#325ef3] ml-1">《隐私协议》</em>
        </div>
      </div>
      
      {/* 隐藏的图片 */}
      <div className="relative w-full h-24 mb-4" style={{ display: 'none' }}>
        <Image 
          src="/images/loading-image.gif" 
          alt="" 
          fill
          style={{ objectFit: 'contain', marginBottom: '0.267rem' }}
        />
      </div>
      <div className="relative w-full h-24" style={{ display: 'none' }}>
        <Image 
          src="/images/loading-image.gif" 
          alt="" 
          fill
          style={{ objectFit: 'contain' }}
        />
      </div>
      
      {/* 提交历史列表容器 */}
      <div className="overflow-hidden">
        <div className="relative w-[60px] my-2">
          <img src="/images/swipe-title.png"  alt="" />
        </div>
        <div className="overflow-x-auto flex w-full">
          {/* 历史记录项1 */}
          <div className="flex-shrink-0 relative w-[240px] mr-[10px] py-[12px] pl-[12px] pr-[16px] bg-white rounded-[8px] text-[12px] font-normal text-[#999]">
            <div className="relative py-[5px] pl-[50px] mb-1">
              <div className="absolute left-0 top-0 size-[40px]">
                <Image
                  src="/avatar/avatar5.png"
                  alt=""
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="text-[16px] font-normal text-[#333]">蒙先生</div>
              <div>186****1160</div>
            </div>
            <div>申请时间：{today}</div>
            <div>获额时间：{today}</div>
            <div className="absolute right-[16px] top-[10px]">
              <em className="text-[18px] font-bold text-[#ff483b]">160000</em>
            </div>
            <div className="absolute right-[16px] top-[35px] text-[12px] font-normal text-[#999]">获批额度</div>
          </div>

          {/* 历史记录项2 */}
          <div className="flex-shrink-0 relative w-[240px] mr-[10px] py-[12px] pl-[12px] pr-[16px] bg-white rounded-[8px] text-[14px] font-normal text-[#999] pb-0">
            <div className="relative py-[5px] pl-[50px] mb-1">
              <div className="absolute left-0 top-0 size-[40px]">
                <Image
                  src="/avatar/avatar10.png"
                  alt=""
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="text-[16px] font-normal text-[#333]">刘先生</div>
              <div>138****7459</div>
            </div>
            <div>申请时间：{today}</div>
            <div>获额时间：{today}</div>
            <div className="absolute right-[16px] top-[10px]">
              <em className="text-[18px] font-bold text-[#ff483b]">20000</em>
            </div>
            <div className="absolute right-[16px] top-[35px] text-[12px] font-normal text-[#999]">获批额度</div>
          </div>

          {/* 历史记录项3 */}
          <div className="flex-shrink-0 relative w-[240px] mr-[10px] py-[12px] pl-[12px] pr-[16px] bg-white rounded-[8px] text-[14px] font-normal text-[#999] pb-0">
            <div className="relative py-[5px] pl-[50px] mb-1">
              <div className="absolute left-0 top-0 size-[40px]">
                <Image
                  src="/avatar/avatar13.png"
                  alt=""
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="text-[16px] font-normal text-[#333]">赵女士</div>
              <div>155****6268</div>
            </div>
            <div>申请时间：{today}</div>
            <div>获额时间：{today}</div>
            <div className="absolute right-[16px] top-[10px]">
              <em className="text-[18px] font-bold text-[#ff483b]">40000</em>
            </div>
            <div className="absolute right-[16px] top-[35px] text-[12px] font-normal text-[#999]">获批额度</div>
          </div>

          {/* 历史记录项4 */}
          <div className="flex-shrink-0 relative w-[240px] mr-[10px] py-[12px] pl-[12px] pr-[16px] bg-white rounded-[8px] text-[14px] font-normal text-[#999] pb-0">
            <div className="relative py-[5px] pl-[50px] mb-1">
              <div className="absolute left-0 top-0 size-[40px]">
                <Image
                  src="/avatar/avatar15.png"
                  alt=""
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="text-[16px] font-normal text-[#333]">李女士</div>
              <div>136****5219</div>
            </div>
            <div>申请时间：{today}</div>
            <div>获额时间：{today}</div>
            <div className="absolute right-[16px] top-[10px]">
              <em className="text-[18px] font-bold text-[#ff483b]">30000</em>
            </div>
            <div className="absolute right-[16px] top-[35px] text-[12px] font-normal text-[#999]">获批额度</div>
          </div>

          {/* 历史记录项5 */}
          <div className="flex-shrink-0 relative w-[240px] mr-[10px] py-[12px] pl-[12px] pr-[16px] bg-white rounded-[8px] text-[14px] font-normal text-[#999] pb-0">
            <div className="relative py-[5px] pl-[50px] mb-1">
              <div className="absolute left-0 top-0 size-[40px]">
                <Image
                  src="/avatar/avatar1.png"
                  alt=""
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="text-[16px] font-normal text-[#333]">王先生</div>
              <div>151****9996</div>
            </div>
            <div>申请时间：{today}</div>
            <div>获额时间：{today}</div>
            <div className="absolute right-[16px] top-[10px]">
              <em className="text-[18px] font-bold text-[#ff483b]">200000</em>
            </div>
            <div className="absolute right-[16px] top-[35px] text-[12px] font-normal text-[#999]">获批额度</div>
          </div>
        </div>
      </div>
      
      {/* 提示信息 */}
      <div className="text-xs text-[#999] mt-6">
        <p>本平台是移动金融信息广告展示平台，不提供放贷业务</p>
        <p>平台向您展示的贷款产品或贷款咨询服务是由贷款服务机构</p>
        <p>(泛指为您提供贷款咨询服务或贷款发放服务的机构)或贷款中介咨询机构提供 </p>
        <p>您最终获取的贷款额度、放款时间以第三方机构实际审批结果为准</p>
        <p>温馨提示:请根据个人能力合理贷款，理性消费，避免逾期</p>
        <p>请不要相信任何要求您支付费用的信息、邮件、电话等不实信息</p>
        <p> 客服电话:<span>4000606039</span>(服务时间:<span>9:00-18:00</span>工作日) </p>
      </div>
      
      {/* 页脚 */}
      <footer className="mt-6">
        <div className="flex justify-between">
          <div></div>
          <div></div>
          <div>
            <a href="https://beian.miit.gov.cn" target="_blank"></a>
          </div>
        </div>
        <div style={{ display: 'none' }}>客服电话：4000606039(工作日9:00-18:00)</div>
      </footer>
    </div>
  );
}