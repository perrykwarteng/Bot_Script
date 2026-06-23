export interface Project {
  id: string;
  siteKey: string;
  name: string;
  apiBase: string;
  agentName: string;
  greeting: string;
  primaryColor: string;
  accentColor: string;
  position: "left" | "right";
  avatarUrl: string;
  chatUiUrl: string;
  poweredBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInput {
  name?: string;
  apiBase: string;
  agentName?: string;
  greeting?: string;
  primaryColor?: string;
  accentColor?: string;
  position?: "left" | "right";
  avatarUrl?: string;
  chatUiUrl?: string;
  poweredBy?: string;
}

export interface WidgetConfig {
  apiBase: string;
  agentName: string;
  greeting: string;
  primaryColor: string;
  accentColor: string;
  position: "left" | "right";
  avatarUrl: string;
  chatUiUrl: string;
  poweredBy: string;
}
