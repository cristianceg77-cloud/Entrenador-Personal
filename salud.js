/* ==========================================================================
   SALUD.JS — Mi Entrenamiento v1.4.0
   Agrega al final de index.html: <script src="salud.js"></script>
   (después de features.js)

   Incluye:
   ⚖️  Calculador de IMC
   ❤️  Calculador de frecuencia cardíaca aeróbica
   🏋️  Biblioteca de ejercicios (~50) con músculo y descripción
   📐  Las 5 dimensiones del fitness
   ⏱️  Rutina de 7 minutos con timer integrado
   ========================================================================== */

(function () {
  "use strict";

  /* ══════════════════════════════════════════════════════════════════════════
     DATOS
  ══════════════════════════════════════════════════════════════════════════ */

  const EJERCICIOS = [
    // Pecho / Hombros / Espalda
    { nombre: "Flexiones", musculo: "Pectoral, Tríceps", grupo: "Pecho", desc: "Boca abajo apoyado en manos, bajá y subí manteniendo el torso firme." },
    { nombre: "Press de Banca", musculo: "Pectoral mayor, Tríceps", grupo: "Pecho", desc: "Acostado en banco, levantá y bajá barra o mancuernas sobre el pecho." },
    { nombre: "Flexiones en T", musculo: "Pecho, Hombros, Tríceps", grupo: "Pecho", desc: "Flexión tradicional; al subir girá el torso y extendé un brazo en T." },
    { nombre: "Pullover con mancuerna", musculo: "Pecho, Espalda", grupo: "Pecho", desc: "Tumbado en banco, levantá una mancuerna desde arriba de la cabeza hasta el pecho." },
    { nombre: "Dominadas", musculo: "Dorsal ancho, Bíceps", grupo: "Espalda", desc: "Suspendido de una barra, eleváte hasta que la barbilla supere la barra." },
    { nombre: "Remo con barra", musculo: "Dorsal ancho, Bíceps", grupo: "Espalda", desc: "Inclinado hacia adelante, levantá y bajá una barra hacia el abdomen." },
    { nombre: "Remo invertido", musculo: "Espalda, Bíceps", grupo: "Espalda", desc: "Usá barra baja o TRX para filas horizontales trabajando espalda y bíceps." },
    { nombre: "Peso muerto rumano", musculo: "Espalda baja, Isquiotibiales", grupo: "Espalda", desc: "De pie con piernas levemente flexionadas, bajá el torso con espalda recta." },
    { nombre: "Superman", musculo: "Erector columna, Glúteos", grupo: "Espalda", desc: "Tumbado boca abajo, levantá brazos y piernas simultáneamente." },
    { nombre: "Face pull", musculo: "Hombros, Trapecios", grupo: "Hombros", desc: "Usá polea alta para tirar las cuerdas hacia la cara." },
    { nombre: "Press militar", musculo: "Hombros, Tríceps", grupo: "Hombros", desc: "De pie o sentado, levantá y bajá una barra sobre la cabeza." },
    { nombre: "Shrugs", musculo: "Trapecios", grupo: "Hombros", desc: "De pie, levantá los hombros hacia arriba y luego bajá." },
    // Abdominales
    { nombre: "Abdominales", musculo: "Abdominales", grupo: "Abdomen", desc: "Acostado, contraé los abdominales y levantá el torso hacia las rodillas." },
    { nombre: "Plancha", musculo: "Abdominales, Oblicuos", grupo: "Abdomen", desc: "Sostené el cuerpo en posición de plancha con el torso recto y codos doblados." },
    { nombre: "Plancha lateral", musculo: "Abdominales, Oblicuos", grupo: "Abdomen", desc: "Sostené el cuerpo en posición lateral de plancha con el torso recto." },
    { nombre: "Crunches", musculo: "Abdominales", grupo: "Abdomen", desc: "Recostado boca arriba, elevá ligeramente el torso hacia las rodillas." },
    { nombre: "Russian twists", musculo: "Oblicuos", grupo: "Abdomen", desc: "Sentado, incliná el torso hacia atrás y rotá de lado a lado sosteniendo un peso." },
    { nombre: "Mountain climbers", musculo: "Abdominales, Cardio", grupo: "Abdomen", desc: "En posición de plancha, llevá las rodillas hacia el pecho alternadamente y rápido." },
    { nombre: "Aleteo de piernas", musculo: "Abdominales, Isquiotibiales", grupo: "Abdomen", desc: "Tumbado boca arriba, alternás levantar las piernas en movimiento de patada." },
    { nombre: "Rotación de tronco", musculo: "Oblicuos", grupo: "Abdomen", desc: "Usá cuerda o polea para realizar rotaciones del tronco." },
    // Bíceps
    { nombre: "Curl de bíceps con barra", musculo: "Bíceps", grupo: "Bíceps", desc: "De pie, flexioná los codos para levantar la barra hacia los hombros." },
    { nombre: "Curl de bíceps con mancuernas", musculo: "Bíceps", grupo: "Bíceps", desc: "Con mancuernas en ambas manos, flexioná los codos hacia los hombros." },
    { nombre: "Curl martillo", musculo: "Bíceps, Braquial", grupo: "Bíceps", desc: "Palmas enfrentadas, llevá las mancuernas hacia los hombros." },
    { nombre: "Curl 21", musculo: "Bíceps", grupo: "Bíceps", desc: "7 reps media vuelta abajo + 7 media vuelta arriba + 7 recorrido completo." },
    { nombre: "Curl con cable", musculo: "Bíceps", grupo: "Bíceps", desc: "Usá máquina de cable, flexioná los codos para levantar y bajá controlado." },
    // Tríceps
    { nombre: "Flexiones de tríceps", musculo: "Tríceps", grupo: "Tríceps", desc: "Manos juntas, codos hacia atrás. Bajá y subí extendiendo codos." },
    { nombre: "Fondos en paralelas", musculo: "Tríceps", grupo: "Tríceps", desc: "Entre dos barras paralelas, bajá el cuerpo flexionando codos y volvé." },
    { nombre: "Fondo en banco", musculo: "Tríceps", grupo: "Tríceps", desc: "Manos en banco detrás de vos, bajá flexionando codos y subí extendiendo." },
    { nombre: "Tríceps en polea alta", musculo: "Tríceps", grupo: "Tríceps", desc: "Con cuerda en polea alta, extendé los codos hacia abajo." },
    { nombre: "Fondos en máquina", musculo: "Tríceps", grupo: "Tríceps", desc: "Usá máquina de fondos, bajá y subí el brazo extendiendo el codo." },
    // Piernas
    { nombre: "Sentadillas", musculo: "Cuádriceps, Glúteos, Isquiotibiales", grupo: "Piernas", desc: "Pies al ancho de hombros, bajá como si te sentaras con espalda recta." },
    { nombre: "Hip Thrust", musculo: "Glúteos, Isquiotibiales", grupo: "Piernas", desc: "Apoyado en banco, eleváte contrayendo los glúteos en la parte superior." },
    { nombre: "Prensa de piernas", musculo: "Cuádriceps, Glúteos", grupo: "Piernas", desc: "Sentado en máquina, empujá con los pies extendiendo las piernas." },
    { nombre: "Zancadas", musculo: "Cuádriceps, Glúteos, Isquiotibiales", grupo: "Piernas", desc: "Un paso adelante flexionando ambas rodillas. Alternás las piernas." },
    { nombre: "Zancadas laterales", musculo: "Piernas, Glúteos", grupo: "Piernas", desc: "Un paso al costado flexionando la rodilla y manteniendo la otra extendida." },
    { nombre: "Zancadas inversas", musculo: "Piernas, Glúteos", grupo: "Piernas", desc: "Un paso atrás, flexionando ambas rodillas. Impulsate con el pie de atrás." },
    { nombre: "Peso muerto", musculo: "Isquiotibiales, Glúteos, Espalda baja", grupo: "Piernas", desc: "De pie, bajá el torso con espalda recta y volvé a la posición inicial." },
    { nombre: "Extensiones de cuádriceps", musculo: "Cuádriceps", grupo: "Piernas", desc: "Sentado en máquina, extendé las piernas hacia afuera y bajá controlado." },
    { nombre: "Curl de piernas acostado", musculo: "Isquiotibiales", grupo: "Piernas", desc: "Boca abajo en máquina, flexioná las piernas hacia los glúteos." },
    { nombre: "Elevación de talones", musculo: "Gemelos", grupo: "Piernas", desc: "De pie, levantá los talones lo más alto posible y bajá." },
    { nombre: "Step-ups", musculo: "Cuádriceps, Glúteos", grupo: "Piernas", desc: "Subí y bajá un escalón alternando las piernas con espalda recta." },
    { nombre: "Sentadillas búlgaras", musculo: "Cuádriceps, Glúteos", grupo: "Piernas", desc: "Un pie en banco detrás, bajá flexionando la rodilla delantera." },
  ];

  const RUTINA_7MIN = [
    { nombre: "Jumping Jacks",      musculo: "Cardio, Cuerpo completo", work: 30, rest: 10 },
    { nombre: "Sentadilla de pared","musculo": "Cuádriceps, Glúteos",   work: 30, rest: 10 },
    { nombre: "Flexiones",          musculo: "Pectoral, Tríceps",       work: 30, rest: 10 },
    { nombre: "Crunches abdominales",musculo:"Abdominales",             work: 30, rest: 10 },
    { nombre: "Step-up sobre silla",musculo: "Cuádriceps, Glúteos",    work: 30, rest: 10 },
    { nombre: "Sentadillas",        musculo: "Cuádriceps, Glúteos",     work: 30, rest: 10 },
    { nombre: "Fondos en silla",    musculo: "Tríceps",                 work: 30, rest: 10 },
    { nombre: "Plancha",            musculo: "Core, Abdominales",       work: 30, rest: 10 },
    { nombre: "Trote en el lugar",  musculo: "Cardio",                  work: 30, rest: 10 },
    { nombre: "Zancadas",           musculo: "Cuádriceps, Glúteos",     work: 30, rest: 10 },
    { nombre: "Flexiones con giro", musculo: "Pecho, Hombros",         work: 30, rest: 10 },
    { nombre: "Plancha lateral",    musculo: "Oblicuos, Core",          work: 30, rest: 10 },
  ];

  const DIMENSIONES = [
    { icon: "🤸", nombre: "Flexibilidad", desc: "Capacidad de las articulaciones para moverse en todo su rango. Se pierde desde los 9 años. Trabajala con estiramientos, yoga, Pilates." },
    { icon: "❤️", nombre: "Resistencia Cardiovascular", desc: "Funcionamiento del sistema cardiorrespiratorio durante ejercicio prolongado. Se desarrolla caminando rápido, corriendo, nadando o andando en bicicleta." },
    { icon: "💪", nombre: "Fuerza", desc: "Ejercicio contra resistencia: pesos libres, elásticos, máquinas o el propio peso corporal. Mantiene y aumenta la masa muscular." },
    { icon: "⚖️", nombre: "Neuromotor", desc: "Abarca equilibrio, agilidad y coordinación. Crítico en adultos mayores para prevenir caídas y fracturas." },
    { icon: "📊", nombre: "Composición Corporal", desc: "Relación entre estructura ósea, componente muscular y tejido adiposo. Una proporción adecuada garantiza funcionalidad plena y salud óptima." },
  ];

  /* ══════════════════════════════════════════════════════════════════════════
     ESTADO RUTINA 7MIN
  ══════════════════════════════════════════════════════════════════════════ */
  let r7State = { running: false, paused: false, step: 0, phase: "work", remaining: 30, intervalId: null };

  /* ══════════════════════════════════════════════════════════════════════════
     HTML DE LA VISTA SALUD
  ══════════════════════════════════════════════════════════════════════════ */

  function buildSaludHTML() {
    const grupos = [...new Set(EJERCICIOS.map(e => e.grupo))];

    return `
    <section id="view-salud" class="view">

      <!-- Tabs internos -->
      <div class="salud-tabs">
        <button class="stab active" data-tab="imc">⚖️ IMC</button>
        <button class="stab" data-tab="fc">❤️ FC</button>
        <button class="stab" data-tab="ejercicios">🏋️ Ejercicios</button>
        <button class="stab" data-tab="7min">⏱️ 7 min</button>
        <button class="stab" data-tab="dimensiones">📐 Guía</button>
      </div>

      <!-- ── TAB IMC ── -->
      <div class="stab-content active" id="stab-imc">
        <div class="salud-card">
          <h3>Índice de Masa Corporal</h3>
          <p class="salud-desc">El IMC es una medida de referencia. No distingue masa muscular de grasa — usalo como orientación.</p>

          <div class="imc-form">
            <div class="imc-row">
              <div class="imc-field">
                <label>Peso (kg)</label>
                <input type="number" id="imc-peso" min="20" max="300" step="0.1" placeholder="70">
              </div>
              <div class="imc-field">
                <label>Altura (cm)</label>
                <input type="number" id="imc-altura" min="100" max="250" step="1" placeholder="170">
              </div>
            </div>
            <button id="btn-calc-imc" class="btn-salud">Calcular IMC</button>
          </div>

          <div id="imc-result" style="display:none">
            <div class="imc-valor-wrap">
              <span id="imc-valor" class="imc-valor">--</span>
              <span id="imc-categoria" class="imc-cat">--</span>
            </div>
            <div class="imc-barra-wrap">
              <div class="imc-barra">
                <div class="imc-seg" style="background:#3b82f6;flex:1.5" title="Bajo peso <18.5"></div>
                <div class="imc-seg" style="background:#22c55e;flex:2.5" title="Normal 18.5-25"></div>
                <div class="imc-seg" style="background:#f59e0b;flex:2"   title="Sobrepeso 25-30"></div>
                <div class="imc-seg" style="background:#ef4444;flex:4"   title="Obesidad >30"></div>
              </div>
              <div id="imc-marker" class="imc-marker"></div>
              <div class="imc-labels">
                <span>Bajo<br><18.5</span>
                <span>Normal<br>18.5–25</span>
                <span>Sobrepeso<br>25–30</span>
                <span>Obesidad<br>>30</span>
              </div>
            </div>
            <p id="imc-consejo" class="imc-consejo"></p>
          </div>
        </div>
      </div>

      <!-- ── TAB FC ── -->
      <div class="stab-content" id="stab-fc">
        <div class="salud-card">
          <h3>Frecuencia Cardíaca Aeróbica</h3>
          <p class="salud-desc">La zona aeróbica óptima para quemar grasa y mejorar la resistencia cardiovascular se calcula según tu edad.</p>

          <div class="imc-form">
            <div class="imc-field">
              <label>Tu edad (años)</label>
              <input type="number" id="fc-edad" min="10" max="100" placeholder="30">
            </div>
            <button id="btn-calc-fc" class="btn-salud">Calcular</button>
          </div>

          <div id="fc-result" style="display:none">
            <div class="fc-cards">
              <div class="fc-card">
                <span class="fc-label">FC Máxima</span>
                <span id="fc-max" class="fc-val">--</span>
                <span class="fc-unit">lpm</span>
              </div>
              <div class="fc-card fc-card-aero">
                <span class="fc-label">Zona Aeróbica</span>
                <span id="fc-zona" class="fc-val">-- / --</span>
                <span class="fc-unit">lpm (60%–75%)</span>
              </div>
              <div class="fc-card">
                <span class="fc-label">Zona Anaeróbica</span>
                <span id="fc-anae" class="fc-val">-- / --</span>
                <span class="fc-unit">lpm (80%–90%)</span>
              </div>
            </div>
            <p class="imc-consejo">Para quemar grasa, mantené la FC en la zona aeróbica durante al menos 20–30 minutos. Podés controlarlo con un smartband o contando las pulsaciones en 15 segundos × 4.</p>
          </div>
        </div>
      </div>

      <!-- ── TAB EJERCICIOS ── -->
      <div class="stab-content" id="stab-ejercicios">
        <div class="salud-card">
          <h3>Biblioteca de Ejercicios</h3>
          <input type="text" id="ej-search" placeholder="🔍 Buscar ejercicio o músculo..." class="ej-search">
          <div class="ej-grupos">
            <button class="ej-grupo-btn active" data-grupo="all">Todos</button>
            ${[...new Set(EJERCICIOS.map(e => e.grupo))].map(g =>
              `<button class="ej-grupo-btn" data-grupo="${g}">${g}</button>`
            ).join("")}
          </div>
          <div id="ej-list" class="ej-list"></div>
        </div>
      </div>

      <!-- ── TAB 7MIN ── -->
      <div class="stab-content" id="stab-7min">
        <div class="salud-card">
          <h3>Rutina de 7 Minutos</h3>
          <p class="salud-desc">12 ejercicios × 30 segundos con 10 segundos de descanso. Solo necesitás una silla y una pared.</p>

          <div id="r7-inicio">
            <div class="r7-ejercicios-preview">
              ${RUTINA_7MIN.map((e,i) => `
                <div class="r7-prev-item">
                  <span class="r7-num">${i+1}</span>
                  <div>
                    <span class="r7-prev-name">${e.nombre}</span>
                    <span class="r7-prev-mus">${e.musculo}</span>
                  </div>
                  <span class="r7-prev-time">30s</span>
                </div>
              `).join("")}
            </div>
            <button id="btn-start-7min" class="btn-salud btn-salud-green">▶ Iniciar Rutina</button>
          </div>

          <div id="r7-activo" style="display:none">
            <div class="r7-progress-bar-wrap">
              <div id="r7-progress-bar" class="r7-progress-bar"></div>
            </div>
            <div id="r7-phase-label" class="r7-phase">EJERCICIO</div>
            <div id="r7-nombre" class="r7-nombre">--</div>
            <div id="r7-musculo-label" class="r7-musculo">--</div>
            <div id="r7-countdown" class="r7-countdown">30</div>
            <div class="r7-nav">
              <span id="r7-paso" class="r7-paso">1 / 12</span>
            </div>
            <div class="r7-btns">
              <button id="r7-btn-pause" class="btn-salud">⏸ Pausar</button>
              <button id="r7-btn-stop"  class="btn-salud btn-salud-red">✕ Terminar</button>
            </div>
          </div>

          <div id="r7-fin" style="display:none">
            <div class="r7-fin-msg">
              🎉 ¡Rutina completada!<br>
              <span>Completaste los 7 minutos. Excelente trabajo.</span>
            </div>
            <button id="btn-restart-7min" class="btn-salud btn-salud-green">↺ Repetir</button>
          </div>
        </div>
      </div>

      <!-- ── TAB DIMENSIONES ── -->
      <div class="stab-content" id="stab-dimensiones">
        <div class="salud-card">
          <h3>Las 5 Dimensiones del Fitness</h3>
          <p class="salud-desc">Según el Manual Director de Actividad Física y Salud del Ministerio de Salud de Argentina.</p>
          <div class="dim-list">
            ${DIMENSIONES.map(d => `
              <div class="dim-card">
                <div class="dim-icon">${d.icon}</div>
                <div class="dim-info">
                  <span class="dim-nombre">${d.nombre}</span>
                  <span class="dim-desc">${d.desc}</span>
                </div>
              </div>
            `).join("")}
          </div>
          <div class="tip-box">
            💡 <strong>Dato:</strong> La mayoría de la grasa que perdemos cuando bajamos de peso se elimina por la respiración como CO₂, no por sudor.
          </div>
        </div>
      </div>

    </section>`;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     LÓGICA IMC
  ══════════════════════════════════════════════════════════════════════════ */

  function calcIMC() {
    const peso   = parseFloat(document.getElementById("imc-peso")?.value);
    const altura = parseFloat(document.getElementById("imc-altura")?.value);
    if (isNaN(peso) || isNaN(altura) || peso <= 0 || altura <= 0) {
      alert("Ingresá peso y altura válidos.");
      return;
    }
    const h = altura / 100;
    const imc = peso / (h * h);
    const imcR = Math.round(imc * 10) / 10;

    let cat, color, consejo, pct;
    if (imc < 18.5)      { cat = "Bajo peso";   color = "#3b82f6"; consejo = "Tu IMC indica bajo peso. Consultá con un profesional de salud para una plan nutricional adecuado."; pct = (imc / 18.5) * 15; }
    else if (imc < 25)   { cat = "Normal";      color = "#22c55e"; consejo = "¡Excelente! Tu IMC está en el rango normal. Mantené tus hábitos de alimentación y ejercicio."; pct = 15 + ((imc - 18.5) / 6.5) * 25; }
    else if (imc < 30)   { cat = "Sobrepeso";   color = "#f59e0b"; consejo = "Tu IMC indica sobrepeso. Combiná ejercicio regular con una alimentación balanceada."; pct = 40 + ((imc - 25) / 5) * 20; }
    else if (imc < 35)   { cat = "Obesidad I";  color = "#ef4444"; consejo = "Tu IMC indica obesidad. Te recomendamos consultar con un médico o nutricionista."; pct = 60 + ((imc - 30) / 5) * 15; }
    else                 { cat = "Obesidad II+";color = "#b91c1c"; consejo = "Tu IMC indica obesidad severa. Es importante que consultes con un profesional de salud."; pct = 75 + Math.min(((imc - 35) / 10) * 25, 25); }

    document.getElementById("imc-valor").textContent = imcR;
    document.getElementById("imc-valor").style.color = color;
    document.getElementById("imc-categoria").textContent = cat;
    document.getElementById("imc-categoria").style.color = color;
    document.getElementById("imc-consejo").textContent = consejo;
    document.getElementById("imc-marker").style.left = Math.min(pct, 98) + "%";
    document.getElementById("imc-result").style.display = "block";

    // Guardar en perfil
    try {
      const p = JSON.parse(localStorage.getItem("fitness_profile") || "{}");
      p.imc = imcR; p.imcCat = cat;
      localStorage.setItem("fitness_profile", JSON.stringify(p));
    } catch (_) {}
  }

  /* ══════════════════════════════════════════════════════════════════════════
     LÓGICA FC
  ══════════════════════════════════════════════════════════════════════════ */

  function calcFC() {
    const edad = parseInt(document.getElementById("fc-edad")?.value);
    if (isNaN(edad) || edad < 10 || edad > 100) { alert("Ingresá una edad válida entre 10 y 100."); return; }
    const fcMax  = 220 - edad;
    const aeroL  = Math.round(fcMax * 0.60);
    const aeroH  = Math.round(fcMax * 0.75);
    const anaeL  = Math.round(fcMax * 0.80);
    const anaeH  = Math.round(fcMax * 0.90);

    document.getElementById("fc-max").textContent  = fcMax;
    document.getElementById("fc-zona").textContent = `${aeroL} – ${aeroH}`;
    document.getElementById("fc-anae").textContent = `${anaeL} – ${anaeH}`;
    document.getElementById("fc-result").style.display = "block";
  }

  /* ══════════════════════════════════════════════════════════════════════════
     LÓGICA BIBLIOTECA EJERCICIOS
  ══════════════════════════════════════════════════════════════════════════ */

  function renderEjercicios(filtro = "all", busqueda = "") {
    const list = document.getElementById("ej-list");
    if (!list) return;
    let data = EJERCICIOS;
    if (filtro !== "all") data = data.filter(e => e.grupo === filtro);
    if (busqueda) {
      const q = busqueda.toLowerCase();
      data = data.filter(e =>
        e.nombre.toLowerCase().includes(q) ||
        e.musculo.toLowerCase().includes(q) ||
        e.desc.toLowerCase().includes(q)
      );
    }
    if (data.length === 0) {
      list.innerHTML = `<p class="feat-empty">No se encontraron ejercicios.</p>`;
      return;
    }
    list.innerHTML = data.map(e => `
      <div class="ej-card">
        <div class="ej-header">
          <span class="ej-nombre">${e.nombre}</span>
          <span class="ej-grupo-tag">${e.grupo}</span>
        </div>
        <span class="ej-musculo">💪 ${e.musculo}</span>
        <span class="ej-desc">${e.desc}</span>
        <button class="ej-btn-usar" data-nombre="${e.nombre}">Usar en registro →</button>
      </div>
    `).join("");

    list.querySelectorAll(".ej-btn-usar").forEach(btn => {
      btn.addEventListener("click", () => {
        const inp = document.getElementById("workout-type");
        if (inp) inp.value = btn.dataset.nombre;
        if (typeof switchView === "function") switchView("view-registrar");
        document.getElementById("workout-form")?.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     LÓGICA RUTINA 7 MIN
  ══════════════════════════════════════════════════════════════════════════ */

  function getAudioCtx7() {
    try { return new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
  }
  let _audioCtx7 = null;
  function beep7(freq, dur) {
    if (!_audioCtx7) _audioCtx7 = getAudioCtx7();
    if (!_audioCtx7) return;
    const osc  = _audioCtx7.createOscillator();
    const gain = _audioCtx7.createGain();
    osc.connect(gain); gain.connect(_audioCtx7.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.2, _audioCtx7.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx7.currentTime + dur);
    osc.start(); osc.stop(_audioCtx7.currentTime + dur);
  }

  function r7UpdateUI() {
    const s = r7State;
    const ej = RUTINA_7MIN[s.step];
    const isWork = s.phase === "work";
    document.getElementById("r7-phase-label").textContent = isWork ? "EJERCICIO" : "DESCANSO";
    document.getElementById("r7-phase-label").className   = "r7-phase " + (isWork ? "r7-work" : "r7-rest");
    document.getElementById("r7-nombre").textContent      = isWork ? ej.nombre : (s.step + 1 < RUTINA_7MIN.length ? "Siguiente: " + RUTINA_7MIN[s.step + 1].nombre : "¡Último!");
    document.getElementById("r7-musculo-label").textContent = isWork ? ej.musculo : "Preparate...";
    document.getElementById("r7-countdown").textContent   = s.remaining;
    document.getElementById("r7-paso").textContent        = `${s.step + 1} / ${RUTINA_7MIN.length}`;
    const total = RUTINA_7MIN.length;
    const pct   = ((s.step) / total + (isWork ? (ej.work - s.remaining) / ej.work / total : 0)) * 100;
    document.getElementById("r7-progress-bar").style.width = Math.min(pct, 100) + "%";
  }

  function r7Tick() {
    const s = r7State;
    s.remaining--;
    if (s.remaining <= 3 && s.remaining > 0) beep7(660, 0.08);
    r7UpdateUI();

    if (s.remaining <= 0) {
      const ej = RUTINA_7MIN[s.step];
      if (s.phase === "work") {
        // Pasar a descanso
        if (s.step + 1 >= RUTINA_7MIN.length) {
          // Rutina terminada
          r7Finish();
          return;
        }
        s.phase = "rest";
        s.remaining = ej.rest;
        beep7(880, 0.15);
        if (navigator.vibrate) navigator.vibrate([60, 30, 60]);
      } else {
        // Pasar al siguiente ejercicio
        s.step++;
        s.phase = "work";
        s.remaining = RUTINA_7MIN[s.step].work;
        beep7(1100, 0.2);
        if (navigator.vibrate) navigator.vibrate([100]);
      }
      r7UpdateUI();
    }
  }

  function r7Start() {
    r7State = { running: true, paused: false, step: 0, phase: "work", remaining: RUTINA_7MIN[0].work, intervalId: null };
    document.getElementById("r7-inicio").style.display = "none";
    document.getElementById("r7-activo").style.display = "block";
    document.getElementById("r7-fin").style.display    = "none";
    r7UpdateUI();
    r7State.intervalId = setInterval(r7Tick, 1000);
  }

  function r7Pause() {
    const s = r7State;
    if (s.paused) {
      s.paused = false;
      s.intervalId = setInterval(r7Tick, 1000);
      document.getElementById("r7-btn-pause").textContent = "⏸ Pausar";
    } else {
      s.paused = true;
      clearInterval(s.intervalId);
      document.getElementById("r7-btn-pause").textContent = "▶ Continuar";
    }
  }

  function r7Stop() {
    clearInterval(r7State.intervalId);
    r7State.running = false;
    document.getElementById("r7-inicio").style.display = "block";
    document.getElementById("r7-activo").style.display = "none";
    document.getElementById("r7-fin").style.display    = "none";
  }

  function r7Finish() {
    clearInterval(r7State.intervalId);
    r7State.running = false;
    document.getElementById("r7-progress-bar").style.width = "100%";
    document.getElementById("r7-activo").style.display = "none";
    document.getElementById("r7-fin").style.display    = "block";
    beep7(660, 0.1);
    setTimeout(() => beep7(880, 0.1), 150);
    setTimeout(() => beep7(1100, 0.25), 300);
    if (navigator.vibrate) navigator.vibrate([80, 40, 80, 40, 200]);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     INYECTAR VISTA Y NAVBAR
  ══════════════════════════════════════════════════════════════════════════ */

  function injectView() {
    const main = document.querySelector(".app-main");
    if (!main || document.getElementById("view-salud")) return;
    main.insertAdjacentHTML("beforeend", buildSaludHTML());
  }

  function injectNavBtn() {
    const nav = document.querySelector(".bottom-nav");
    if (!nav || document.getElementById("nav-salud")) return;

    const btn = document.createElement("button");
    btn.className  = "nav-item";
    btn.id         = "nav-salud";
    btn.innerHTML  = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="nav-icon">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-5h2v2h-2zm0-8h2v6h-2z"/>
      </svg>
      <span>Salud</span>`;
    btn.onclick = () => {
      if (typeof switchView === "function") switchView("view-salud");
    };
    nav.appendChild(btn);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     BIND EVENTOS
  ══════════════════════════════════════════════════════════════════════════ */

  function bindEvents() {
    // Tabs internos
    document.querySelectorAll(".stab").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".stab").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".stab-content").forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById("stab-" + btn.dataset.tab)?.classList.add("active");
        if (btn.dataset.tab === "ejercicios") renderEjercicios();
      });
    });

    // IMC
    document.getElementById("btn-calc-imc")?.addEventListener("click", calcIMC);
    document.getElementById("imc-peso")?.addEventListener("keydown", e => { if (e.key === "Enter") calcIMC(); });
    document.getElementById("imc-altura")?.addEventListener("keydown", e => { if (e.key === "Enter") calcIMC(); });

    // FC
    document.getElementById("btn-calc-fc")?.addEventListener("click", calcFC);
    document.getElementById("fc-edad")?.addEventListener("keydown", e => { if (e.key === "Enter") calcFC(); });

    // Biblioteca ejercicios
    const ejSearch = document.getElementById("ej-search");
    let ejGrupo = "all";
    ejSearch?.addEventListener("input", () => renderEjercicios(ejGrupo, ejSearch.value));
    document.querySelectorAll(".ej-grupo-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".ej-grupo-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        ejGrupo = btn.dataset.grupo;
        renderEjercicios(ejGrupo, ejSearch?.value || "");
      });
    });

    // Rutina 7 min
    document.getElementById("btn-start-7min")?.addEventListener("click", r7Start);
    document.getElementById("r7-btn-pause")?.addEventListener("click", r7Pause);
    document.getElementById("r7-btn-stop")?.addEventListener("click", r7Stop);
    document.getElementById("btn-restart-7min")?.addEventListener("click", r7Start);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     CSS
  ══════════════════════════════════════════════════════════════════════════ */

  function injectCSS() {
    const s = document.createElement("style");
    s.textContent = `
    /* ── Tabs ── */
    .salud-tabs {
      display: flex;
      gap: 6px;
      padding: 12px 12px 0;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }
    .salud-tabs::-webkit-scrollbar { display: none; }
    .stab {
      flex-shrink: 0;
      padding: 7px 14px;
      border-radius: 20px;
      border: 1.5px solid rgba(255,255,255,.1);
      background: rgba(255,255,255,.05);
      color: #94a3b8;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all .15s;
      white-space: nowrap;
    }
    .stab.active {
      background: linear-gradient(135deg,#0ea5e9,#6366f1);
      border-color: transparent;
      color: #fff;
    }
    .stab-content { display: none; padding: 12px; }
    .stab-content.active { display: block; }

    /* ── Salud card ── */
    .salud-card {
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 16px;
      padding: 16px;
    }
    .salud-card h3 { color:#f1f5f9!important; font-size:16px!important; margin:0 0 6px; }
    .salud-desc { color:#94a3b8; font-size:13px; margin:0 0 14px; line-height:1.5; }

    /* ── IMC ── */
    .imc-form { display:flex; flex-direction:column; gap:10px; margin-bottom:14px; }
    .imc-row  { display:flex; gap:10px; }
    .imc-field { flex:1; display:flex; flex-direction:column; gap:4px; }
    .imc-field label { font-size:12px; color:#94a3b8; font-weight:600; }
    .imc-field input {
      background: rgba(255,255,255,.07);
      border: 1.5px solid rgba(255,255,255,.1);
      border-radius: 10px;
      padding: 10px 12px;
      color: #f1f5f9;
      font-size: 16px;
      font-weight: 600;
      text-align: center;
    }
    .imc-field input:focus { outline:none; border-color:#38bdf8; }
    .btn-salud {
      width: 100%;
      padding: 12px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg,#0ea5e9,#6366f1);
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity .15s;
    }
    .btn-salud:hover { opacity:.88; }
    .btn-salud-green { background: linear-gradient(135deg,#10b981,#059669)!important; }
    .btn-salud-red   { background: rgba(239,68,68,.15)!important; color:#f87171!important; border:1.5px solid rgba(239,68,68,.25)!important; }
    .imc-valor-wrap {
      display:flex; align-items:baseline; gap:10px;
      justify-content:center; margin:12px 0 10px;
    }
    .imc-valor { font-size:48px; font-weight:800; line-height:1; }
    .imc-cat   { font-size:18px; font-weight:700; }
    .imc-barra-wrap { margin:8px 0; position:relative; }
    .imc-barra { display:flex; border-radius:8px; overflow:hidden; height:12px; }
    .imc-seg   { height:100%; }
    .imc-marker {
      position:absolute;
      top:-4px;
      width:4px;
      height:20px;
      background:#fff;
      border-radius:2px;
      transform:translateX(-50%);
      box-shadow:0 0 6px rgba(255,255,255,.5);
      transition:left .5s cubic-bezier(.22,1,.36,1);
    }
    .imc-labels {
      display:flex;
      justify-content:space-between;
      margin-top:6px;
      font-size:9px;
      color:#64748b;
      text-align:center;
    }
    .imc-consejo {
      font-size:12px;
      color:#94a3b8;
      text-align:center;
      margin:10px 0 0;
      line-height:1.5;
    }

    /* ── FC ── */
    .fc-cards { display:flex; flex-direction:column; gap:8px; margin:12px 0; }
    .fc-card {
      display:flex;
      align-items:center;
      justify-content:space-between;
      background:rgba(255,255,255,.05);
      border-radius:12px;
      padding:12px 14px;
      border-left:3px solid rgba(255,255,255,.1);
    }
    .fc-card-aero { border-left-color:#22c55e; }
    .fc-label { font-size:12px; color:#94a3b8; font-weight:600; flex:1; }
    .fc-val   { font-size:22px; font-weight:800; color:#f1f5f9; }
    .fc-unit  { font-size:10px; color:#64748b; text-align:right; min-width:80px; }

    /* ── Ejercicios ── */
    .ej-search {
      width:100%;
      box-sizing:border-box;
      background:rgba(255,255,255,.07);
      border:1.5px solid rgba(255,255,255,.1);
      border-radius:10px;
      padding:10px 14px;
      color:#f1f5f9;
      font-size:14px;
      margin-bottom:10px;
    }
    .ej-search:focus { outline:none; border-color:#38bdf8; }
    .ej-grupos {
      display:flex; gap:6px; overflow-x:auto; margin-bottom:12px;
      scrollbar-width:none; padding-bottom:4px;
    }
    .ej-grupos::-webkit-scrollbar { display:none; }
    .ej-grupo-btn {
      flex-shrink:0;
      padding:5px 12px;
      border-radius:16px;
      border:1.5px solid rgba(255,255,255,.1);
      background:rgba(255,255,255,.05);
      color:#94a3b8;
      font-size:12px;
      font-weight:600;
      cursor:pointer;
      white-space:nowrap;
    }
    .ej-grupo-btn.active { background:rgba(56,189,248,.15); border-color:#38bdf8; color:#38bdf8; }
    .ej-list { display:flex; flex-direction:column; gap:8px; max-height:420px; overflow-y:auto; }
    .ej-card {
      background:rgba(255,255,255,.04);
      border:1px solid rgba(255,255,255,.07);
      border-radius:12px;
      padding:12px;
      display:flex;
      flex-direction:column;
      gap:4px;
    }
    .ej-header { display:flex; justify-content:space-between; align-items:center; }
    .ej-nombre { font-size:14px; font-weight:700; color:#f1f5f9; }
    .ej-grupo-tag {
      font-size:10px;
      background:rgba(99,102,241,.2);
      color:#818cf8;
      padding:2px 8px;
      border-radius:10px;
      font-weight:600;
    }
    .ej-musculo { font-size:11px; color:#f59e0b; font-weight:600; }
    .ej-desc    { font-size:12px; color:#94a3b8; line-height:1.4; }
    .ej-btn-usar {
      margin-top:4px;
      align-self:flex-end;
      background:none;
      border:none;
      color:#38bdf8;
      font-size:12px;
      font-weight:600;
      cursor:pointer;
      padding:0;
    }

    /* ── Rutina 7 min ── */
    .r7-ejercicios-preview { display:flex; flex-direction:column; gap:6px; margin-bottom:14px; max-height:300px; overflow-y:auto; }
    .r7-prev-item {
      display:flex; align-items:center; gap:10px;
      background:rgba(255,255,255,.04); border-radius:10px; padding:8px 12px;
    }
    .r7-num { font-size:11px; font-weight:800; color:#6366f1; min-width:18px; }
    .r7-prev-name { font-size:13px; font-weight:600; color:#f1f5f9; display:block; }
    .r7-prev-mus  { font-size:11px; color:#94a3b8; }
    .r7-prev-time { font-size:11px; font-weight:700; color:#38bdf8; margin-left:auto; }

    .r7-progress-bar-wrap { background:rgba(255,255,255,.07); border-radius:6px; height:8px; overflow:hidden; margin-bottom:16px; }
    .r7-progress-bar { height:100%; background:linear-gradient(90deg,#0ea5e9,#6366f1); border-radius:6px; transition:width .5s; }
    .r7-phase   { text-align:center; font-size:11px; font-weight:800; letter-spacing:2px; margin-bottom:6px; }
    .r7-work    { color:#38bdf8; }
    .r7-rest    { color:#22c55e; }
    .r7-nombre  { text-align:center; font-size:22px; font-weight:800; color:#f1f5f9; margin-bottom:4px; }
    .r7-musculo { text-align:center; font-size:12px; color:#94a3b8; margin-bottom:10px; }
    .r7-countdown {
      text-align:center; font-size:72px; font-weight:900;
      color:#f1f5f9; line-height:1; margin-bottom:8px;
      font-variant-numeric:tabular-nums;
    }
    .r7-nav { text-align:center; margin-bottom:12px; }
    .r7-paso { font-size:12px; color:#64748b; font-weight:600; }
    .r7-btns { display:flex; gap:8px; }
    .r7-btns .btn-salud { flex:1; font-size:14px; }
    .r7-fin-msg {
      text-align:center; font-size:22px; font-weight:700; color:#34d399;
      margin:20px 0; line-height:1.5;
    }
    .r7-fin-msg span { font-size:14px; color:#94a3b8; font-weight:400; }

    /* ── Dimensiones ── */
    .dim-list { display:flex; flex-direction:column; gap:10px; margin-bottom:14px; }
    .dim-card {
      display:flex; gap:12px; align-items:flex-start;
      background:rgba(255,255,255,.04); border-radius:12px; padding:12px;
    }
    .dim-icon  { font-size:24px; min-width:32px; text-align:center; }
    .dim-info  { display:flex; flex-direction:column; gap:3px; }
    .dim-nombre{ font-size:14px; font-weight:700; color:#f1f5f9; }
    .dim-desc  { font-size:12px; color:#94a3b8; line-height:1.5; }
    .tip-box {
      background:rgba(56,189,248,.08);
      border:1.5px solid rgba(56,189,248,.2);
      border-radius:12px;
      padding:12px;
      font-size:13px;
      color:#94a3b8;
      line-height:1.5;
    }

    /* ── Ícono nav Salud ── */
    #nav-salud .nav-icon { width:22px; height:22px; }
    `;
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     PATCH SWITCHVIEW para activar nav-salud
  ══════════════════════════════════════════════════════════════════════════ */

  function patchSwitchView() {
    const orig = window.switchView;
    window.switchView = function (viewId) {
      if (orig) orig(viewId);
      // Manejar nav-salud manualmente (no sigue el patrón nav-{viewId})
      const navSalud = document.getElementById("nav-salud");
      if (navSalud) {
        navSalud.classList.toggle("active", viewId === "view-salud");
      }
    };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════════════════════════ */

  function init() {
    injectCSS();
    injectView();
    injectNavBtn();
    patchSwitchView();
    bindEvents();
    renderEjercicios(); // precarga la lista
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    setTimeout(init, 150);
  }

})();
