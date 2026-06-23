interface WidgetConfig {
  apiBase?: string;
  agentName?: string;
  greeting?: string;
  primaryColor?: string;
  accentColor?: string;
  position?: "left" | "right";
  avatarUrl?: string;
  serverBase?: string;
  chatUiUrl?: string;
  poweredBy?: string;
}

(function () {
  "use strict";

  if ((window as any).__WidgetLoaded) return;
  (window as any).__WidgetLoaded = true;

  // ── Find own script tag and extract info ──
  let scriptOrigin = "";
  let siteKey: string | null = null;

  const scripts = document.getElementsByTagName("script");
  for (let i = 0; i < scripts.length; i++) {
    const src = scripts[i].src;
    if (!src) continue;
    const keyMatch = src.match(/[?&]siteKey=([^&]+)/);
    if (keyMatch) {
      siteKey = decodeURIComponent(keyMatch[1]);
      const url = new URL(src);
      scriptOrigin = url.origin;
    }
  }

  const inlineCfg: WidgetConfig = (window as any).WidgetConfig || {};
  if (!scriptOrigin) scriptOrigin = window.location.origin;

  function initWidget(cfg: WidgetConfig): void {
    const API_BASE      = cfg.apiBase      || "";
    const AGENT_NAME    = cfg.agentName    || "Chat Assistant";
    const GREETING      = cfg.greeting     || "Hi there! How can I help you?";
    const PRIMARY_COLOR = cfg.primaryColor || "#2563EB";
    const ACCENT_COLOR  = cfg.accentColor  || "#F59E0B";
    const POSITION      = cfg.position === "left" ? "left" : "right";
    const AVATAR_URL    = cfg.avatarUrl    || "";
    const POWERED_BY    = cfg.poweredBy    || "";
    const SERVER_BASE   = cfg.serverBase   || (API_BASE || "");
    const CHAT_UI_URL   = cfg.chatUiUrl    || (SERVER_BASE + "/chat-ui/");
    const SESSION_ID    = "sess_" + Math.random().toString(36).slice(2, 10);

    // ── Inject styles ──
    const style = document.createElement("style");
    style.textContent = [
      `@keyframes cwBtnPulse{0%{box-shadow:0 4px 16px rgba(0,0,0,0.2)}50%{box-shadow:0 4px 24px ${PRIMARY_COLOR}66}100%{box-shadow:0 4px 16px rgba(0,0,0,0.2)}}`,
      `@keyframes cwFrameIn{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}`,
      `#cw-btn{position:fixed;bottom:24px;${POSITION}:24px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,${PRIMARY_COLOR},${PRIMARY_COLOR}dd);border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;z-index:99998;transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.2s ease;outline:none;}`,
      `#cw-btn:hover{transform:scale(1.1);box-shadow:0 6px 24px rgba(0,0,0,0.28);}`,
      `#cw-btn:active{transform:scale(0.93);}`,
      `#cw-btn svg{width:26px;height:26px;transition:opacity 0.25s,transform 0.25s;}`,
      `#cw-btn .cw-icon-chat{position:absolute;}`,
      `#cw-btn .cw-icon-close{position:absolute;opacity:0;transform:rotate(-90deg);}`,
      `#cw-btn.open .cw-icon-chat{opacity:0;transform:rotate(90deg);}`,
      `#cw-btn.open .cw-icon-close{opacity:1;transform:rotate(0deg);}`,
      `#cw-badge{position:absolute;top:-3px;right:-3px;width:20px;height:20px;border-radius:50%;background:${ACCENT_COLOR};color:#fff;font-size:11px;font-weight:700;font-family:sans-serif;display:flex;align-items:center;justify-content:center;border:2px solid #fff;opacity:0;transform:scale(0);transition:opacity 0.25s,transform 0.25s cubic-bezier(0.34,1.56,0.64,1);}`,
      `#cw-badge.visible{opacity:1;transform:scale(1);}`,
      `#cw-frame-wrap{position:fixed;bottom:92px;${POSITION}:24px;width:380px;height:580px;max-height:calc(100vh - 110px);border-radius:16px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,0.2);z-index:99999;opacity:0;transform:translateY(20px) scale(0.95);pointer-events:none;transition:opacity 0.25s ease,transform 0.25s cubic-bezier(0.34,1.56,0.64,1);border:1px solid rgba(0,0,0,0.08);}`,
      `#cw-frame-wrap.open{opacity:1;transform:translateY(0) scale(1);pointer-events:all;animation:cwFrameIn 0.3s cubic-bezier(0.34,1.56,0.64,1);}`,
      `#cw-frame{width:100%;height:100%;border:none;display:block;border-radius:0;background:#f5f7fb;}`,
      `@media(max-width:440px){#cw-frame-wrap{width:100vw;height:100vh;max-height:100vh;bottom:0;${POSITION}:0;border-radius:0;transform:translateY(0);}#cw-btn{bottom:16px;${POSITION}:16px;}}`,
    ].join("");
    document.head.appendChild(style);

    // ── Bubble button ──
    const btn = document.createElement("button");
    btn.id = "cw-btn";
    btn.setAttribute("aria-label", "Open chat");

    const avatarHtml = AVATAR_URL
      ? '<img src="' + AVATAR_URL + '" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;position:absolute;top:0;left:0;" onerror="this.style.display=\'none\'">'
      : '';

    btn.innerHTML = [
      '<span class="cw-icon-chat" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">',
      avatarHtml,
      '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:26px;height:26px;' + (AVATAR_URL ? 'display:none' : '') + '">',
      '  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
      '</svg>',
      '</span>',
      '<svg class="cw-icon-close" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">',
      '  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
      '</svg>',
      '<span id="cw-badge">1</span>',
    ].join("");
    document.body.appendChild(btn);

    // ── Iframe ──
    const frameWrap = document.createElement("div");
    frameWrap.id = "cw-frame-wrap";
    const iframe = document.createElement("iframe");
    iframe.id = "cw-frame";
    iframe.title = AGENT_NAME;
    iframe.setAttribute("allow", "microphone");
    frameWrap.appendChild(iframe);
    document.body.appendChild(frameWrap);

    // ── State ──
    let isOpen = false;
    let iframeLoaded = false;

    function buildIframeSrc(): string {
      const p = new URLSearchParams({
        apiBase: API_BASE,
        serverBase: SERVER_BASE,
        sessionId: SESSION_ID,
        agentName: AGENT_NAME,
        greeting: GREETING,
        primaryColor: PRIMARY_COLOR,
        accentColor: ACCENT_COLOR,
        avatarUrl: AVATAR_URL,
        poweredBy: POWERED_BY,
      });
      return CHAT_UI_URL + "?" + p.toString();
    }

    function open() {
      isOpen = true;
      btn.classList.add("open");
      btn.setAttribute("aria-label", "Close chat");
      frameWrap.classList.add("open");
      hideBadge();

      if (!iframeLoaded) {
        iframe.src = buildIframeSrc();
        iframe.onload = () => {
          iframeLoaded = true;
          iframe.contentWindow?.postMessage({
            type: "CW_INIT",
            config: { apiBase: API_BASE, serverBase: SERVER_BASE, sessionId: SESSION_ID, agentName: AGENT_NAME, greeting: GREETING, primaryColor: PRIMARY_COLOR, accentColor: ACCENT_COLOR, avatarUrl: AVATAR_URL, poweredBy: POWERED_BY },
          }, "*");
        };
      }
    }

    function close() {
      isOpen = false;
      btn.classList.remove("open");
      btn.setAttribute("aria-label", "Open chat");
      frameWrap.classList.remove("open");
    }

    function showBadge() { const el = document.getElementById("cw-badge"); if (el) el.classList.add("visible"); }
    function hideBadge() { const el = document.getElementById("cw-badge"); if (el) el.classList.remove("visible"); }

    btn.addEventListener("click", () => isOpen ? close() : open());

    window.addEventListener("message", (e: MessageEvent) => {
      if (e.data?.type === "CW_CLOSE") close();
    });

    setTimeout(() => { if (!isOpen) showBadge(); }, 3000);
  }

  // ── Bootstrap ──
  if (siteKey) {
    const serverBase = inlineCfg.serverBase || scriptOrigin;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", serverBase + "/api/projects/by-site/" + encodeURIComponent(siteKey), true);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const serverConfig: WidgetConfig = JSON.parse(xhr.responseText);
          const merged: WidgetConfig = { ...serverConfig, ...inlineCfg, serverBase };
          initWidget(merged);
        } catch {
          initWidget(inlineCfg);
        }
      } else {
        initWidget(inlineCfg);
      }
    };
    xhr.onerror = () => initWidget(inlineCfg);
    xhr.send();
  } else {
    initWidget({ ...inlineCfg, serverBase: inlineCfg.serverBase || scriptOrigin });
  }
})();
