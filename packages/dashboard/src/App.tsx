import { useState, useEffect, useCallback } from "react";
import { Project } from "./types";
import * as api from "./api";
import ProjectList from "./components/ProjectList";
import ProjectForm from "./components/ProjectForm";

type View = "list" | "form";

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(() => {
    setLoading(true);
    api.listProjects().then(setProjects).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  function handleNew() {
    setEditingId(null);
    setView("form");
  }

  function handleEdit(id: string) {
    setEditingId(id);
    setView("form");
  }

  function handleSave() {
    setView("list");
    loadProjects();
  }

  function handleCancel() {
    setView("list");
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this project? The embed code will stop working.")) return;
    api.deleteProject(id).then(loadProjects).catch(console.error);
  }

  function handleRegenerate(id: string) {
    if (!confirm("Regenerate site key? The old embed code will stop working.")) return;
    api.regenerateKey(id).then(loadProjects).catch(console.error);
  }

  return (
    <div className="app">
      <nav>
        <div className="nav-inner">
          <h1>Chat Widget Platform</h1>
          <span className="nav-sub">Manage your project widgets</span>
        </div>
      </nav>

      <main>
        {view === "list" && (
          <ProjectList
            projects={projects}
            loading={loading}
            onNew={handleNew}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRegenerate={handleRegenerate}
          />
        )}
        {view === "form" && (
          <ProjectForm
            projectId={editingId}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </main>
    </div>
  );
}
