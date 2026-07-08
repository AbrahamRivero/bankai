import { relations } from "drizzle-orm";
import {
  accountTable,
  activityTable,
  apikeyTable,
  assetTable,
  columnTable,
  commentTable,
  currencyCacheTable,
  externalLinkTable,
  githubIntegrationTable,
  integrationTable,
  invitationTable,
  labelTable,
  notificationTable,
  orderItemTable,
  orderTable,
  productFavoriteTable,
  productImageTable,
  productRelatedTable,
  productTable,
  projectTable,
  promotionProductTable,
  promotionTable,
  reviewTable,
  sessionTable,
  taskRelationTable,
  taskReminderSentTable,
  taskTable,
  teamMemberTable,
  teamTable,
  timeEntryTable,
  userNotificationPreferenceTable,
  userNotificationWorkspaceProjectTable,
  userNotificationWorkspaceRuleTable,
  userTable,
  verificationTable,
  workflowRuleTable,
  workspaceRoleTable,
  workspaceTable,
  workspaceUserTable,
} from "./schema";

export const userTableRelations = relations(userTable, ({ many, one }) => ({
  sessions: many(sessionTable),
  accounts: many(accountTable),
  teamMembers: many(teamMemberTable),
  workspaces: many(workspaceTable),
  workspaceMemberships: many(workspaceUserTable),
  assignedTasks: many(taskTable),
  timeEntries: many(timeEntryTable),
  activities: many(activityTable),
  comments: many(commentTable),
  assets: many(assetTable),
  notifications: many(notificationTable),
  notificationPreference: one(userNotificationPreferenceTable),
  notificationWorkspaceRules: many(userNotificationWorkspaceRuleTable),
  sentInvitations: many(invitationTable),
  apikeys: many(apikeyTable),
  products: many(productTable),
  reviews: many(reviewTable),
  orders: many(orderTable),
  productFavorites: many(productFavoriteTable),
}));

export const sessionTableRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}));

export const accountTableRelations = relations(accountTable, ({ one }) => ({
  user: one(userTable, {
    fields: [accountTable.userId],
    references: [userTable.id],
  }),
}));

export const verificationTableRelations = relations(
  verificationTable,
  () => ({}),
);

export const workspaceTableRelations = relations(
  workspaceTable,
  ({ many }) => ({
    teams: many(teamTable),
    members: many(workspaceUserTable),
    projects: many(projectTable),
    assets: many(assetTable),
    invitations: many(invitationTable),
    notificationWorkspaceRules: many(userNotificationWorkspaceRuleTable),
  }),
);

export const workspaceUserTableRelations = relations(
  workspaceUserTable,
  ({ one }) => ({
    workspace: one(workspaceTable, {
      fields: [workspaceUserTable.workspaceId],
      references: [workspaceTable.id],
    }),
    user: one(userTable, {
      fields: [workspaceUserTable.userId],
      references: [userTable.id],
    }),
  }),
);

export const projectTableRelations = relations(
  projectTable,
  ({ one, many }) => ({
    workspace: one(workspaceTable, {
      fields: [projectTable.workspaceId],
      references: [workspaceTable.id],
    }),
    tasks: many(taskTable),
    assets: many(assetTable),
    columns: many(columnTable),
    workflowRules: many(workflowRuleTable),
    githubIntegration: many(githubIntegrationTable),
    integrations: many(integrationTable),
    notificationWorkspaceProjects: many(userNotificationWorkspaceProjectTable),
  }),
);

export const columnTableRelations = relations(columnTable, ({ one, many }) => ({
  project: one(projectTable, {
    fields: [columnTable.projectId],
    references: [projectTable.id],
  }),
  tasks: many(taskTable),
  workflowRules: many(workflowRuleTable),
}));

export const workflowRuleTableRelations = relations(
  workflowRuleTable,
  ({ one }) => ({
    project: one(projectTable, {
      fields: [workflowRuleTable.projectId],
      references: [projectTable.id],
    }),
    column: one(columnTable, {
      fields: [workflowRuleTable.columnId],
      references: [columnTable.id],
    }),
  }),
);

export const taskTableRelations = relations(taskTable, ({ one, many }) => ({
  project: one(projectTable, {
    fields: [taskTable.projectId],
    references: [projectTable.id],
  }),
  assignee: one(userTable, {
    fields: [taskTable.userId],
    references: [userTable.id],
  }),
  column: one(columnTable, {
    fields: [taskTable.columnId],
    references: [columnTable.id],
  }),
  timeEntries: many(timeEntryTable),
  activities: many(activityTable),
  comments: many(commentTable),
  assets: many(assetTable),
  labels: many(labelTable),
  externalLinks: many(externalLinkTable),
  sourceRelations: many(taskRelationTable, { relationName: "sourceTask" }),
  targetRelations: many(taskRelationTable, { relationName: "targetTask" }),
  remindersSent: many(taskReminderSentTable),
}));

