'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { h5Store } from '../store';

export default function H5Questionnaire() {
  const router = useRouter();
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationAmount, setApplicationAmount] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    // 从URL参数中获取客户ID
    const urlParams = new URLSearchParams(window.location.search);
    const customerIdParam = urlParams.get('customerId');
    
    if (!customerIdParam) {
      setError('缺少客户ID参数');
      return;
    }
    
    setCustomerId(customerIdParam);
    
    // 从store中获取问卷数据和申请金额
    const storedQuestionnaire = h5Store.getData('questionnaire');
    const storedApplicationAmount = h5Store.getData('applicationAmount');
    
    if (!storedQuestionnaire) {
      setError('缺少问卷信息');
      return;
    }
    
    setQuestionnaire(storedQuestionnaire);
    setApplicationAmount(storedApplicationAmount || '0');
  }, []);

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
    
    // 自动跳转到下一个问题
    if (questionnaire && currentQuestionIndex < questionnaire.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    // 检查是否所有问题都已回答
    if (!questionnaire || !customerId) {
      setError('缺少必要信息');
      return;
    }
    
    const allAnswered = questionnaire.questions.every((q: any) => selectedAnswers[q.id]);
    if (!allAnswered) {
      setError('请回答所有问题');
      return;
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
      
      // 更新客户资料，添加用户选择的答案
      const response = await fetch(`/api/admin/customers`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: customerId,
          selectedQuestions: selectedQuestions
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 提交成功，跳转到贷款信息页面
        router.push(`/h5/loan-info`);
      } else {
        setError(data.error || '提交问卷失败');
      }
    } catch (err) {
      console.error('Failed to submit questionnaire:', err);
      setError('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 计算预估额度（初始额度为申请金额的一半）
  const estimatedAmount = applicationAmount ? (parseFloat(applicationAmount) / 2).toString() : '0';
  
  // 计算进度百分比
  const progressPercentage = questionnaire ? Math.round(((currentQuestionIndex + 1) / questionnaire.questions.length) * 100) : 0;

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-red-500">错误: {error}</div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="min-h-screen p-4 bg-[#f8f8f8] flex items-center justify-center">
        <div>加载中...</div>
      </div>
    );
  }

  const currentQuestion = questionnaire.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen p-4 bg-[#f8f8f8]">
      {/* 顶部进度条和信息 */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">预估额度</div>
          <div className="text-lg font-bold text-blue-600">¥{Math.round(parseFloat(estimatedAmount)).toLocaleString()}</div>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {currentQuestionIndex + 1}/{questionnaire.questions.length}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4">
        <h1 className="text-xl font-bold text-center mb-6">{questionnaire.questionnaireName}</h1>
        
        {/* 当前问题 */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3">{currentQuestion.title}</h2>
          <div className="space-y-2">
            {currentQuestion.options.map((option: any) => (
              <div 
                key={option.id}
                className={`p-3 rounded-md border cursor-pointer ${
                  selectedAnswers[currentQuestion.id] === option.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200'
                }`}
                onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
              >
                {option.text}
              </div>
            ))}
          </div>
        </div>
        
        {/* 导航按钮 */}
        <div className="flex justify-between mt-6">
          <button
            className={`px-4 py-2 rounded-md ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'bg-gray-200'}`}
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            上一题
          </button>
          {currentQuestionIndex < questionnaire.questions.length - 1 ? (
            <button
              className={`px-4 py-2 rounded-md ${!selectedAnswers[currentQuestion.id] ? 'opacity-50 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
              onClick={() => {
                if (selectedAnswers[currentQuestion.id]) {
                  setCurrentQuestionIndex(prev => prev + 1);
                }
              }}
              disabled={!selectedAnswers[currentQuestion.id]}
            >
              下一题
            </button>
          ) : (
            <button
              className={`px-4 py-2 rounded-md ${!selectedAnswers[currentQuestion.id] ? 'opacity-50 cursor-not-allowed' : 'bg-green-500 text-white'}`}
              onClick={handleSubmit}
              disabled={!selectedAnswers[currentQuestion.id] || loading}
            >
              {loading ? '提交中...' : '提交问卷'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}