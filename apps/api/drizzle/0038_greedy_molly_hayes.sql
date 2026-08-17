ALTER TABLE "order" ADD COLUMN "currency_rate_id" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "total_in_currency" double precision;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_currency_rate_id_currency_cache_id_fk" FOREIGN KEY ("currency_rate_id") REFERENCES "public"."currency_cache"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "currency_cache_currencyCode_idx" ON "currency_cache" USING btree ("currency_code");--> statement-breakpoint
CREATE UNIQUE INDEX "currency_cache_code_day_idx" ON "currency_cache" USING btree ("currency_code",date("last_updated"));