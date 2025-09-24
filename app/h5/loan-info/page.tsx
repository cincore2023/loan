'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { h5Store } from '@/lib/store';
import PersonalInfoForm from './PersonalInfoForm';

export default function LoanInfo() {
  const router = useRouter();
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationAmount, setApplicationAmount] = useState<string>('');
  const [initialAmount, setInitialAmount] = useState<string>('0');
  const [estimatedAmount, setEstimatedAmount] = useState<string>('0');
  const [showPersonalInfoForm, setShowPersonalInfoForm] = useState(false);

  // 从store获取数据
  useEffect(() => {
    const storedQuestionnaire = h5Store.getData('questionnaire');
    const storedCustomerId = h5Store.getData('customerId');
    const storedApplicationAmount = h5Store.getData('applicationAmount');
    
    if (!storedQuestionnaire || !storedCustomerId || !storedApplicationAmount) {
      setError('缺少必要的信息');
      return;
    }
    
    setQuestionnaire(storedQuestionnaire);
    setCustomerId(storedCustomerId);
    setApplicationAmount(storedApplicationAmount);
    
    // 计算初始额度（申请金额的一半）
    const initial = storedApplicationAmount ? (parseFloat(storedApplicationAmount) / 2).toString() : '0';
    setInitialAmount(initial);
    setEstimatedAmount(initial);
  }, []);

  // 计算进度百分比（初始50%，答题过程中逐步增加，填写个人信息后100%）
  const progressPercentage = questionnaire ? 
    showPersonalInfoForm ? 100 : 50 + Math.round(((currentQuestionIndex) / questionnaire.questions.length) * 50) : 50;
  
  // 处理选项选择
  const handleOptionSelect = (optionId: string) => {
    if (!questionnaire) return;
    
    const currentQuestion = questionnaire.questions[currentQuestionIndex];
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
    
    // 更新预估额度（每完成一题增加总金额的50%除以题目数量）
    const totalAmount = parseFloat(applicationAmount);
    const amountPerQuestion = (totalAmount * 0.5) / questionnaire.questions.length;
    setEstimatedAmount(prev => (parseFloat(prev) + amountPerQuestion).toString());
    
    // 如果不是最后一个问题，进入下一个问题
    if (currentQuestionIndex < questionnaire.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    } else {
      // 如果是最后一个问题，显示个人信息表单
      setTimeout(() => {
        setShowPersonalInfoForm(true);
      }, 300);
    }
  };

  // 提交个人信息
  const handlePersonalInfoSubmit = async (data: {
    name: string;
    idCard: string;
    province: string;
    city: string;
    district: string;
  }) => {
    if (!customerId) {
      throw new Error('缺少客户ID');
    }
    
    try {
      setLoading(true);
      
      // 准备用户选择的答案数据
      const selectedQuestions = questionnaire.questions.map((q: any) => {
        const selectedOptionId = selectedAnswers[q.id];
        const selectedOption = q.options.find((opt: any) => opt.id === selectedOptionId);
        
        return {
          questionId: q.id,
          questionTitle: q.title,
          selectedOptionId: selectedOptionId,
          selectedOptionText: selectedOption?.text || ''
        };
      });
      
      // 更新客户资料，添加用户选择的答案和个人信息
      const response = await fetch(`/api/admin/customers`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: customerId,
          customerName: data.name,
          idCard: data.idCard,
          province: data.province,
          city: data.city,
          district: data.district,
          selectedQuestions: selectedQuestions
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // 提交成功，清除store中的临时数据
        h5Store.clearData('customerId');
        h5Store.clearData('channelInfo');
        h5Store.clearData('questionnaire');
        
        // 跳转到首页
        router.push('/h5/superLoan');
      } else {
        throw new Error(result.error || '提交失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 取消填写个人信息
  const handlePersonalInfoCancel = () => {
    setShowPersonalInfoForm(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-red-500 text-center">
          <div className="text-lg font-bold mb-2">错误</div>
          <div>{error}</div>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div>加载中...</div>
      </div>
    );
  }

  // 如果需要显示个人信息表单，则渲染表单组件
  if (showPersonalInfoForm) {
    return (
      <PersonalInfoForm
        customerId={customerId || ''}
        onSubmit={handlePersonalInfoSubmit}
        onCancel={handlePersonalInfoCancel}
      />
    );
  }

  const currentQuestion = questionnaire.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-white flex flex-col">
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
            预估额度: ¥{Math.round(parseFloat(estimatedAmount)).toLocaleString()}
          </div>
          <div className="text-sm text-gray-800">
            {currentQuestionIndex + 1}/{questionnaire.questions.length}
          </div>
        </div>
      </div>

      {/* 问题内容 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <h1 className="text-xl font-bold text-center mb-8 text-gray-800">
          {currentQuestion.title}
        </h1>
        
        <div className="w-full space-y-4">
          {currentQuestion.options.map((option: any) => (
            <div
              key={option.id}
              className="w-full p-4 bg-gray-100 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors text-gray-800"
              onClick={() => handleOptionSelect(option.id)}
            >
              <div className="text-center">{option.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 加载遮罩 */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <div>提交中...</div>
          </div>
        </div>
      )}
    </div>
  );
}