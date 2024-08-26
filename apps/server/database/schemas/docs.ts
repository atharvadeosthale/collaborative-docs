import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const docsTable = pgTable("docs", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  title: text("title"),
  content: text("content"),
});

export type Doc = typeof docsTable.$inferSelect;
