'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { provinces, cities } from '@/lib/china-division';
import { h5Store } from '../store';

interface PersonalInfoFormProps {
  customerId: string;
  onSubmit: (data: {
    name: string;
    idCard: string;
    province: string;
    city: string;
    district: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function PersonalInfoForm({ customerId, onSubmit, onCancel }: PersonalInfoFormProps) {
  const [name, setName] = useState('');
  const [idCard, setIdCard] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAddressSelect = () => {
    setShowAddressPicker(true);
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProvinceName = e.target.value;
    setProvince(selectedProvinceName);
    setCity('');
    setDistrict('');
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCity(e.target.value);
    setDistrict('');
  };

  const handleConfirmAddress = () => {
    if (!province || !city) {
      toast.error('请选择完整的地址信息');
      return;
    }
    setShowAddressPicker(false);
  };

  const handleSubmit = async () => {
    if (!name || !idCard || !province || !city) {
      toast.error('请填写完整的个人信息');
      return;
    }

    // 验证身份证号格式（简单验证）
    const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (!idCardRegex.test(idCard)) {
      toast.error('请输入正确的身份证号');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        name,
        idCard,
        province,
        city,
        district,
      });
      // 标记为已提交
      setIsSubmitted(true);
    } catch (err) {
      console.error('Failed to submit personal info:', err);
      toast.error('提交失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 获取当前省份的代码
  const currentProvinceCode = provinces.find(p => p.name === province)?.code || '';
  
  // 获取当前省份的城市列表
  const currentCities = currentProvinceCode ? cities[currentProvinceCode] || [] : [];

  // 计算进度百分比
  const progressPercentage = isSubmitted ? 100 : 50;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* 顶部进度条和信息 */}
      <div className="p-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm font-medium text-gray-800">
            预估额度: ¥{Math.round(parseFloat(h5Store.getData('applicationAmount') || '0')).toLocaleString()}
          </div>
          <div className="text-sm text-gray-800">
            {isSubmitted ? '完成' : '填写个人信息'}
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="submit-info">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-center text-gray-800">填写个人信息</h1>
          </div>

          {/* 官方认证信息 */}
          <div className="item mb-6">
            <div className="flex items-center mb-2">
              <div className="font-color text-lg font-bold text-gray-800">官方认证，保护您的隐私安全</div>
            </div>
            <div className="tip text-sm text-gray-500 mb-4">
              您的身份证号码仅作真实性验证，我方不会另作他用
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  placeholder="请输入您的真实姓名"
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">身份证号</label>
                <input
                  type="text"
                  placeholder="请输入您的身份证号"
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
                  value={idCard}
                  onChange={(e) => setIdCard(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 当前居住地址 */}
          <div className="item mb-6">
            <div className="flex items-center mb-2">
              <div className="font-color text-lg font-bold text-gray-800">当前居住地址</div>
            </div>
            <div className="tip text-sm text-gray-500 mb-4">
              金融机构不支持跨城市申请，请您选择您的当前居住城市
            </div>
            
            <div 
              className="city-select p-3 border border-gray-300 rounded-md cursor-pointer bg-gray-50 text-gray-800"
              onClick={handleAddressSelect}
            >
              <div className="font-color">
                {province && city ? `${province} ${city} ${district}` : '请选择您当前所在城市'}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-4">
            <div 
              className="flex-1 py-3 bg-gray-300 text-gray-800 text-center rounded-md font-medium"
              onClick={onCancel}
            >
              返回
            </div>
            <div 
              className="flex-1 py-3 bg-blue-500 text-white text-center rounded-md font-medium"
              onClick={handleSubmit}
            >
              {loading ? '提交中...' : '提交资料'}
            </div>
          </div>

          {/* 协议 */}
          <div className="protocol-container flex items-center justify-center mt-4 text-sm text-gray-600">
            <input type="checkbox" className="mr-2" defaultChecked />
            <span>我已阅读并同意：</span>
            <em className="text-blue-500 ml-1">《个人信息授权书》</em>
          </div>
        </div>
      </div>

      {/* 地址选择器弹窗 */}
      {showAddressPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-lg p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <div className="font-bold text-gray-800">选择地址</div>
              <div 
                className="text-blue-500"
                onClick={() => setShowAddressPicker(false)}
              >
                完成
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">省份</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
                  value={province}
                  onChange={handleProvinceChange}
                >
                  <option value="">请选择省份</option>
                  {provinces.map((prov) => (
                    <option key={prov.code} value={prov.name}>{prov.name}</option>
                  ))}
                </select>
              </div>
              
              {province && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">城市</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
                    value={city}
                    onChange={handleCityChange}
                  >
                    <option value="">请选择城市</option>
                    {currentCities.map((ct) => (
                      <option key={ct.code} value={ct.name}>{ct.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div 
                className="py-3 bg-blue-500 text-white text-center rounded-md font-medium"
                onClick={handleConfirmAddress}
              >
                确认选择
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast提示容器 */}
      <div className="toast-container"></div>
    </div>
  );
}