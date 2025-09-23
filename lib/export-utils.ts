import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { formatDateTime } from '@/lib/utils';

// 定义客户数据类型
interface CustomerData {
  id: string;
  customerName?: string | null;
  applicationAmount?: string | null;
  province?: string | null;
  city?: string | null;
  district?: string | null;
  phoneNumber?: string | null;
  idCard?: string | null;
  submissionTime?: string | null;
  channelLink?: string | null;
  createdAt?: string;
  updatedAt?: string;
  selectedQuestions?: {
    questionId: string;
    questionTitle: string;
    selectedOptionId: string;
    selectedOptionText: string;
  }[] | null;
  questionnaireName?: string | null;
}

/**
 * 导出客户数据到Excel
 * @param customers 客户数据数组
 * @param questionnaireName 问卷名称
 */
export function exportCustomersToExcel(
  customers: CustomerData[],
  questionnaireName: string
): void {
  if (customers.length === 0) return;

  // 获取最早的提交时间作为文件名的一部分
  const validDates = customers
    .map(c => new Date(c.submissionTime || ''))
    .filter(date => !isNaN(date.getTime()));

  const earliestSubmission = validDates.length > 0
    ? validDates.sort((a, b) => a.getTime() - b.getTime())[0]
    : new Date();

  // 格式化最早的提交时间
  const startDate = formatDateTime(earliestSubmission, 'YYYYMMDD');

  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  
  // 确定最大题目数，用于创建相应数量的列
  const maxQuestions = Math.max(
    ...customers.map(customer => 
      customer.selectedQuestions ? customer.selectedQuestions.length : 0
    ),
    0
  );
  
  // 处理客户数据，确保字段顺序一致
  const worksheetData = customers.map(customer => {
    const baseData = {
      '申请额度': customer.applicationAmount || '',
      '所属省份': customer.province || '',
      '所属城市': customer.city || '',
      '所属区域': customer.district || '',
      '手机号': customer.phoneNumber || '',
      '身份证': customer.idCard || '',
      '提交时间': customer.submissionTime 
        ? formatDateTime(customer.submissionTime, 'YYYY-MM-DD HH:mm:ss') 
        : '',
      '渠道链接': customer.channelLink || '',
      '问卷名称': customer.questionnaireName || '',
      '创建时间': customer.createdAt 
        ? formatDateTime(customer.createdAt, 'YYYY-MM-DD HH:mm:ss') 
        : '',
      '更新时间': customer.updatedAt 
        ? formatDateTime(customer.updatedAt, 'YYYY-MM-DD HH:mm:ss') 
        : ''
    };
    
    // 添加选题列
    const questionData: Record<string, string> = {};
    for (let i = 0; i < maxQuestions; i++) {
      const questionIndex = i + 1;
      if (customer.selectedQuestions && customer.selectedQuestions[i]) {
        const question = customer.selectedQuestions[i];
        questionData[`题目${questionIndex}`] = question.questionTitle;
        questionData[`答案${questionIndex}`] = question.selectedOptionText;
      } else {
        questionData[`题目${questionIndex}`] = '';
        questionData[`答案${questionIndex}`] = '';
      }
    }
    
    return { ...baseData, ...questionData };
  });

  // 创建工作表
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  
  // 设置列宽
  const colWidths = [
    { wch: 15 }, // 客户名称
    { wch: 15 }, // 申请额度
    { wch: 15 }, // 所属省份
    { wch: 15 }, // 所属城市
    { wch: 15 }, // 所属区域
    { wch: 15 }, // 手机号
    { wch: 20 }, // 身份证
    { wch: 20 }, // 提交时间
    { wch: 15 }, // 渠道链接
    { wch: 20 }, // 问卷名称
    { wch: 20 }, // 创建时间
    { wch: 20 }  // 更新时间
  ];
  
  // 为选题列添加宽度设置
  for (let i = 0; i < maxQuestions; i++) {
    colWidths.push({ wch: 30 }); // 题目列
    colWidths.push({ wch: 20 }); // 答案列
  }

  // 应用列宽
  worksheet['!cols'] = colWidths;

  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, '客户数据');
  
  // 生成文件名：提交时间起始 + 问卷名称
  // 清理问卷名称中的非法字符
  const cleanQuestionnaireName = questionnaireName.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
  const fileName = `${startDate}_${cleanQuestionnaireName}.xlsx`;
  
  // 导出文件
  XLSX.writeFile(workbook, fileName);
}

/**
 * 批量导出多个问卷的客户数据
 * @param groupedCustomers 按问卷分组的客户数据
 */
