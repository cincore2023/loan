ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "products" CASCADE;--> statement-breakpoint
ALTER TABLE "customers" DROP CONSTRAINT "customers_customer_number_unique";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "customer_number";