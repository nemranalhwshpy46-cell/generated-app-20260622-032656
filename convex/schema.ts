import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  files: defineTable({
    userId: v.id("users"),
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    description: v.optional(v.string()),
    uploadedAt: v.number(),
  })
    .index("by_userId_uploadedAt", ["userId", "uploadedAt"])
    .index("by_userId_storageId", ["userId", "storageId"]),

  projects: defineTable({
    userId: v.optional(v.id("users")),
    name: v.string(),
    type: v.string(), // "android" | "ios" | "harmonyos"
    packageName: v.string(),
    version: v.string(),
    code: v.string(),
    designerLayout: v.string(), // JSON string representing designed UI components
    compiledAt: v.optional(v.number()),
    apkUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  systemTweaks: defineTable({
    userId: v.optional(v.id("users")),
    name: v.string(),
    category: v.string(), // "kernel" | "memory" | "battery" | "cpu"
    value: v.number(), // 0 to 100
    status: v.string(), // "active" | "inactive"
    updatedAt: v.number(),
  }).index("by_category", ["category"]),

  terminalLogs: defineTable({
    command: v.string(),
    output: v.string(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),

  aiConversations: defineTable({
    userId: v.optional(v.id("users")),
    role: v.string(), // "user" | "assistant"
    content: v.string(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