export function exportMultipleQuestionnaires(
  groupedCustomers: Record<string, CustomerData[]>
): void {
  // 检查是否有数据
  const hasData = Object.values(groupedCustomers).some(customers => customers.length > 0);
  if (!hasData) return;

  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  
  // 为每个问卷创建一个工作表
  Object.entries(groupedCustomers).forEach(([questionnaireName, customers]) => {
    if (customers.length === 0) return;
    
    // 确定最大题目数，用于创建相应数量的列
    const maxQuestions = Math.max(
      ...customers.map(customer => 
        customer.selectedQuestions ? customer.selectedQuestions.length : 0
      ),
      0
    );
    
    // 处理客户数据
    const worksheetData = customers.map(customer => {
      const baseData = {
        '客户名称': customer.customerName || '',
        '申请额度': customer.applicationAmount || '',
        '所属省份': customer.province || '',
        '所属城市': customer.city || '',
        '所属区域': customer.district || '',
        '手机号': customer.phoneNumber || '',
        '身份证': customer.idCard || '',
        '提交时间': customer.submissionTime 
          ? formatDateTime(customer.submissionTime, 'YYYY-MM-DD HH:mm:ss') 
          : '',
        '渠道链接': customer.channelLink || '',
        '问卷名称': customer.questionnaireName || '',
        '创建时间': customer.createdAt 
          ? formatDateTime(customer.createdAt, 'YYYY-MM-DD HH:mm:ss') 
          : '',
        '更新时间': customer.updatedAt 
          ? formatDateTime(customer.updatedAt, 'YYYY-MM-DD HH:mm:ss') 
          : ''
      };
      
      // 添加选题列
      const questionData: Record<string, string> = {};
      for (let i = 0; i < maxQuestions; i++) {
        const questionIndex = i + 1;
        if (customer.selectedQuestions && customer.selectedQuestions[i]) {
          const question = customer.selectedQuestions[i];
          questionData[`题目${questionIndex}`] = question.questionTitle;
          questionData[`答案${questionIndex}`] = question.selectedOptionText;
        } else {
          questionData[`题目${questionIndex}`] = '';
          questionData[`答案${questionIndex}`] = '';
        }
      }
      
      return { ...baseData, ...questionData };
    });

    // 创建工作表
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    
    // 设置列宽
    const colWidths = [
      { wch: 15 }, // 客户名称
      { wch: 15 }, // 申请额度
      { wch: 15 }, // 所属省份
      { wch: 15 }, // 所属城市
      { wch: 15 }, // 所属区域
      { wch: 15 }, // 手机号
      { wch: 20 }, // 身份证
      { wch: 20 }, // 提交时间
      { wch: 15 }, // 渠道链接
      { wch: 20 }, // 问卷名称
      { wch: 20 }, // 创建时间
      { wch: 20 }  // 更新时间
    ];
    
    // 为选题列添加宽度设置
    for (let i = 0; i < maxQuestions; i++) {
      colWidths.push({ wch: 30 }); // 题目列
      colWidths.push({ wch: 20 }); // 答案列
    }

    // 应用列宽
    worksheet['!cols'] = colWidths;

    // 将工作表添加到工作簿，使用问卷名称作为工作表名
    // 清理工作表名中的非法字符并限制长度
    const cleanSheetName = questionnaireName
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
      .substring(0, 31);
    const sheetName = cleanSheetName || '未命名问卷';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });
  
  // 获取最早的提交时间作为文件名的一部分
  const allCustomers = Object.values(groupedCustomers).flat();
  const validDates = allCustomers
    .map(c => new Date(c.submissionTime || ''))
    .filter(date => !isNaN(date.getTime()));

  const earliestSubmission = validDates.length > 0
    ? validDates.sort((a, b) => a.getTime() - b.getTime())[0]
    : new Date();

  // 格式化最早的提交时间
  const startDate = formatDateTime(earliestSubmission, 'YYYYMMDD');

  // 生成文件名：提交时间起始 + 批量导出
  const fileName = `${startDate}_批量导出.xlsx`;
  
  // 导出文件
  XLSX.writeFile(workbook, fileName);
}

// 定义渠道数据类型
interface ChannelData {
  id: string;
  channelNumber: string;
  channelName: string;
  questionnaireName?: string | null;
  uvCount: number;
  questionnaireSubmitCount: number;
  remark: string;
  shortLink: string;
  tags?: string[] | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

/**
 * 导出渠道数据到Excel
 * @param channels 渠道数据数组
 */
export function exportChannelsToExcel(channels: ChannelData[]): void {
  if (channels.length === 0) return;

  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  
  // 处理渠道数据
  const worksheetData = channels.map(channel => ({
    '渠道编号': channel.channelNumber,
    '渠道名称': channel.channelName,
    '渠道标签': channel.tags ? channel.tags.join(', ') : '',
    '绑定问卷': channel.questionnaireName || '',
    'UV访问次数': channel.uvCount,
    '问卷填写总数': channel.questionnaireSubmitCount,
    '短链接': channel.shortLink,
    '备注': channel.remark,
    '创建时间': channel.createdAt 
      ? formatDateTime(channel.createdAt, 'YYYY-MM-DD HH:mm:ss') 
      : '',
    '更新时间': channel.updatedAt 
      ? formatDateTime(channel.updatedAt, 'YYYY-MM-DD HH:mm:ss') 
      : '',
    '状态': channel.isActive ? '启用' : '禁用'
  }));

  // 创建工作表
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  
  // 设置列宽
  const colWidths = [
    { wch: 15 }, // 渠道编号
    { wch: 20 }, // 渠道名称
    { wch: 20 }, // 渠道标签
    { wch: 20 }, // 绑定问卷
    { wch: 15 }, // UV访问次数
    { wch: 15 }, // 问卷填写总数
    { wch: 30 }, // 短链接
    { wch: 20 }, // 备注
    { wch: 20 }, // 创建时间
    { wch: 20 }, // 更新时间
    { wch: 10 }  // 状态
  ];

  // 应用列宽
  worksheet['!cols'] = colWidths;

  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, '渠道数据');
  
  // 生成文件名
  const fileName = `渠道数据_${formatDateTime(new Date(), 'YYYYMMDD')}.xlsx`;
  
  // 导出文件
  XLSX.writeFile(workbook, fileName);
}
