import { pgTable, serial, text, timestamp, uuid, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// 管理员表
export const admins = pgTable('admins', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  name: text('name').notNull(),
  password: text('password').notNull(), // 在实际应用中应加密存储
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
});

// 客户选择的题目和答案类型
export type CustomerSelectedQuestion = {
  questionId: string;
  questionTitle: string;
  selectedOptionId: string;
  selectedOptionText: string;
};

// 客户表
export const customers = pgTable('customers', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  customerName: text('customer_name'), // 客户名称（可为空）
  applicationAmount: text('application_amount'), // 申请额度
  province: text('province'), // 省
  city: text('city'), // 市
  district: text('district'), // 区
  phoneNumber: text('phone_number'), // 手机号
  idCard: text('id_card'), // 身份证
  submissionTime: timestamp('submission_time'), // 提交时间
  questionnaireId: uuid('questionnaire_id').references(() => questionnaires.id), // 问卷id
  selectedQuestions: jsonb('selected_questions').$type<CustomerSelectedQuestion[]>(), // 用户选择的题目和答案
  channelLink: text('channel_link'), // 渠道链接
  createdAt: timestamp('created_at').defaultNow().notNull(), // 创建时间
  updatedAt: timestamp('updated_at').defaultNow().notNull(), // 修改时间
});

// 问卷题选项类型
export type QuestionOption = {
  id: string;
  text: string;
};

// 问卷题类型
export type Question = {
  id: string;
  title: string;
  options: QuestionOption[];
};

// 问卷表
export const questionnaires = pgTable('questionnaires', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  questionnaireNumber: text('questionnaire_number').notNull().unique(), // 问卷编号
  questionnaireName: text('questionnaire_name').notNull(), // 问卷名称
  remark: text('remark'), // 备注
  questions: jsonb('questions').$type<Question[]>(), // 问卷题（题id，标题，选项（多个））
  createdAt: timestamp('created_at').defaultNow().notNull(), // 创建时间
  updatedAt: timestamp('updated_at').defaultNow().notNull(), // 修改时间
});

// 渠道管理表
export const channels = pgTable('channels', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  channelNumber: text('channel_number').notNull().unique(), // 渠道编号
  channelName: text('channel_name').notNull(), // 渠道名称
  questionnaireId: uuid('questionnaire_id').references(() => questionnaires.id), // 绑定问卷
  uvCount: integer('uv_count').default(0), // UV访问次数
  questionnaireSubmitCount: integer('questionnaire_submit_count').default(0), // 问卷填写总数
  remark: text('remark'), // 备注
  shortLink: text('short_link').unique(), // 短链接
  tags: jsonb('tags').$type<string[]>(), // 渠道标签
  downloadLink: text('download_link'), // 下载链接
  isDefault: boolean('is_default').default(false), // 是否为默认渠道
  createdAt: timestamp('created_at').defaultNow().notNull(), // 创建时间
  updatedAt: timestamp('updated_at').defaultNow().notNull(), // 修改时间
  isActive: boolean('is_active').default(true), // 是否启用
});