export const timeEntryTableRelations = relations(timeEntryTable, ({ one }) => ({
  task: one(taskTable, {
    fields: [timeEntryTable.taskId],
    references: [taskTable.id],
  }),
  user: one(userTable, {
    fields: [timeEntryTable.userId],
    references: [userTable.id],
  }),
}));

export const activityTableRelations = relations(activityTable, ({ one }) => ({
  task: one(taskTable, {
    fields: [activityTable.taskId],
    references: [taskTable.id],
  }),
  user: one(userTable, {
    fields: [activityTable.userId],
    references: [userTable.id],
  }),
}));

export const assetTableRelations = relations(assetTable, ({ one }) => ({
  workspace: one(workspaceTable, {
    fields: [assetTable.workspaceId],
    references: [workspaceTable.id],
  }),
  project: one(projectTable, {
    fields: [assetTable.projectId],
    references: [projectTable.id],
  }),
  task: one(taskTable, {
    fields: [assetTable.taskId],
    references: [taskTable.id],
  }),
  activity: one(activityTable, {
    fields: [assetTable.activityId],
    references: [activityTable.id],
  }),
  creator: one(userTable, {
    fields: [assetTable.createdBy],
    references: [userTable.id],
  }),
}));

export const labelTableRelations = relations(labelTable, ({ one }) => ({
  task: one(taskTable, {
    fields: [labelTable.taskId],
    references: [taskTable.id],
  }),
}));

export const notificationTableRelations = relations(
  notificationTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [notificationTable.userId],
      references: [userTable.id],
    }),
  }),
);

export const userNotificationPreferenceTableRelations = relations(
  userNotificationPreferenceTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [userNotificationPreferenceTable.userId],
      references: [userTable.id],
    }),
  }),
);

export const userNotificationWorkspaceRuleTableRelations = relations(
  userNotificationWorkspaceRuleTable,
  ({ one, many }) => ({
    user: one(userTable, {
      fields: [userNotificationWorkspaceRuleTable.userId],
      references: [userTable.id],
    }),
    workspace: one(workspaceTable, {
      fields: [userNotificationWorkspaceRuleTable.workspaceId],
      references: [workspaceTable.id],
    }),
    selectedProjects: many(userNotificationWorkspaceProjectTable),
  }),
);

export const userNotificationWorkspaceProjectTableRelations = relations(
  userNotificationWorkspaceProjectTable,
  ({ one }) => ({
    workspaceRule: one(userNotificationWorkspaceRuleTable, {
      fields: [
        userNotificationWorkspaceProjectTable.workspaceId,
        userNotificationWorkspaceProjectTable.workspaceRuleId,
      ],
      references: [
        userNotificationWorkspaceRuleTable.workspaceId,
        userNotificationWorkspaceRuleTable.id,
      ],
    }),
    project: one(projectTable, {
      fields: [
        userNotificationWorkspaceProjectTable.workspaceId,
        userNotificationWorkspaceProjectTable.projectId,
      ],
      references: [projectTable.workspaceId, projectTable.id],
    }),
  }),
);

export const githubIntegrationTableRelations = relations(
  githubIntegrationTable,
  ({ one }) => ({
    project: one(projectTable, {
      fields: [githubIntegrationTable.projectId],
      references: [projectTable.id],
    }),
  }),
);

export const teamTableRelations = relations(teamTable, ({ one, many }) => ({
  workspace: one(workspaceTable, {
    fields: [teamTable.workspaceId],
    references: [workspaceTable.id],
  }),
  teamMembers: many(teamMemberTable),
}));

export const teamMemberTableRelations = relations(
  teamMemberTable,
  ({ one }) => ({
    team: one(teamTable, {
      fields: [teamMemberTable.teamId],
      references: [teamTable.id],
    }),
    user: one(userTable, {
      fields: [teamMemberTable.userId],
      references: [userTable.id],
    }),
  }),
);

export const invitationTableRelations = relations(
  invitationTable,
  ({ one }) => ({
    workspace: one(workspaceTable, {
      fields: [invitationTable.workspaceId],
      references: [workspaceTable.id],
    }),
    inviter: one(userTable, {
      fields: [invitationTable.inviterId],
      references: [userTable.id],
    }),
  }),
);

export const workspaceRoleTableRelations = relations(
  workspaceRoleTable,
  ({ one }) => ({
    workspace: one(workspaceTable, {
      fields: [workspaceRoleTable.workspaceId],
      references: [workspaceTable.id],
    }),
  }),
);

