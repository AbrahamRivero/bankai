ALTER TABLE "product" ADD COLUMN "workspace_id" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "workspace_id" text;--> statement-breakpoint
ALTER TABLE "promotion" ADD COLUMN "workspace_id" text;--> statement-breakpoint
UPDATE "product" SET "workspace_id" = (SELECT "id" FROM "workspace" LIMIT 1);--> statement-breakpoint
UPDATE "order" SET "workspace_id" = (SELECT "id" FROM "workspace" LIMIT 1);--> statement-breakpoint
UPDATE "promotion" SET "workspace_id" = (SELECT "id" FROM "workspace" LIMIT 1);--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "promotion" ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion" ADD CONSTRAINT "promotion_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_workspaceId_idx" ON "order" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "product_workspaceId_idx" ON "product" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "promotion_workspaceId_idx" ON "promotion" USING btree ("workspace_id");