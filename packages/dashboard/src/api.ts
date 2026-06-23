import { Project, ProjectInput } from "./types";

const API_BASE = "/api/projects";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export function listProjects(): Promise<Project[]> {
  return request<Project[]>(API_BASE);
}

export function getProject(id: string): Promise<Project> {
  return request<Project>(`${API_BASE}/${id}`);
}

export function createProject(input: ProjectInput): Promise<Project> {
  return request<Project>(API_BASE, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateProject(id: string, input: Partial<ProjectInput>): Promise<Project> {
  return request<Project>(`${API_BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function regenerateKey(id: string): Promise<Project> {
  return request<Project>(`${API_BASE}/${id}/regenerate-key`, {
    method: "POST",
  });
}

export function deleteProject(id: string): Promise<Project> {
  return request<Project>(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
}
