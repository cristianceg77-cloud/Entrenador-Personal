/* ==========================================================================
   FEATURES.JS — Mi Entrenamiento v1.3.0
   Agrega al final de index.html: <script src="features.js"></script>
   (después de timer.js)

   Incluye:
   1. 🏆 Records personales + badge PR + 1RM estimado (Epley)
   2. 📋 Rutinas/plantillas guardadas
   3. 📊 Volumen semanal + estadísticas ampliadas
   ========================================================================== */

(function () {
  "use strict";

  /* ══════════════════════════════════════════════════════════════════════════
     UTILIDADES COMPARTIDAS
  ══════════════════════════════════════════════════════════════════════════ */

  function getWorkouts() {
    try { return JSON.parse(localStorage.getItem("fitness_workouts") || "[]"); } catch { return []; }
  }
  function saveWorkouts(arr) {
    localStorage.setItem("fitness_workouts", JSON.stringify(arr));
  }
  function esc(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, t => ({ "&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;" }[t] || t));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     1. 🏆 RECORDS PERSONALES + 1RM ESTIMADO
  ══════════════════════════════════════════════════════════════════════════ */

  // Fórmula de Epley: 1RM = peso × (1 + reps/30)
  function calc1RM(weight, reps) {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30) * 10) / 10;
  }

  // Devuelve mapa { ejercicio: { weight, reps, 1rm, date } } con el PR de cada ejercicio
  function getPersonalRecords() {
    const workouts = getWorkouts();
    const prs = {};
    workouts.forEach(w => {
      const rm = calc1RM(w.weight, w.reps);
      if (!prs[w.type] || rm > prs[w.type].rm) {
        prs[w.type] = { weight: w.weight, reps: w.reps, rm, date: w.date };
      }
    });
    return prs;
  }

  // Detecta si el workout recién guardado es un PR nuevo
  function isPR(workout) {
    const workouts = getWorkouts();
    const rm = calc1RM(workout.weight, workout.reps);
    const prev = workouts.filter(w => w.type === workout.type && w.id !== workout.id);
    if (prev.length === 0) return true; // primer registro = PR automático
    const bestPrev = Math.max(...prev.map(w => calc1RM(w.weight, w.reps)));
    return rm > bestPrev;
  }

  /* ── Sección de Records en vista Progreso ── */
  function buildRecordsSection() {
    const prs = getPersonalRecords();
    const entries = Object.entries(prs).sort((a, b) => b[1].rm - a[1].rm);

    if (entries.length === 0) {
      return `<p class="feat-empty">Aún no hay registros. ¡Agregá tu primer entrenamiento!</p>`;
    }

    return entries.map(([ejercicio, pr]) => `
      <div class="pr-card">
        <div class="pr-info">
          <span class="pr-name">${esc(ejercicio)}</span>
          <span class="pr-detail">${pr.weight} kg × ${pr.reps} reps • ${pr.date}</span>
        </div>
        <div class="pr-rm">
          <span class="pr-rm-value">${pr.rm}</span>
          <span class="pr-rm-label">1RM est.</span>
        </div>
      </div>
    `).join("");
  }

  function injectRecordsSection() {
    const progreso = document.getElementById("view-progreso");
    if (!progreso) return;
    // Evitar duplicar
    if (document.getElementById("records-section")) return;

    const statsGrid = progreso.querySelector(".stats-grid");
    if (!statsGrid) return;

    const section = document.createElement("div");
    section.id = "records-section";
    section.className = "feat-section";
    section.innerHTML = `
      <div class="feat-header">
        <span class="feat-icon">🏆</span>
        <h3>Records Personales</h3>
      </div>
      <div id="pr-list">${buildRecordsSection()}</div>
    `;
    statsGrid.insertAdjacentElement("afterend", section);
  }

  function refreshRecords() {
    const el = document.getElementById("pr-list");
    if (el) el.innerHTML = buildRecordsSection();
  }

  /* ── Badge PR en historial ── */
  function patchWorkoutList() {
    // Override renderWorkoutList para añadir badges PR y 1RM
    const original = window.renderWorkoutList;
    window.renderWorkoutList = function () {
      if (original) original();
      const workouts = getWorkouts();
      const prs = getPersonalRecords();

      const listEl = document.getElementById("workout-list");
      if (!listEl) return;

      // Re-render con badges
      if (workouts.length === 0) return;

      listEl.innerHTML = workouts.map(w => {
        const rm = calc1RM(w.weight, w.reps);
        const isPrBadge = prs[w.type] && Math.abs(prs[w.type].rm - rm) < 0.1;
        return `
          <div class="workout-item">
            <div class="item-info">
              <span class="item-title">
                ${esc(w.type)}
                ${isPrBadge ? '<span class="badge-pr">🏆 PR</span>' : ""}
              </span>
              <span class="item-meta">${w.date} • ${w.sets} series × ${w.reps} reps</span>
              ${w.notes ? `<span class="item-notes">📝 ${esc(w.notes)}</span>` : ""}
            </div>
            <div class="item-metrics-col">
              <div class="item-metrics">${w.weight} <span>kg</span></div>
              <div class="item-1rm">${rm} <span>1RM</span></div>
            </div>
          </div>
        `;
      }).join("");
    };
  }

  /* ── Notificación PR al guardar ── */
  function showPRToast(ejercicio, rm) {
    const existing = document.getElementById("pr-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "pr-toast";
    toast.innerHTML = `🏆 <strong>¡Nuevo PR!</strong> ${esc(ejercicio)} — 1RM estimado: <strong>${rm} kg</strong>`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 50);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  /* ── Hook en el form para detectar PR al guardar ── */
  function hookFormForPR() {
    const form = document.getElementById("workout-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      // Leer valores del form
      const type   = document.getElementById("workout-type")?.value.trim();
      const reps   = parseInt(document.getElementById("workout-reps")?.value);
      const weight = parseFloat(document.getElementById("workout-weight")?.value);
      if (!type || isNaN(reps) || isNaN(weight)) return;

      // Necesitamos esperar a que app.js guarde el workout antes de comparar
      setTimeout(() => {
        const workouts = getWorkouts();
        const newW = workouts.find(w => w.type === type);
        if (!newW) return;
        if (isPR({ ...newW, id: newW.id })) {
          const rm = calc1RM(weight, reps);
          showPRToast(type, rm);
        }
        refreshRecords();
        // Actualizar volumen también
        refreshVolumenChart();
      }, 300);
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2. 📋 RUTINAS / PLANTILLAS GUARDADAS
  ══════════════════════════════════════════════════════════════════════════ */

  const RUTINAS_KEY = "fitness_rutinas";

  function getRutinas() {
    try { return JSON.parse(localStorage.getItem(RUTINAS_KEY) || "[]"); } catch { return []; }
  }
  function saveRutinas(arr) {
    localStorage.setItem(RUTINAS_KEY, JSON.stringify(arr));
  }

  function buildRutinasUI() {
    const rutinas = getRutinas();
    if (rutinas.length === 0) {
      return `<p class="feat-empty">Sin rutinas guardadas. Guardá una desde el formulario.</p>`;
    }
    return rutinas.map((r, i) => `
      <div class="rutina-card" data-idx="${i}">
        <div class="rutina-info">
          <span class="rutina-name">${esc(r.name)}</span>
          <span class="rutina-detail">${esc(r.type)} • ${r.sets}×${r.reps} • ${r.weight} kg</span>
        </div>
        <div class="rutina-actions">
          <button class="btn-rutina-load" data-idx="${i}" title="Cargar en formulario">▶</button>
          <button class="btn-rutina-del"  data-idx="${i}" title="Eliminar">✕</button>
        </div>
      </div>
    `).join("");
  }

  function injectRutinasPanel() {
    const registrar = document.getElementById("view-registrar");
    if (!registrar || document.getElementById("rutinas-section")) return;

    const form = document.getElementById("workout-form");
    if (!form) return;

    // Botón "Guardar como rutina" debajo del submit
    const btnSave = document.createElement("button");
    btnSave.type = "button";
    btnSave.id   = "btn-save-rutina";
    btnSave.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
      Guardar como rutina`;
    form.appendChild(btnSave);

    // Sección de rutinas
    const section = document.createElement("div");
    section.id = "rutinas-section";
    section.className = "feat-section";
    section.innerHTML = `
      <div class="feat-header">
        <span class="feat-icon">📋</span>
        <h3>Mis Rutinas</h3>
      </div>
      <div id="rutinas-list">${buildRutinasUI()}</div>
    `;
    form.insertAdjacentElement("afterend", section);

    // Eventos
    btnSave.addEventListener("click", saveCurrentAsRutina);

    section.addEventListener("click", (e) => {
      const loadBtn = e.target.closest(".btn-rutina-load");
      const delBtn  = e.target.closest(".btn-rutina-del");
      if (loadBtn) loadRutina(parseInt(loadBtn.dataset.idx));
      if (delBtn)  deleteRutina(parseInt(delBtn.dataset.idx));
    });
  }

  function saveCurrentAsRutina() {
    const type   = document.getElementById("workout-type")?.value.trim();
    const sets   = document.getElementById("workout-sets")?.value;
    const reps   = document.getElementById("workout-reps")?.value;
    const weight = document.getElementById("workout-weight")?.value;

    if (!type) {
      alert("Completá al menos el nombre del ejercicio antes de guardar la rutina.");
      return;
    }

    const name = prompt(`Nombre para la rutina (ej. "Día A - Pecho"):`, type) || type;
    const rutinas = getRutinas();
    rutinas.unshift({ name: name.trim(), type, sets: parseInt(sets), reps: parseInt(reps), weight: parseFloat(weight) });
    saveRutinas(rutinas);
    refreshRutinas();

    // Feedback
    const btn = document.getElementById("btn-save-rutina");
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = "✅ ¡Rutina guardada!";
      btn.style.background = "rgba(16,185,129,.15)";
      btn.style.borderColor = "rgba(16,185,129,.4)";
      btn.style.color = "#34d399";
      setTimeout(() => { btn.innerHTML = orig; btn.style = ""; }, 1800);
    }
  }

  function loadRutina(idx) {
    const rutinas = getRutinas();
    const r = rutinas[idx];
    if (!r) return;

    const typeEl   = document.getElementById("workout-type");
    const setsEl   = document.getElementById("workout-sets");
    const repsEl   = document.getElementById("workout-reps");
    const weightEl = document.getElementById("workout-weight");

    if (typeEl)   typeEl.value   = r.type;
    if (setsEl)   setsEl.value   = r.sets;
    if (repsEl)   repsEl.value   = r.reps;
    if (weightEl) weightEl.value = r.weight;

    // Scroll al form
    document.getElementById("workout-form")?.scrollIntoView({ behavior: "smooth" });
  }

  function deleteRutina(idx) {
    const rutinas = getRutinas();
    rutinas.splice(idx, 1);
    saveRutinas(rutinas);
    refreshRutinas();
  }

  function refreshRutinas() {
    const el = document.getElementById("rutinas-list");
    if (el) el.innerHTML = buildRutinasUI();
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3. 📊 VOLUMEN SEMANAL
  ══════════════════════════════════════════════════════════════════════════ */

  function getWeeklyVolume() {
    const workouts = getWorkouts();
    const weeks = {};

    workouts.forEach(w => {
      // Parsear fecha — formato argentino d/m/yyyy
      const parts = w.date.split("/");
      let d;
      if (parts.length === 3) {
        d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        d = new Date(w.date);
      }
      if (isNaN(d)) return;

      // Obtener inicio de semana (lunes)
      const day = d.getDay(); // 0=dom
      const diff = (day === 0) ? -6 : 1 - day;
      const monday = new Date(d);
      monday.setDate(d.getDate() + diff);
      const key = `${monday.getDate()}/${monday.getMonth() + 1}`;

      const vol = w.sets * w.reps * w.weight;
      weeks[key] = (weeks[key] || 0) + vol;
    });

    // Últimas 6 semanas ordenadas
    const entries = Object.entries(weeks)
      .slice(-6)
      .map(([label, vol]) => ({ label, vol: Math.round(vol) }));

    return entries;
  }

  function buildVolumenChart(data) {
    if (data.length === 0) return "";
    const maxVol = Math.max(...data.map(d => d.vol));

    return data.map(d => {
      const pct = maxVol > 0 ? (d.vol / maxVol) * 100 : 0;
      const tons = (d.vol / 1000).toFixed(1);
      return `
        <div class="vol-bar-wrap">
          <div class="vol-bar-track">
            <div class="vol-bar-fill" style="height:${pct}%"></div>
          </div>
          <span class="vol-bar-val">${tons}t</span>
          <span class="vol-bar-label">${d.label}</span>
        </div>
      `;
    }).join("");
  }

  function injectVolumenSection() {
    const progreso = document.getElementById("view-progreso");
    if (!progreso || document.getElementById("volumen-section")) return;

    const statsGrid = progreso.querySelector(".stats-grid");
    if (!statsGrid) return;

    const section = document.createElement("div");
    section.id = "volumen-section";
    section.className = "feat-section";

    const data = getWeeklyVolume();
    section.innerHTML = `
      <div class="feat-header">
        <span class="feat-icon">📊</span>
        <h3>Volumen Semanal</h3>
        <span class="feat-hint">series × reps × kg</span>
      </div>
      <div id="volumen-chart" class="vol-chart">
        ${data.length >= 1 ? buildVolumenChart(data) : '<p class="feat-empty">Necesitás más registros para ver el gráfico.</p>'}
      </div>
    `;

    // Insertar antes de records si existe, sino después de stats
    const records = document.getElementById("records-section");
    if (records) {
      records.insertAdjacentElement("beforebegin", section);
    } else {
      statsGrid.insertAdjacentElement("afterend", section);
    }

    // Estadísticas ampliadas
    injectExtraStats();
  }

  function injectExtraStats() {
    const statsGrid = document.querySelector(".stats-grid");
    if (!statsGrid || document.getElementById("stat-streak")) return;

    const workouts = getWorkouts();

    // Racha actual (días consecutivos con entrenamiento)
    function getStreak() {
      if (workouts.length === 0) return 0;
      const days = new Set(workouts.map(w => w.date));
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 60; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toLocaleDateString();
        if (days.has(key)) { streak++; } else if (i > 0) { break; }
      }
      return streak;
    }

    // Ejercicio más frecuente
    function getMostFrequent() {
      if (workouts.length === 0) return "—";
      const freq = {};
      workouts.forEach(w => { freq[w.type] = (freq[w.type] || 0) + 1; });
      return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
    }

    statsGrid.insertAdjacentHTML("beforeend", `
      <div class="stat-card">
        <span class="stat-label">Racha actual</span>
        <span id="stat-streak" class="stat-value">${getStreak()} días 🔥</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Ejercicio top</span>
        <span id="stat-top-ex" class="stat-value" style="font-size:14px">${esc(getMostFrequent())}</span>
      </div>
    `);
  }

  function refreshVolumenChart() {
    const el = document.getElementById("volumen-chart");
    if (!el) return;
    const data = getWeeklyVolume();
    el.innerHTML = data.length >= 1
      ? buildVolumenChart(data)
      : '<p class="feat-empty">Necesitás más registros para ver el gráfico.</p>';
  }

  /* ══════════════════════════════════════════════════════════════════════════
     CSS DE TODAS LAS FEATURES
  ══════════════════════════════════════════════════════════════════════════ */

  function injectCSS() {
    const style = document.createElement("style");
    style.textContent = `
    /* ── Secciones generales ── */
    .feat-section {
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 16px;
      padding: 16px;
      margin: 12px 0;
    }
    .feat-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
    }
    .feat-header h3 {
      font-size: 15px !important;
      font-weight: 700;
      color: #f1f5f9 !important;
      margin: 0;
      flex: 1;
    }
    .feat-icon { font-size: 16px; }
    .feat-hint {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
    }
    .feat-empty {
      color: #64748b;
      font-size: 13px;
      text-align: center;
      padding: 12px 0;
      margin: 0;
    }

    /* ── 🏆 PR Cards ── */
    .pr-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: rgba(255,255,255,.04);
      border-radius: 10px;
      margin-bottom: 8px;
      border-left: 3px solid #f59e0b;
    }
    .pr-card:last-child { margin-bottom: 0; }
    .pr-info { display: flex; flex-direction: column; gap: 2px; }
    .pr-name { font-size: 14px; font-weight: 600; color: #f1f5f9; }
    .pr-detail { font-size: 11px; color: #94a3b8; }
    .pr-rm { display: flex; flex-direction: column; align-items: center; min-width: 56px; }
    .pr-rm-value {
      font-size: 20px;
      font-weight: 800;
      color: #f59e0b;
      line-height: 1;
    }
    .pr-rm-label { font-size: 10px; color: #64748b; font-weight: 600; letter-spacing: .5px; }

    /* Badge PR en historial */
    .badge-pr {
      display: inline-block;
      background: linear-gradient(135deg, #f59e0b, #ef4444);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 6px;
      margin-left: 6px;
      vertical-align: middle;
    }

    /* 1RM en item de historial */
    .item-metrics-col {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }
    .item-1rm {
      font-size: 11px;
      color: #f59e0b;
      font-weight: 600;
    }
    .item-1rm span { font-size: 9px; color: #64748b; margin-left: 2px; }

    /* Toast PR */
    #pr-toast {
      position: fixed;
      top: -80px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 1.5px solid #f59e0b;
      color: #f1f5f9;
      padding: 12px 20px;
      border-radius: 50px;
      font-size: 14px;
      z-index: 2000;
      white-space: nowrap;
      box-shadow: 0 8px 32px rgba(245,158,11,.3);
      transition: top .4s cubic-bezier(.22,1,.36,1);
      max-width: 90vw;
      text-align: center;
    }
    #pr-toast.show { top: 16px; }

    /* ── 📋 Rutinas ── */
    #btn-save-rutina {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px;
      background: rgba(99,102,241,.1);
      border: 1.5px solid rgba(99,102,241,.25);
      border-radius: 12px;
      color: #818cf8;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 8px;
      transition: background .15s, border-color .15s;
    }
    #btn-save-rutina:hover {
      background: rgba(99,102,241,.18);
      border-color: rgba(99,102,241,.45);
    }
    #btn-save-rutina svg { width: 16px; height: 16px; }

    .rutina-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: rgba(255,255,255,.04);
      border-radius: 10px;
      margin-bottom: 8px;
      border-left: 3px solid #6366f1;
    }
    .rutina-card:last-child { margin-bottom: 0; }
    .rutina-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .rutina-name { font-size: 14px; font-weight: 600; color: #f1f5f9; }
    .rutina-detail { font-size: 11px; color: #94a3b8; }
    .rutina-actions { display: flex; gap: 6px; }
    .btn-rutina-load, .btn-rutina-del {
      width: 30px; height: 30px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 13px;
      display: flex; align-items: center; justify-content: center;
      transition: background .15s;
    }
    .btn-rutina-load {
      background: rgba(99,102,241,.2);
      color: #818cf8;
    }
    .btn-rutina-load:hover { background: rgba(99,102,241,.35); }
    .btn-rutina-del {
      background: rgba(239,68,68,.1);
      color: #f87171;
    }
    .btn-rutina-del:hover { background: rgba(239,68,68,.25); }

    /* ── 📊 Volumen semanal ── */
    .vol-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      gap: 8px;
      height: 100px;
      padding: 0 4px;
    }
    .vol-bar-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      gap: 3px;
    }
    .vol-bar-track {
      flex: 1;
      width: 100%;
      background: rgba(255,255,255,.06);
      border-radius: 6px;
      display: flex;
      align-items: flex-end;
      overflow: hidden;
    }
    .vol-bar-fill {
      width: 100%;
      background: linear-gradient(180deg, #38bdf8 0%, #6366f1 100%);
      border-radius: 6px;
      min-height: 4px;
      transition: height .6s cubic-bezier(.22,1,.36,1);
    }
    .vol-bar-val {
      font-size: 10px;
      font-weight: 700;
      color: #38bdf8;
      line-height: 1;
    }
    .vol-bar-label {
      font-size: 9px;
      color: #64748b;
      line-height: 1;
    }
    `;
    document.head.appendChild(style);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     INICIALIZACIÓN
  ══════════════════════════════════════════════════════════════════════════ */

  function init() {
    injectCSS();
    patchWorkoutList();
    hookFormForPR();

    // Observar cambios de vista para inyectar secciones lazy
    const originalSwitch = window.switchView;
    window.switchView = function (viewId) {
      if (originalSwitch) originalSwitch(viewId);

      if (viewId === "view-progreso") {
        setTimeout(() => {
          injectRecordsSection();
          injectVolumenSection();
          refreshRecords();
          refreshVolumenChart();
        }, 60);
      }
      if (viewId === "view-registrar") {
        setTimeout(() => {
          injectRutinasPanel();
        }, 60);
      }
    };

    // Inyectar en la vista activa al cargar (por si arranca en progreso o registrar)
    const active = document.querySelector(".view.active");
    if (active) {
      if (active.id === "view-progreso") {
        injectRecordsSection();
        injectVolumenSection();
      }
      if (active.id === "view-registrar") {
        injectRutinasPanel();
      }
    }

    // Re-render lista inicial con badges PR
    if (typeof window.renderWorkoutList === "function") {
      window.renderWorkoutList();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // app.js ya corrió, esperamos un tick para que todo esté listo
    setTimeout(init, 100);
  }

})();