export const apikeyTableRelations = relations(apikeyTable, ({ one }) => ({
  user: one(userTable, {
    fields: [apikeyTable.referenceId],
    references: [userTable.id],
  }),
}));

export const integrationTableRelations = relations(
  integrationTable,
  ({ one, many }) => ({
    project: one(projectTable, {
      fields: [integrationTable.projectId],
      references: [projectTable.id],
    }),
    externalLinks: many(externalLinkTable),
  }),
);

export const taskRelationTableRelations = relations(
  taskRelationTable,
  ({ one }) => ({
    sourceTask: one(taskTable, {
      fields: [taskRelationTable.sourceTaskId],
      references: [taskTable.id],
      relationName: "sourceTask",
    }),
    targetTask: one(taskTable, {
      fields: [taskRelationTable.targetTaskId],
      references: [taskTable.id],
      relationName: "targetTask",
    }),
  }),
);

export const externalLinkTableRelations = relations(
  externalLinkTable,
  ({ one }) => ({
    task: one(taskTable, {
      fields: [externalLinkTable.taskId],
      references: [taskTable.id],
    }),
    integration: one(integrationTable, {
      fields: [externalLinkTable.integrationId],
      references: [integrationTable.id],
    }),
  }),
);

export const taskReminderSentTableRelations = relations(
  taskReminderSentTable,
  ({ one }) => ({
    task: one(taskTable, {
      fields: [taskReminderSentTable.taskId],
      references: [taskTable.id],
    }),
  }),
);

export const commentTableRelations = relations(commentTable, ({ one }) => ({
  task: one(taskTable, {
    fields: [commentTable.taskId],
    references: [taskTable.id],
  }),
  user: one(userTable, {
    fields: [commentTable.userId],
    references: [userTable.id],
  }),
}));

// ─── Store / E-commerce Relations ─────────────────────────────────────────

export const productTableRelations = relations(
  productTable,
  ({ one, many }) => ({
    user: one(userTable, {
      fields: [productTable.userId],
      references: [userTable.id],
    }),
    images: many(productImageTable),
    reviews: many(reviewTable),
    favorites: many(productFavoriteTable),
    relatedTo: many(productRelatedTable, { relationName: "sourceProduct" }),
    relatedFrom: many(productRelatedTable, {
      relationName: "targetProduct",
    }),
    orderItems: many(orderItemTable),
    promotions: many(promotionProductTable),
  }),
);

export const productImageTableRelations = relations(
  productImageTable,
  ({ one }) => ({
    product: one(productTable, {
      fields: [productImageTable.productId],
      references: [productTable.id],
    }),
  }),
);

export const productFavoriteTableRelations = relations(
  productFavoriteTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [productFavoriteTable.userId],
      references: [userTable.id],
    }),
    product: one(productTable, {
      fields: [productFavoriteTable.productId],
      references: [productTable.id],
    }),
  }),
);

export const productRelatedTableRelations = relations(
  productRelatedTable,
  ({ one }) => ({
    sourceProduct: one(productTable, {
      fields: [productRelatedTable.productId],
      references: [productTable.id],
      relationName: "sourceProduct",
    }),
    targetProduct: one(productTable, {
      fields: [productRelatedTable.relatedProductId],
      references: [productTable.id],
      relationName: "targetProduct",
    }),
  }),
);

export const reviewTableRelations = relations(reviewTable, ({ one }) => ({
  user: one(userTable, {
    fields: [reviewTable.userId],
    references: [userTable.id],
  }),
  product: one(productTable, {
    fields: [reviewTable.productId],
    references: [productTable.id],
  }),
}));

export const orderTableRelations = relations(orderTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [orderTable.userId],
    references: [userTable.id],
  }),
  orderItems: many(orderItemTable),
  promotion: one(promotionTable, {
    fields: [orderTable.promotionId],
    references: [promotionTable.id],
  }),
}));

export const promotionTableRelations = relations(
  promotionTable,
  ({ many }) => ({
    products: many(promotionProductTable),
    orders: many(orderTable),
  }),
);

export const orderItemTableRelations = relations(orderItemTable, ({ one }) => ({
  order: one(orderTable, {
    fields: [orderItemTable.orderId],
    references: [orderTable.id],
  }),
  product: one(productTable, {
    fields: [orderItemTable.productId],
    references: [productTable.id],
  }),
}));

export const promotionProductTableRelations = relations(
  promotionProductTable,
  ({ one }) => ({
    promotion: one(promotionTable, {
      fields: [promotionProductTable.promotionId],
      references: [promotionTable.id],
    }),
    product: one(productTable, {
      fields: [promotionProductTable.productId],
      references: [productTable.id],
    }),
  }),
);

export const currencyCacheTableRelations = relations(
  currencyCacheTable,
  () => ({}),
);
