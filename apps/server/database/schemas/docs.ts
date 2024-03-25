import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const userTable = pgTable("docs", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  title: text("title"),
  content: text("content"),
});

export type User = typeof userTable.$inferSelect;
