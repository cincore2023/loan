import { relations } from "drizzle-orm/relations";
import { questionnaires, channels, customers } from "./schema";

export const channelsRelations = relations(channels, ({one}) => ({
	questionnaire: one(questionnaires, {
		fields: [channels.questionnaireId],
		references: [questionnaires.id]
	}),
}));

export const questionnairesRelations = relations(questionnaires, ({many}) => ({
	channels: many(channels),
	customers: many(customers),
}));

export const customersRelations = relations(customers, ({one}) => ({
	questionnaire: one(questionnaires, {
		fields: [customers.questionnaireId],
		references: [questionnaires.id]
	}),
}));