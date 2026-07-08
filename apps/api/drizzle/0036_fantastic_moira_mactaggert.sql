ALTER TABLE "order" ADD COLUMN "promotion_id" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "promotion_discount" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_promotion_id_promotion_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotion"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_promotionId_idx" ON "order" USING btree ("promotion_id");