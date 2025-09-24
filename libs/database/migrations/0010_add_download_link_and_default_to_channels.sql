ALTER TABLE "channels" ADD COLUMN "download_link" text;
ALTER TABLE "channels" ADD COLUMN "is_default" boolean DEFAULT false;