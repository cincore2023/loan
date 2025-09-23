-- 修改 customers 表，使 customer_number 可为空，并修改 customer_name 可为空
ALTER TABLE "customers" ALTER COLUMN "customer_number" DROP NOT NULL;
ALTER TABLE "customers" ALTER COLUMN "customer_name" DROP NOT NULL;