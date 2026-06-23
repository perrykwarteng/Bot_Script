import { useState, useRef, useEffect, useCallback } from "react";

interface Config {
  apiBase: string;
  sessionId: string;
  agentName: string;
  greeting: string;
  primaryColor: string;
  accentColor: string;
  avatarUrl: string;
  poweredBy: string;
}

interface Message {
  role: "user" | "bot";
  text: string;
  time: string;
}

function getParam(key: string): string {
  return new URLSearchParams(location.search).get(key) || "";
}

const COLORS = {
  primary: getParam("primaryColor") || "#2563EB",
  accent: getParam("accentColor") || "#F59E0B",
};

(function injectStyles() {
  const s = document.createElement("style");
  s.textContent = `
    @keyframes cwBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
    @keyframes cwFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes cwPulse{0%,100%{opacity:1}50%{opacity:0.4}}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,sans-serif;background:#f5f7fb;overflow:hidden}
  `;
  document.head.appendChild(s);
})();

export default function App() {
  const [config, setConfig] = useState<Config>({
    apiBase: getParam("apiBase"),
    sessionId: getParam("sessionId") || "anon_" + Math.random().toString(36).slice(2, 10),
    agentName: getParam("agentName") || "Chat Assistant",
    greeting: getParam("greeting") || "Hi there! How can I help you?",
    primaryColor: COLORS.primary,
    accentColor: COLORS.accent,
    avatarUrl: getParam("avatarUrl"),
    poweredBy: getParam("poweredBy"),
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const msgsEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function handler(e: MessageEvent) {
      if (e.data?.type === "CW_INIT" && e.data.config) {
        setConfig((prev) => ({ ...prev, ...e.data.config }));
      }
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    setMessages([{
      role: "bot",
      text: config.greeting,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
  }, [config.greeting]);

  useEffect(() => {
    msgsEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text, time: now() }]);
    setLoading(true);

    try {
      const res = await fetch(config.apiBase + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: config.sessionId }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const reply = data.reply || data.message || data.text || "Got it!";
      setMessages((prev) => [...prev, { role: "bot", text: reply, time: now() }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Sorry, could not reach the server.", time: now() }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, config]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function close() {
    window.parent.postMessage({ type: "CW_CLOSE" }, "*");
  }

  const primary = config.primaryColor;
  const accent = config.accentColor;

  return (
    <div style={containerStyle}>
      {/* ── Header ── */}
      <header style={{ ...headerStyle, background: `linear-gradient(135deg, ${primary} 0%, ${adjustColor(primary, -20)} 100%)` }}>
        <div style={headerGlow} />
        <div style={headerContent}>
          {config.avatarUrl ? (
            <img src={config.avatarUrl} alt="" style={avatarImgStyle} onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
          ) : (
            <div style={{ ...avatarLetterStyle, background: "rgba(255,255,255,0.2)" }}>{config.agentName.charAt(0).toUpperCase()}</div>
          )}
          <div style={headerInfoStyle}>
            <div style={agentNameStyle}>{config.agentName}</div>
            <div style={statusStyle}>
              <span style={{ ...statusDot, background: "#4ade80" }} />
              Online
            </div>
          </div>
          <button onClick={close} style={closeBtnStyle} aria-label="Close">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="rgba(255,255,255,0.8)" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Messages ── */}
      <div style={messagesContainer}>
        {messages.map((m, i) => (
          <div key={i} style={{ ...msgWrapperStyle, alignSelf: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={m.role === "user"
              ? { ...userBubbleStyle, background: primary }
              : botBubbleStyle}>
              <div style={msgTextStyle}>{m.text}</div>
            </div>
            <div style={{ ...timeStyle, textAlign: m.role === "user" ? "right" : "left" }}>{m.time}</div>
          </div>
        ))}
        {loading && (
          <div style={typingWrapperStyle}>
            <div style={typingBubbleStyle}>
              <span style={dotStyle} />
              <span style={{ ...dotStyle, animationDelay: "0.2s" }} />
              <span style={{ ...dotStyle, animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
        <div ref={msgsEnd} />
      </div>

      {/* ── Powered by ── */}
      {config.poweredBy && (
        <div style={poweredByStyle}>
          Powered by <span style={{ color: primary }}>{config.poweredBy}</span>
        </div>
      )}

      {/* ── Input Area ── */}
      <div style={inputAreaStyle}>
        <div style={{ ...inputWrapStyle, borderColor: primary }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your message..."
            rows={1}
            style={textareaStyle}
          />
          <button onClick={send} disabled={loading || !input.trim()} style={{ ...sendBtnStyle, background: primary, opacity: loading || !input.trim() ? 0.5 : 1 }} aria-label="Send">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `rgb(${r},${g},${b})`;
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Styles ──

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  background: "#f5f7fb",
};

const headerStyle: React.CSSProperties = {
  position: "relative",
  flexShrink: 0,
  padding: "16px 16px 20px",
  overflow: "hidden",
};

const headerGlow: React.CSSProperties = {
  position: "absolute",
  top: "-40px",
  right: "-40px",
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.1)",
};

const headerContent: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const avatarImgStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid rgba(255,255,255,0.3)",
  flexShrink: 0,
};

const avatarLetterStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontWeight: 700,
  fontSize: 18,
  flexShrink: 0,
  border: "2px solid rgba(255,255,255,0.3)",
};

const headerInfoStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const agentNameStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#fff",
  letterSpacing: "-0.01em",
};

const statusStyle: React.CSSProperties = {
  fontSize: 11,
  color: "rgba(255,255,255,0.75)",
  display: "flex",
  alignItems: "center",
  gap: 5,
  marginTop: 2,
};

const statusDot: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  display: "inline-block",
};

const closeBtnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.15)",
  border: "none",
  cursor: "pointer",
  width: 32,
  height: 32,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "background 0.15s",
};

const messagesContainer: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "12px 14px",
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const msgWrapperStyle: React.CSSProperties = {
  maxWidth: "82%",
  animation: "cwFadeIn 0.2s ease",
};

const userBubbleStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "16px 16px 4px 16px",
  color: "#fff",
  fontSize: 14,
  lineHeight: 1.45,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
};

const botBubbleStyle: React.CSSProperties = {
  background: "#fff",
  padding: "10px 14px",
  borderRadius: "16px 16px 16px 4px",
  fontSize: 14,
  lineHeight: 1.45,
  color: "#1a1a2e",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const msgTextStyle: React.CSSProperties = {
  wordWrap: "break-word",
  whiteSpace: "pre-wrap",
};

const timeStyle: React.CSSProperties = {
  fontSize: 10,
  color: "#999",
  marginTop: 3,
  padding: "0 4px",
};

const typingWrapperStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  animation: "cwFadeIn 0.2s ease",
};

const typingBubbleStyle: React.CSSProperties = {
  display: "flex",
  gap: 5,
  padding: "14px 18px",
  background: "#fff",
  borderRadius: "16px 16px 16px 4px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const dotStyle: React.CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: "#bbb",
  animation: "cwBounce 1.4s infinite ease-in-out",
};

const poweredByStyle: React.CSSProperties = {
  textAlign: "center",
  fontSize: 10,
  color: "#aaa",
  padding: "4px 0 2px",
  letterSpacing: "0.02em",
  flexShrink: 0,
};

const inputAreaStyle: React.CSSProperties = {
  flexShrink: 0,
  padding: "8px 12px 10px",
  background: "#fff",
  borderTop: "1px solid #e8ecf0",
};

const inputWrapStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  gap: 8,
  border: "1.5px solid #ddd",
  borderRadius: 22,
  padding: "4px 4px 4px 14px",
  transition: "border-color 0.15s",
  background: "#f8f9fb",
};

const textareaStyle: React.CSSProperties = {
  flex: 1,
  resize: "none",
  border: "none",
  padding: "7px 0",
  fontSize: 13.5,
  fontFamily: "inherit",
  lineHeight: 1.35,
  outline: "none",
  background: "transparent",
  maxHeight: 80,
};

const sendBtnStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "opacity 0.15s",
};
