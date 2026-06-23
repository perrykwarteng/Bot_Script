import { db, schema } from "./db";
import { Project, ProjectInput } from "./types";
import { eq } from "drizzle-orm";

function genId(): string {
  return crypto.randomUUID();
}

function genSiteKey(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export async function listProjects(): Promise<Project[]> {
  const rows = await db
    .select()
    .from(schema.projects)
    .orderBy(schema.projects.createdAt);
  return rows.map(mapRow);
}

export async function getProject(id: string): Promise<Project | undefined> {
  const rows = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, id))
    .limit(1);
  return rows.length ? mapRow(rows[0]) : undefined;
}

export async function getProjectBySiteKey(
  siteKey: string
): Promise<Project | undefined> {
  const rows = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.siteKey, siteKey))
    .limit(1);
  return rows.length ? mapRow(rows[0]) : undefined;
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const now = new Date();
  const [row] = await db
    .insert(schema.projects)
    .values({
      id: genId(),
      siteKey: genSiteKey(),
      name: input.name || "My Project",
      apiBase: input.apiBase,
      agentName: input.agentName || "Chat Assistant",
      greeting: input.greeting || "Hi there! How can I help you?",
      primaryColor: input.primaryColor || "#2563EB",
      accentColor: input.accentColor || "#F59E0B",
      position: input.position || "right",
      avatarUrl: input.avatarUrl || "",
      chatUiUrl: input.chatUiUrl || "",
      poweredBy: input.poweredBy || "",
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return mapRow(row);
}

export async function updateProject(
  id: string,
  input: ProjectInput
): Promise<Project | undefined> {
  const [row] = await db
    .update(schema.projects)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(schema.projects.id, id))
    .returning();
  return row ? mapRow(row) : undefined;
}

export async function regenerateSiteKey(
  id: string
): Promise<Project | undefined> {
  const [row] = await db
    .update(schema.projects)
    .set({ siteKey: genSiteKey(), updatedAt: new Date() })
    .where(eq(schema.projects.id, id))
    .returning();
  return row ? mapRow(row) : undefined;
}

export async function deleteProject(
  id: string
): Promise<Project | undefined> {
  const [row] = await db
    .delete(schema.projects)
    .where(eq(schema.projects.id, id))
    .returning();
  return row ? mapRow(row) : undefined;
}

function mapRow(row: any): Project {
  return {
    ...row,
    createdAt:
      typeof row.createdAt === "string"
        ? row.createdAt
        : row.createdAt?.toISOString?.() || row.createdAt,
    updatedAt:
      typeof row.updatedAt === "string"
        ? row.updatedAt
        : row.updatedAt?.toISOString?.() || row.updatedAt,
  };
}
