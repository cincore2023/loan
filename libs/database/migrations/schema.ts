import { pgTable, uuid, text, boolean, timestamp, unique, jsonb, foreignKey, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const admins = pgTable("admins", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	password: text().notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
});

export const questionnaires = pgTable("questionnaires", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	questionnaireNumber: text("questionnaire_number").notNull(),
	questionnaireName: text("questionnaire_name").notNull(),
	remark: text(),
	questions: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("questionnaires_questionnaire_number_unique").on(table.questionnaireNumber),
]);

export const channels = pgTable("channels", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	channelNumber: text("channel_number").notNull(),
	channelName: text("channel_name").notNull(),
	questionnaireId: uuid("questionnaire_id"),
	uvCount: integer("uv_count").default(0),
	questionnaireSubmitCount: integer("questionnaire_submit_count").default(0),
	remark: text(),
	shortLink: text("short_link"),
	tags: jsonb(),
	downloadLink: text("download_link"),
	isDefault: boolean("is_default").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true),
}, (table) => [
	foreignKey({
			columns: [table.questionnaireId],
			foreignColumns: [questionnaires.id],
			name: "channels_questionnaire_id_questionnaires_id_fk"
		}),
	unique("channels_channel_number_unique").on(table.channelNumber),
	unique("channels_short_link_unique").on(table.shortLink),
]);

export const customers = pgTable("customers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	customerName: text("customer_name"),
	applicationAmount: text("application_amount"),
	province: text(),
	city: text(),
	district: text(),
	phoneNumber: text("phone_number"),
	idCard: text("id_card"),
	submissionTime: timestamp("submission_time", { mode: 'string' }),
	questionnaireId: uuid("questionnaire_id"),
	selectedQuestions: jsonb("selected_questions"),
	channelLink: text("channel_link"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	channelId: text("channel_id"),
}, (table) => [
	foreignKey({
			columns: [table.questionnaireId],
			foreignColumns: [questionnaires.id],
			name: "customers_questionnaire_id_questionnaires_id_fk"
		}),
]);
