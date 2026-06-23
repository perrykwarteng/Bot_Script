CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"site_key" text NOT NULL,
	"name" text DEFAULT 'My Project' NOT NULL,
	"api_base" text NOT NULL,
	"agent_name" text DEFAULT 'Chat Assistant' NOT NULL,
	"greeting" text DEFAULT 'Hi there! How can I help you?' NOT NULL,
	"primary_color" text DEFAULT '#2563EB' NOT NULL,
	"accent_color" text DEFAULT '#F59E0B' NOT NULL,
	"position" text DEFAULT 'right' NOT NULL,
	"avatar_url" text DEFAULT '' NOT NULL,
	"chat_ui_url" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_site_key_unique" UNIQUE("site_key")
);
