import { Project } from "../types";

interface Props {
  projects: Project[];
  loading: boolean;
  onNew: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRegenerate: (id: string) => void;
}

export default function ProjectList({ projects, loading, onNew, onEdit, onDelete, onRegenerate }: Props) {
  return (
    <section>
      <div className="section-header">
        <h2>Projects ({projects.length})</h2>
        <button className="btn-primary" onClick={onNew}>+ New Project</button>
      </div>

      {loading && <p className="state-msg">Loading...</p>}
      {!loading && projects.length === 0 && (
        <p className="state-msg">No projects yet. Create your first one!</p>
      )}

      <div className="project-list">
        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            onEdit={() => onEdit(p.id)}
            onDelete={() => onDelete(p.id)}
            onRegenerate={() => onRegenerate(p.id)}
          />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project, onEdit, onDelete, onRegenerate }: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onRegenerate: () => void;
}) {
  const origin = window.location.origin;
  const embedCode = `<script src="${origin}/widget.js?siteKey=${project.siteKey}" async></script>`;

  async function copyEmbed() {
    try {
      await navigator.clipboard.writeText(embedCode);
    } catch {
      const el = document.createElement("textarea");
      el.value = embedCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  }

  const avatarSrc = project.avatarUrl || "";

  return (
    <div className="project-card">
      {avatarSrc ? (
        <img src={avatarSrc} alt="" className="card-avatar" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
      ) : (
        <div className="color-dot" style={{ background: project.primaryColor }} />
      )}
      <div className="project-info">
        <h3>{project.name}</h3>
        <div className="project-meta">
          Site Key: <code>{project.siteKey}</code>
          &middot; Created {new Date(project.createdAt).toLocaleDateString()}
          &middot; <a href={project.apiBase} target="_blank" rel="noreferrer">{project.apiBase}</a>
        </div>
        <div className="embed-box">
          <code className="embed-code">{embedCode}</code>
          <button className="btn-sm" onClick={copyEmbed}>Copy</button>
        </div>
      </div>
      <div className="project-actions">
        <button className="btn-sm" onClick={onEdit}>Edit</button>
        <button className="btn-sm" onClick={onRegenerate}>New Key</button>
        <button className="btn-danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
