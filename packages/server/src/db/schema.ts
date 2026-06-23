import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  siteKey: text("site_key").notNull().unique(),
  name: text("name").notNull().default("My Project"),
  apiBase: text("api_base").notNull(),
  agentName: text("agent_name").notNull().default("Chat Assistant"),
  greeting: text("greeting").notNull().default("Hi there! How can I help you?"),
  primaryColor: text("primary_color").notNull().default("#2563EB"),
  accentColor: text("accent_color").notNull().default("#F59E0B"),
  position: text("position").notNull().default("right"),
  avatarUrl: text("avatar_url").notNull().default(""),
  chatUiUrl: text("chat_ui_url").notNull().default(""),
  poweredBy: text("powered_by").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
