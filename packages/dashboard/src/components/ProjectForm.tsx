import { useState, useEffect, FormEvent } from "react";
import { Project, ProjectInput } from "../types";
import * as api from "../api";

interface Props {
  projectId: string | null;
  onSave: () => void;
  onCancel: () => void;
}

const DEFAULTS: ProjectInput = {
  name: "",
  apiBase: "",
  agentName: "Chat Assistant",
  greeting: "Hi there! How can I help you?",
  primaryColor: "#2563EB",
  accentColor: "#F59E0B",
  position: "right",
  avatarUrl: "",
  chatUiUrl: "",
  poweredBy: "",
};

export default function ProjectForm({ projectId, onSave, onCancel }: Props) {
  const [form, setForm] = useState<ProjectInput>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!projectId);
  const isEditing = !!projectId;

  useEffect(() => {
    if (!projectId) return;
    api.getProject(projectId)
      .then((p: Project) => {
        setForm({
          name: p.name,
          apiBase: p.apiBase,
          agentName: p.agentName,
          greeting: p.greeting,
          primaryColor: p.primaryColor,
          accentColor: p.accentColor,
          position: p.position,
          avatarUrl: p.avatarUrl,
          chatUiUrl: p.chatUiUrl,
          poweredBy: p.poweredBy,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  function set<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.apiBase) return;
    setSaving(true);
    try {
      if (isEditing) {
        await api.updateProject(projectId!, form);
      } else {
        await api.createProject(form);
      }
      onSave();
    } catch (err) {
      alert("Failed to save: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="state-msg">Loading...</p>;

  return (
    <section>
      <div className="section-header">
        <h2>{isEditing ? "Edit Project" : "New Project"}</h2>
        <button className="btn-ghost" onClick={onCancel}>Back</button>
      </div>

      <form className="config-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Project Name</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="My Website" />
        </div>

        <div className="form-group">
          <label>API Base URL <span className="required">*</span></label>
          <input value={form.apiBase} onChange={(e) => set("apiBase", e.target.value)} placeholder="https://your-chat-backend.com" required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Agent Name</label>
            <input value={form.agentName} onChange={(e) => set("agentName", e.target.value)} placeholder="Chat Assistant" />
          </div>
          <div className="form-group">
            <label>Position</label>
            <select value={form.position} onChange={(e) => set("position", e.target.value as "left" | "right")}>
              <option value="right">Right</option>
              <option value="left">Left</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Greeting Message</label>
          <textarea value={form.greeting} onChange={(e) => set("greeting", e.target.value)} rows={2} placeholder="Hi there! How can I help you?" />
        </div>

        <div className="form-group">
          <label>Avatar URL (optional)</label>
          <div className="avatar-input">
            <input value={form.avatarUrl} onChange={(e) => set("avatarUrl", e.target.value)} placeholder="https://example.com/avatar.png" />
            {form.avatarUrl && <img src={form.avatarUrl} alt="" className="avatar-preview" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Primary Color</label>
            <div className="color-input">
              <input type="color" value={form.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} />
              <input type="text" value={form.primaryColor} onChange={(e) => {
                if (/^#[0-9a-f]{6}$/i.test(e.target.value)) set("primaryColor", e.target.value);
              }} maxLength={7} />
            </div>
          </div>
          <div className="form-group">
            <label>Accent Color</label>
            <div className="color-input">
              <input type="color" value={form.accentColor} onChange={(e) => set("accentColor", e.target.value)} />
              <input type="text" value={form.accentColor} onChange={(e) => {
                if (/^#[0-9a-f]{6}$/i.test(e.target.value)) set("accentColor", e.target.value);
              }} maxLength={7} />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Chat UI URL (optional)</label>
          <input value={form.chatUiUrl} onChange={(e) => set("chatUiUrl", e.target.value)} placeholder="Leave empty to use default" />
        </div>

        <div className="form-group">
          <label>Powered By Text</label>
          <input value={form.poweredBy} onChange={(e) => set("poweredBy", e.target.value)} placeholder="Widget Platform" />
        </div>

        <div className="form-actions">
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button className="btn-ghost" type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </section>
  );
}
