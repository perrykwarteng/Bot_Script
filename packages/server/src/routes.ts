import { Router, Request, Response } from "express";
import {
  listProjects,
  getProject,
  getProjectBySiteKey,
  createProject,
  updateProject,
  regenerateSiteKey,
  deleteProject,
} from "./store";
import { WidgetConfig } from "./types";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const projects = await listProjects();
  res.json(projects);
});

router.get("/:id", async (req: Request, res: Response) => {
  const project = await getProject(req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(project);
});

router.get("/by-site/:siteKey", async (req: Request, res: Response) => {
  const project = await getProjectBySiteKey(req.params.siteKey);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const config: WidgetConfig = {
    apiBase: project.apiBase,
    agentName: project.agentName,
    greeting: project.greeting,
    primaryColor: project.primaryColor,
    accentColor: project.accentColor,
    position: project.position as "left" | "right",
    avatarUrl: project.avatarUrl,
    chatUiUrl: project.chatUiUrl,
    poweredBy: project.poweredBy,
  };
  res.json(config);
});

router.post("/", async (req: Request, res: Response) => {
  const { apiBase } = req.body;
  if (!apiBase) {
    res.status(400).json({ error: "apiBase is required" });
    return;
  }
  const project = await createProject(req.body);
  res.status(201).json(project);
});

router.put("/:id", async (req: Request, res: Response) => {
  const project = await updateProject(req.params.id, req.body);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(project);
});

router.post("/:id/regenerate-key", async (req: Request, res: Response) => {
  const project = await regenerateSiteKey(req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(project);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const project = await deleteProject(req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(project);
});

export default router;
