import { DEFAULT_ROLE_NAMES, defaultRolePayloads } from "@kaneo/permissions";
import { and, eq, inArray, sql } from "drizzle-orm";
import db, { schema } from "../database";

/**
 * Backfill the editable default roles (viewer/member/admin) for every
 * workspace that's missing them. Runs on API startup after Drizzle
 * migrations.
 *
 * These three roles used to be static (compiled into better-auth's
 * `roles` config). They were converted to DB rows so admins can override
 * them per workspace — but that means existing workspaces, which were
 * created before the switch, have no rows yet. Without this backfill,
 * better-auth's dynamic-access-control resolution would treat them as
 * having an empty permission set on existing workspaces.
 *
 * Also merges new resources into existing role payloads so that when a
 * new resource (e.g. `store`) is added to the built-in roles, every
 * workspace picks it up automatically without losing custom edits.
 *
 * Idempotent: only inserts rows that aren't already present, and only
 * merges resources that are missing from existing payloads.
 */
export async function seedDefaultWorkspaceRoles() {
  try {
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'workspace_role'
      ) AS exists;
    `);

    const exists =
      tableExists.rows[0]?.exists === true ||
      tableExists.rows[0]?.exists === "t";
    if (!exists) {
      console.log(
        "🛈 workspace_role table does not exist — skipping default-role seed.",
      );
      return;
    }

    const workspaces = await db
      .select({ id: schema.workspaceTable.id })
      .from(schema.workspaceTable);

    if (workspaces.length === 0) {
      return;
    }

    const workspaceIds = workspaces.map((w) => w.id);

    const existingRows = await db
      .select({
        workspaceId: schema.workspaceRoleTable.workspaceId,
        role: schema.workspaceRoleTable.role,
        permission: schema.workspaceRoleTable.permission,
      })
      .from(schema.workspaceRoleTable)
      .where(
        and(
          inArray(schema.workspaceRoleTable.workspaceId, workspaceIds),
          inArray(
            schema.workspaceRoleTable.role,
            DEFAULT_ROLE_NAMES as unknown as string[],
          ),
        ),
      );

    const present = new Set(
      existingRows.map((r) => `${r.workspaceId}:${r.role}`),
    );

    const now = new Date();
    const rows: Array<typeof schema.workspaceRoleTable.$inferInsert> = [];
    for (const workspaceId of workspaceIds) {
      for (const name of DEFAULT_ROLE_NAMES) {
        if (present.has(`${workspaceId}:${name}`)) continue;
        rows.push({
          workspaceId,
          role: name,
          permission: JSON.stringify(defaultRolePayloads[name]),
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    if (rows.length > 0) {
      // Postgres' bind protocol caps parameters at 65535 per query, so insert
      // in chunks. 6 columns × 1000 rows = 6000 params per batch, leaving ample
      // headroom even for instances with tens of thousands of workspaces.
      const BATCH_SIZE = 1000;
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        await db
          .insert(schema.workspaceRoleTable)
          .values(rows.slice(i, i + BATCH_SIZE));
      }
      console.log(
        `✅ Seeded ${rows.length} default workspace role row(s) across ${workspaceIds.length} workspace(s).`,
      );
    }

    // Merge new resources into existing role payloads. When a new resource
    // (e.g. `store`) is added to defaultRolePayloads, existing workspace_role
    // rows won't have it yet. This merges the missing resource without
    // overwriting any custom permissions the admin may have set.
    const updates: Array<{
      workspaceId: string;
      role: string;
      permission: string;
    }> = [];

    for (const row of existingRows) {
      const roleName = row.role as (typeof DEFAULT_ROLE_NAMES)[number];
      const defaultPayload = defaultRolePayloads[roleName];
      if (!defaultPayload) continue;

      let current: Record<string, string[]>;
      try {
        current =
          typeof row.permission === "string"
            ? JSON.parse(row.permission)
            : (row.permission as Record<string, string[]>);
      } catch {
        continue;
      }

      let changed = false;
      const merged = { ...current };
      for (const [resource, actions] of Object.entries(defaultPayload)) {
        if (!merged[resource]) {
          merged[resource] = actions;
          changed = true;
        }
      }

      // Remove resources that are no longer in defaultRolePayloads
      for (const resource of Object.keys(merged)) {
        if (!(resource in defaultPayload)) {
          delete merged[resource];
          changed = true;
        }
      }

      if (changed) {
        updates.push({
          workspaceId: row.workspaceId,
          role: roleName,
          permission: JSON.stringify(merged),
        });
      }
    }

    if (updates.length > 0) {
      const BATCH_SIZE = 1000;
      for (let i = 0; i < updates.length; i += BATCH_SIZE) {
        const batch = updates.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map((u) =>
            db
              .update(schema.workspaceRoleTable)
              .set({
                permission: u.permission,
                updatedAt: new Date(),
              })
              .where(
                and(
                  eq(schema.workspaceRoleTable.workspaceId, u.workspaceId),
                  eq(schema.workspaceRoleTable.role, u.role),
                ),
              ),
          ),
        );
      }
      console.log(
        `✅ Merged new resources into ${updates.length} existing default role(s).`,
      );
    }
  } catch (error) {
    console.error("❌ Failed to seed default workspace roles:", error);
    throw error;
  }
}
