CREATE TABLE "currency_cache" (
	"id" text PRIMARY KEY NOT NULL,
	"currency_code" text NOT NULL,
	"rate" double precision NOT NULL,
	"provider" text NOT NULL,
	"last_updated" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_item" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"size" text
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" text PRIMARY KEY NOT NULL,
	"shipping_address" text NOT NULL,
	"phone" text,
	"city" text NOT NULL,
	"province" text NOT NULL,
	"discount" double precision DEFAULT 0 NOT NULL,
	"payment_method" text DEFAULT 'cup' NOT NULL,
	"order_status" text DEFAULT 'pending' NOT NULL,
	"order_number" text NOT NULL,
	"tracking_number" text NOT NULL,
	"subtotal" double precision DEFAULT 0 NOT NULL,
	"shipping" double precision DEFAULT 0 NOT NULL,
	"total" double precision DEFAULT 0 NOT NULL,
	"notes" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_order_number_unique" UNIQUE("order_number"),
	CONSTRAINT "order_tracking_number_unique" UNIQUE("tracking_number")
);
--> statement-breakpoint
CREATE TABLE "product_favorite" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_favorite_user_product_unique" UNIQUE("user_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "product_image" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"product_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_related" (
	"product_id" text NOT NULL,
	"related_product_id" text NOT NULL,
	CONSTRAINT "product_related_product_id_related_product_id_pk" PRIMARY KEY("product_id","related_product_id")
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"price" double precision DEFAULT 0 NOT NULL,
	"description" text,
	"slug" text NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"sizes" text[] NOT NULL,
	"gender" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_title_unique" UNIQUE("title"),
	CONSTRAINT "product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "promotion_product" (
	"promotion_id" text NOT NULL,
	"product_id" text NOT NULL,
	CONSTRAINT "promotion_product_promotion_id_product_id_pk" PRIMARY KEY("promotion_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "promotion" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'percentage' NOT NULL,
	"value" double precision DEFAULT 0 NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"code" text NOT NULL,
	"minimum_purchase_amount" double precision,
	"max_uses" integer,
	"uses_per_user" integer,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_combinable" boolean DEFAULT false NOT NULL,
	"conditions" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promotion_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" text PRIMARY KEY NOT NULL,
	"comment" text NOT NULL,
	"rating" integer NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_favorite" ADD CONSTRAINT "product_favorite_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_favorite" ADD CONSTRAINT "product_favorite_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_related" ADD CONSTRAINT "product_related_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_related" ADD CONSTRAINT "product_related_related_product_id_product_id_fk" FOREIGN KEY ("related_product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_product" ADD CONSTRAINT "promotion_product_promotion_id_promotion_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_product" ADD CONSTRAINT "promotion_product_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_item_orderId_idx" ON "order_item" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_item_productId_idx" ON "order_item" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "order_userId_idx" ON "order" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "order_orderNumber_idx" ON "order" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "order_orderStatus_idx" ON "order" USING btree ("order_status");--> statement-breakpoint
CREATE INDEX "order_createdAt_idx" ON "order" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "product_favorite_userId_idx" ON "product_favorite" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "product_favorite_productId_idx" ON "product_favorite" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_image_productId_idx" ON "product_image" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_related_productId_idx" ON "product_related" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_related_relatedProductId_idx" ON "product_related" USING btree ("related_product_id");--> statement-breakpoint
CREATE INDEX "product_slug_idx" ON "product" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "product_gender_idx" ON "product" USING btree ("gender");--> statement-breakpoint
CREATE INDEX "product_userId_idx" ON "product" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "promotion_product_promotionId_idx" ON "promotion_product" USING btree ("promotion_id");--> statement-breakpoint
CREATE INDEX "promotion_product_productId_idx" ON "promotion_product" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "promotion_code_idx" ON "promotion" USING btree ("code");--> statement-breakpoint
CREATE INDEX "promotion_type_idx" ON "promotion" USING btree ("type");--> statement-breakpoint
CREATE INDEX "promotion_active_dates_idx" ON "promotion" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "review_userId_idx" ON "review" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_productId_idx" ON "review" USING btree ("product_id");
