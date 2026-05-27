/* ==========================================================================
   TEMPORIZADOR DE DESCANSO ENTRE SERIES — timer.js
   Agrega este archivo al repo y referencialo en index.html con:
   <script src="timer.js"></script>  (DESPUÉS de app.js)
   ========================================================================== */

(function () {
  // ── Configuración ────────────────────────────────────────────────────────
  const PRESETS = [
    { label: "30s",  seconds: 30  },
    { label: "60s",  seconds: 60  },
    { label: "90s",  seconds: 90  },
    { label: "2m",   seconds: 120 },
    { label: "3m",   seconds: 180 },
  ];
  const DEFAULT_PRESET = 1; // índice → 60s por defecto
  const STORAGE_KEY    = "fitness_timer_preset";

  // ── Estado ───────────────────────────────────────────────────────────────
  let intervalId   = null;
  let totalSeconds = PRESETS[DEFAULT_PRESET].seconds;
  let remaining    = totalSeconds;
  let running      = false;
  let savedPreset  = parseInt(localStorage.getItem(STORAGE_KEY) ?? DEFAULT_PRESET);
  if (isNaN(savedPreset) || savedPreset < 0 || savedPreset >= PRESETS.length) {
    savedPreset = DEFAULT_PRESET;
  }
  totalSeconds = PRESETS[savedPreset].seconds;
  remaining    = totalSeconds;

  // ── AudioContext para beep ───────────────────────────────────────────────
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }
  function playBeep(freq = 880, duration = 0.12, type = "sine") {
    try {
      const ctx  = getAudioCtx();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type      = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  }
  function playFinishSound() {
    // Tres beeps ascendentes
    playBeep(660, 0.1);
    setTimeout(() => playBeep(880, 0.1), 130);
    setTimeout(() => playBeep(1100, 0.2), 260);
  }
  function vibrateDevice(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  // ── Construir HTML del panel ──────────────────────────────────────────────
  function buildHTML() {
    return `
    <div id="rest-timer-fab" title="Temporizador de descanso" aria-label="Abrir temporizador de descanso">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <span id="fab-countdown"></span>
    </div>

    <div id="rest-timer-panel" role="dialog" aria-modal="true" aria-label="Temporizador de descanso">
      <div id="rest-timer-backdrop"></div>
      <div id="rest-timer-card">

        <div id="rtp-header">
          <span id="rtp-title">Descanso</span>
          <button id="rtp-close" aria-label="Cerrar">&times;</button>
        </div>

        <!-- SVG ring -->
        <div id="rtp-ring-wrap">
          <svg id="rtp-svg" viewBox="0 0 120 120">
            <circle class="rtp-track" cx="60" cy="60" r="52"/>
            <circle id="rtp-arc"  cx="60" cy="60" r="52"/>
          </svg>
          <div id="rtp-time-display">
            <span id="rtp-mm">01</span><span class="rtp-colon">:</span><span id="rtp-ss">00</span>
          </div>
        </div>

        <!-- Presets -->
        <div id="rtp-presets">
          ${PRESETS.map((p, i) => `
            <button class="rtp-preset${i === savedPreset ? " active" : ""}" data-idx="${i}">${p.label}</button>
          `).join("")}
        </div>

        <!-- Controles -->
        <div id="rtp-controls">
          <button id="rtp-btn-reset" aria-label="Reiniciar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
            </svg>
          </button>
          <button id="rtp-btn-main" aria-label="Iniciar">
            <svg id="rtp-icon-play" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <svg id="rtp-icon-pause" viewBox="0 0 24 24" fill="currentColor" style="display:none">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
          </button>
          <button id="rtp-btn-add30" aria-label="+30s">+30s</button>
        </div>

        <!-- Mensaje de fin -->
        <div id="rtp-finish-msg" style="display:none">
          🎯 ¡A la siguiente serie!
        </div>

      </div>
    </div>`;
  }

  // ── Construir CSS ─────────────────────────────────────────────────────────
  function buildCSS() {
    return `
    /* ── FAB ── */
    #rest-timer-fab {
      position: fixed;
      bottom: 88px;
      right: 18px;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(14,165,233,.45);
      z-index: 900;
      transition: transform .15s, box-shadow .15s;
      border: none;
      padding: 0;
      gap: 1px;
      user-select: none;
    }
    #rest-timer-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(14,165,233,.6); }
    #rest-timer-fab:active { transform: scale(.96); }
    #rest-timer-fab svg { width: 22px; height: 22px; }
    #fab-countdown {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: .5px;
      line-height: 1;
      display: none;
    }
    #rest-timer-fab.fab-running svg { display: none; }
    #rest-timer-fab.fab-running #fab-countdown { display: block; }

    /* ── Backdrop + panel ── */
    #rest-timer-panel {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 1000;
      align-items: flex-end;
      justify-content: center;
    }
    #rest-timer-panel.open { display: flex; }
    #rest-timer-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,.55);
      backdrop-filter: blur(3px);
      animation: rtpFadeIn .2s ease;
    }
    #rest-timer-card {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 420px;
      background: #0f172a;
      border-radius: 24px 24px 0 0;
      padding: 24px 24px 36px;
      box-shadow: 0 -8px 40px rgba(0,0,0,.5);
      animation: rtpSlideUp .25s cubic-bezier(.22,1,.36,1);
    }

    /* ── Header ── */
    #rtp-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    #rtp-title {
      font-size: 18px;
      font-weight: 700;
      color: #f1f5f9;
      letter-spacing: .3px;
    }
    #rtp-close {
      background: rgba(255,255,255,.08);
      border: none;
      color: #94a3b8;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background .15s, color .15s;
    }
    #rtp-close:hover { background: rgba(255,255,255,.15); color: #f1f5f9; }

    /* ── Anillo SVG ── */
    #rtp-ring-wrap {
      position: relative;
      width: 160px;
      height: 160px;
      margin: 0 auto 20px;
    }
    #rtp-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    .rtp-track {
      fill: none;
      stroke: rgba(255,255,255,.08);
      stroke-width: 8;
    }
    #rtp-arc {
      fill: none;
      stroke: url(#rtp-grad);
      stroke-width: 8;
      stroke-linecap: round;
      transition: stroke-dashoffset .9s linear;
    }
    #rtp-time-display {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1px;
    }
    #rtp-mm, #rtp-ss {
      font-size: 38px;
      font-weight: 800;
      color: #f1f5f9;
      font-variant-numeric: tabular-nums;
      letter-spacing: -1px;
      line-height: 1;
    }
    .rtp-colon {
      font-size: 32px;
      font-weight: 800;
      color: #38bdf8;
      line-height: 1;
      animation: rtpBlink 1s step-start infinite;
    }

    /* ── Presets ── */
    #rtp-presets {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .rtp-preset {
      background: rgba(255,255,255,.07);
      border: 1.5px solid rgba(255,255,255,.1);
      color: #94a3b8;
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all .15s;
    }
    .rtp-preset:hover { background: rgba(255,255,255,.12); color: #f1f5f9; }
    .rtp-preset.active {
      background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
      border-color: transparent;
      color: #fff;
      box-shadow: 0 2px 10px rgba(14,165,233,.35);
    }

    /* ── Controles ── */
    #rtp-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }
    #rtp-btn-reset, #rtp-btn-add30 {
      background: rgba(255,255,255,.07);
      border: 1.5px solid rgba(255,255,255,.1);
      color: #94a3b8;
      border-radius: 50px;
      cursor: pointer;
      transition: all .15s;
      font-weight: 600;
    }
    #rtp-btn-reset {
      width: 44px; height: 44px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
    }
    #rtp-btn-reset svg { width: 18px; height: 18px; }
    #rtp-btn-reset:hover, #rtp-btn-add30:hover {
      background: rgba(255,255,255,.14); color: #f1f5f9;
    }
    #rtp-btn-add30 {
      padding: 10px 18px;
      font-size: 13px;
    }
    #rtp-btn-main {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
      border: none;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(14,165,233,.4);
      transition: transform .12s, box-shadow .12s;
    }
    #rtp-btn-main:hover { transform: scale(1.06); box-shadow: 0 6px 28px rgba(14,165,233,.55); }
    #rtp-btn-main:active { transform: scale(.94); }
    #rtp-btn-main svg { width: 24px; height: 24px; }

    /* ── Mensaje fin ── */
    #rtp-finish-msg {
      margin-top: 16px;
      text-align: center;
      font-size: 15px;
      font-weight: 600;
      color: #34d399;
      animation: rtpPop .35s cubic-bezier(.22,1,.36,1);
    }

    /* ── Botón de acceso rápido en form Registrar ── */
    #btn-open-timer {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      background: rgba(14,165,233,.1);
      border: 1.5px solid rgba(14,165,233,.25);
      border-radius: 12px;
      color: #38bdf8;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 8px;
      transition: background .15s, border-color .15s;
    }
    #btn-open-timer:hover {
      background: rgba(14,165,233,.18);
      border-color: rgba(14,165,233,.45);
    }
    #btn-open-timer svg { width: 16px; height: 16px; }

    /* ── Keyframes ── */
    @keyframes rtpFadeIn  { from { opacity: 0 } to { opacity: 1 } }
    @keyframes rtpSlideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
    @keyframes rtpBlink   { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
    @keyframes rtpPop     { from { transform: scale(.8); opacity: 0 } to { transform: scale(1); opacity: 1 } }
    @keyframes rtpPulse   {
      0%,100% { box-shadow: 0 4px 20px rgba(14,165,233,.4) }
      50%     { box-shadow: 0 4px 32px rgba(99,102,241,.7) }
    }
    #rtp-btn-main.pulsing { animation: rtpPulse 1.2s ease-in-out infinite; }
    `;
  }

  // ── Inyectar en el DOM ────────────────────────────────────────────────────
  function inject() {
    // Estilos
    const style = document.createElement("style");
    style.textContent = buildCSS();
    document.head.appendChild(style);

    // Gradiente SVG (definición)
    const svgDefs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgDefs.setAttribute("style", "position:absolute;width:0;height:0");
    svgDefs.innerHTML = `
      <defs>
        <linearGradient id="rtp-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#0ea5e9"/>
          <stop offset="100%" stop-color="#6366f1"/>
        </linearGradient>
      </defs>`;
    document.body.appendChild(svgDefs);

    // HTML del panel + FAB
    const wrapper = document.createElement("div");
    wrapper.innerHTML = buildHTML();
    document.body.appendChild(wrapper);

    // Botón de acceso rápido dentro del formulario de registro
    const workoutForm = document.getElementById("workout-form");
    if (workoutForm) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id   = "btn-open-timer";
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        Iniciar descanso`;
      workoutForm.appendChild(btn);
      btn.addEventListener("click", openPanel);
    }

    // Eventos
    bindEvents();
    updateRing();
    updateDisplay();
  }

  // ── Lógica del temporizador ───────────────────────────────────────────────
  function startTimer() {
    if (remaining <= 0) resetTimer();
    running    = true;
    intervalId = setInterval(tick, 1000);
    setMainIcon("pause");
    document.getElementById("rtp-btn-main").classList.add("pulsing");
    document.getElementById("rtp-finish-msg").style.display = "none";
    updateFAB();
  }

  function pauseTimer() {
    clearInterval(intervalId);
    running = false;
    setMainIcon("play");
    document.getElementById("rtp-btn-main").classList.remove("pulsing");
    updateFAB();
  }

  function resetTimer() {
    clearInterval(intervalId);
    running   = false;
    remaining = totalSeconds;
    setMainIcon("play");
    document.getElementById("rtp-btn-main").classList.remove("pulsing");
    document.getElementById("rtp-finish-msg").style.display = "none";
    updateDisplay();
    updateRing();
    updateFAB();
  }

  function tick() {
    remaining--;
    updateDisplay();
    updateRing();
    updateFAB();

    // Beep en los últimos 3 segundos
    if (remaining > 0 && remaining <= 3) {
      playBeep(660, 0.08);
      vibrateDevice([40]);
    }

    if (remaining <= 0) {
      clearInterval(intervalId);
      running = false;
      playFinishSound();
      vibrateDevice([80, 40, 80, 40, 160]);
      setMainIcon("play");
      document.getElementById("rtp-btn-main").classList.remove("pulsing");
      document.getElementById("rtp-finish-msg").style.display = "block";
      updateFAB();
    }
  }

  function addSeconds(s) {
    remaining = Math.min(remaining + s, 599); // máx 9:59
    totalSeconds = Math.max(totalSeconds, remaining);
    updateDisplay();
    updateRing();
    updateFAB();
  }

  function selectPreset(idx) {
    savedPreset  = idx;
    totalSeconds = PRESETS[idx].seconds;
    remaining    = totalSeconds;
    localStorage.setItem(STORAGE_KEY, idx);
    if (running) { clearInterval(intervalId); running = false; setMainIcon("play"); }
    document.getElementById("rtp-btn-main").classList.remove("pulsing");
    document.getElementById("rtp-finish-msg").style.display = "none";
    // Actualizar botones preset
    document.querySelectorAll(".rtp-preset").forEach((b, i) => {
      b.classList.toggle("active", i === idx);
    });
    updateDisplay();
    updateRing();
    updateFAB();
  }

  // ── UI helpers ───────────────────────────────────────────────────────────
  const CIRCUMFERENCE = 2 * Math.PI * 52; // r=52

  function updateDisplay() {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    const mm = document.getElementById("rtp-mm");
    const ss = document.getElementById("rtp-ss");
    if (mm) mm.textContent = String(m).padStart(2, "0");
    if (ss) ss.textContent = String(s).padStart(2, "0");
  }

  function updateRing() {
    const arc = document.getElementById("rtp-arc");
    if (!arc) return;
    const ratio  = totalSeconds > 0 ? remaining / totalSeconds : 0;
    const offset = CIRCUMFERENCE * (1 - ratio);
    arc.style.strokeDasharray  = CIRCUMFERENCE;
    arc.style.strokeDashoffset = offset;
  }

  function updateFAB() {
    const fab = document.getElementById("rest-timer-fab");
    const countdown = document.getElementById("fab-countdown");
    if (!fab || !countdown) return;
    if (running) {
      fab.classList.add("fab-running");
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      countdown.textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    } else {
      fab.classList.remove("fab-running");
    }
  }

  function setMainIcon(state) {
    const play  = document.getElementById("rtp-icon-play");
    const pause = document.getElementById("rtp-icon-pause");
    if (!play || !pause) return;
    play.style.display  = state === "play"  ? "block" : "none";
    pause.style.display = state === "pause" ? "block" : "none";
  }

  // ── Panel open/close ──────────────────────────────────────────────────────
  function openPanel() {
    document.getElementById("rest-timer-panel").classList.add("open");
    updateDisplay();
    updateRing();
  }

  function closePanel() {
    document.getElementById("rest-timer-panel").classList.remove("open");
  }

  // ── Bind eventos ─────────────────────────────────────────────────────────
  function bindEvents() {
    // FAB
    document.getElementById("rest-timer-fab").addEventListener("click", openPanel);
    // Backdrop
    document.getElementById("rest-timer-backdrop").addEventListener("click", closePanel);
    // Cerrar X
    document.getElementById("rtp-close").addEventListener("click", closePanel);
    // Play/Pause
    document.getElementById("rtp-btn-main").addEventListener("click", () => {
      running ? pauseTimer() : startTimer();
    });
    // Reset
    document.getElementById("rtp-btn-reset").addEventListener("click", resetTimer);
    // +30s
    document.getElementById("rtp-btn-add30").addEventListener("click", () => addSeconds(30));
    // Presets
    document.querySelectorAll(".rtp-preset").forEach(btn => {
      btn.addEventListener("click", () => selectPreset(parseInt(btn.dataset.idx)));
    });
    // Auto-arrancar al guardar un entrenamiento: escucha el evento submit del form
    const form = document.getElementById("workout-form");
    if (form) {
      form.addEventListener("submit", () => {
        // Pequeño delay para que el form se procese primero
        setTimeout(() => {
          resetTimer();
          openPanel();
          startTimer();
        }, 1200);
      });
    }
    // Tecla Espacio para play/pause cuando el panel está abierto
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && document.getElementById("rest-timer-panel").classList.contains("open")) {
        e.preventDefault();
        running ? pauseTimer() : startTimer();
      }
      if (e.code === "Escape") closePanel();
    });
  }

  // ── Arranque ──────────────────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }

})();
