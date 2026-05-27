/* ==========================================================================
   FITNESS TRACKER - LÓGICA DE APLICACIÓN (app.js)
   ========================================================================== */

// --- Variables de Estado ---
let workouts = [];
let userProfile = {
  name: "Atleta",
  objective: "Bajar grasa"
};

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupEventListeners();
  updateUI();
  
  // Registrar Service Worker para PWA
  registerServiceWorker();
});

// --- Carga y Guardado (localStorage) ---
function loadData() {
  // Cargar perfil de usuario
  const savedProfile = localStorage.getItem("fitness_profile");
  if (savedProfile) {
    try {
      userProfile = JSON.parse(savedProfile);
    } catch (e) {
      console.error("Error al leer perfil", e);
    }
  }

  // Cargar entrenamientos
  const savedWorkouts = localStorage.getItem("fitness_workouts");
  if (savedWorkouts) {
    try {
      workouts = JSON.parse(savedWorkouts);
    } catch (e) {
      console.error("Error al leer entrenamientos", e);
      workouts = [];
    }
  } else {
    // Datos semilla para demostración si está vacío
    workouts = [
      { id: Date.now() - 86400000 * 4, type: "Sentadillas", sets: 4, reps: 10, weight: 50, notes: "Excelente profundidad", date: new Date(Date.now() - 86400000 * 4).toLocaleDateString() },
      { id: Date.now() - 86400000 * 3, type: "Press de Banca", sets: 4, reps: 10, weight: 60, notes: "Cerré con fuerza la última serie", date: new Date(Date.now() - 86400000 * 3).toLocaleDateString() },
      { id: Date.now() - 86400000 * 2, type: "Sentadillas", sets: 4, reps: 10, weight: 55, notes: "Subí 5 kilos, dolió pero salió", date: new Date(Date.now() - 86400000 * 2).toLocaleDateString() },
      { id: Date.now() - 86400000 * 1, type: "Press de Banca", sets: 4, reps: 8, weight: 62.5, notes: "Muy buena congestión", date: new Date(Date.now() - 86400000 * 1).toLocaleDateString() }
    ];
    saveWorkouts();
  }
}

function saveProfile() {
  localStorage.setItem("fitness_profile", JSON.stringify(userProfile));
}

function saveWorkouts() {
  localStorage.setItem("fitness_workouts", JSON.stringify(workouts));
}

// --- Configuración de Controladores de Eventos ---
function setupEventListeners() {
  // Guardar nuevo entrenamiento
  const workoutForm = document.getElementById("workout-form");
  if (workoutForm) {
    workoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const typeInput = document.getElementById("workout-type");
      const setsInput = document.getElementById("workout-sets");
      const repsInput = document.getElementById("workout-reps");
      const weightInput = document.getElementById("workout-weight");
      const notesInput = document.getElementById("workout-notes");

      const newWorkout = {
        id: Date.now(),
        type: typeInput.value.trim(),
        sets: parseInt(setsInput.value),
        reps: parseInt(repsInput.value),
        weight: parseFloat(weightInput.value),
        notes: notesInput.value.trim(),
        date: new Date().toLocaleDateString()
      };

      workouts.unshift(newWorkout); // Añadir al inicio del historial
      saveWorkouts();
      
      // Limpiar campos y relanzar UI
      typeInput.value = "";
      notesInput.value = "";
      
      updateUI();
      
      // Feedback visual y regresar a inicio tras guardar
      const submitBtn = workoutForm.querySelector('button[type="submit"]');
      const originalContent = submitBtn.innerHTML;
      submitBtn.innerHTML = "<span>¡Guardado Corretamente!</span>";
      submitBtn.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
      
      setTimeout(() => {
        submitBtn.innerHTML = originalContent;
        submitBtn.style.background = "";
        switchView('view-inicio');
      }, 1000);
    });
  }

  // Guardar Configuración
  const configForm = document.getElementById("config-form");
  if (configForm) {
    configForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById("user-name-input");
      const selectedObjective = document.querySelector('input[name="user-objective"]:checked');

      if (nameInput && selectedObjective) {
        userProfile.name = nameInput.value.trim();
        userProfile.objective = selectedObjective.value;
        saveProfile();
        updateUI();

        // Alerta de éxito suave
        const submitBtn = configForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = "<span>¡Configuración Actualizada!</span>";
        submitBtn.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
        
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = "";
          switchView('view-inicio');
        }, 1200);
      }
    });
  }

  // Borrar todos los datos
  const btnClearData = document.getElementById("btn-clear-data");
  if (btnClearData) {
    btnClearData.addEventListener("click", () => {
      const confirmReset = confirm("¿Estás absolutamente seguro de que deseas eliminar TODOS tus entrenamientos y restablecer tu config? Esta acción es irreversible.");
      if (confirmReset) {
        localStorage.clear();
        workouts = [];
        userProfile = {
          name: "Atleta",
          objective: "Bajar grasa"
        };
        updateUI();
        switchView('view-inicio');
        alert("Todos los datos han sido borrados de raíz.");
      }
    });
  }

  // Filtro de gráficos
  const chartFilter = document.getElementById("chart-exercise-filter");
  if (chartFilter) {
    chartFilter.addEventListener("change", () => {
      renderProgressChart();
    });
  }

  // Adaptación de Tamaño de Gráfica ante redimensionamiento de ventana
  window.addEventListener("resize", () => {
    const currentView = document.querySelector(".view.active");
    if (currentView && currentView.id === "view-progreso") {
      renderProgressChart();
    }
  });
}

// --- Actualización de la Interfaz (UI) ---
function updateUI() {
  // 1. Cabecera y Perfil
  const headerName = document.getElementById("header-user-name");
  const navObjective = document.getElementById("user-objective-badge");
  const inputName = document.getElementById("user-name-input");
  
  if (headerName) headerName.textContent = userProfile.name;
  if (navObjective) navObjective.textContent = userProfile.objective;
  if (inputName) inputName.value = userProfile.name;

  // Marcar el botón de radio correcto en Configuración
  const objectiveRadio = document.querySelector(`input[name="user-objective"][value="${userProfile.objective}"]`);
  if (objectiveRadio) objectiveRadio.checked = true;

  // 2. Resumen rápido en Pantallazo de Inicio
  const quickRecent = document.getElementById("quick-recent-workout");
  if (quickRecent) {
    if (workouts.length > 0) {
      const last = workouts[0];
      quickRecent.className = "workout-item";
      quickRecent.innerHTML = `
        <div class="item-info">
          <span class="item-title">${escapeHTML(last.type)}</span>
          <span class="item-meta">${last.date} • ${last.sets} series × ${last.reps} reps</span>
        </div>
        <div class="item-metrics">${last.weight} <span>kg</span></div>
      `;
    } else {
      quickRecent.className = "quick-status-empty";
      quickRecent.textContent = "No hay entrenamientos registrados aún. ¡Registra el primero!";
    }
  }

  // 3. Renderizar listado de historial en la vista Registrar
  renderWorkoutList();

  // 4. Poblador de filtro del gráfico
  populateChartSelectors();

  // 5. Estadísticas resumidas
  updateStats();
}

function renderWorkoutList() {
  const workoutList = document.getElementById("workout-list");
  if (!workoutList) return;

  if (workouts.length === 0) {
    workoutList.innerHTML = `<div class="no-workouts">No tienes entrenamientos históricos aún. Comienza llenando el formulario de arriba.</div>`;
    return;
  }

  workoutList.innerHTML = workouts.map(workout => `
    <div class="workout-item">
      <div class="item-info">
        <span class="item-title">${escapeHTML(workout.type)}</span>
        <span class="item-meta">${workout.date} • ${workout.sets} series × ${workout.reps} reps</span>
        ${workout.notes ? `<span class="item-notes">📝 ${escapeHTML(workout.notes)}</span>` : ""}
      </div>
      <div class="item-metrics">
        ${workout.weight}
        <span>kg</span>
      </div>
    </div>
  `).join("");
}

function populateChartSelectors() {
  const chartFilter = document.getElementById("chart-exercise-filter");
  if (!chartFilter) return;

  // Obtener ejercicios únicos
  const exercises = [...new Set(workouts.map(w => w.type))].sort();
  
  // Guardar valor seleccionado
  const currentValue = chartFilter.value;
  
  // Limpiar
  chartFilter.innerHTML = '<option value="all">Todos los Ejercicios</option>';
  
  // Añadir opciones
  exercises.forEach(ex => {
    const opt = document.createElement("option");
    opt.value = ex;
    opt.textContent = ex;
    chartFilter.appendChild(opt);
  });

  // Restaurar valor previo si aún es válido
  if (exercises.includes(currentValue) || currentValue === "all") {
    chartFilter.value = currentValue;
  }
}

function updateStats() {
  const statTotal = document.getElementById("stat-total-workouts");
  const statMax = document.getElementById("stat-max-weight");

  if (statTotal) statTotal.textContent = workouts.length;

  if (statMax) {
    if (workouts.length > 0) {
      const maxW = Math.max(...workouts.map(w => w.weight));
      statMax.textContent = `${maxW} kg`;
    } else {
      statMax.textContent = "0 kg";
    }
  }
}

// --- Control de Navegación entre Vistas ---
function switchView(viewId) {
  // Ocultar todas las secciones
  const views = document.querySelectorAll(".view");
  views.forEach(v => v.classList.remove("active"));

  // Mostrar la sección solicitada
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add("active");
  }

  // Sincronizar clases activas en navbar inferior
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => item.classList.remove("active"));

  // Buscar el nav id relativo al view id
  const navId = "nav-" + viewId.replace("view-", "");
  const targetNav = document.getElementById(navId);
  if (targetNav) {
    targetNav.classList.add("active");
  }

  // Si entramos en la pantalla de progreso, redibujamos la gráfica
  if (viewId === "view-progreso") {
    setTimeout(renderProgressChart, 50); // Delay mínimo para asegurar que el canvas tenga su ancho real
  }
}

// --- Renderizado del Gráfico Custom en Canvas ---
function renderProgressChart() {
  const canvas = document.getElementById("progress-canvas");
  const noDataMsg = document.getElementById("no-chart-data");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const filter = document.getElementById("chart-exercise-filter").value;

  // Filtrar y ordenar datos cronológicamente (antiguos a recientes)
  let filteredData = [...workouts].reverse();
  if (filter !== "all") {
    filteredData = filteredData.filter(w => w.type === filter);
  }

  // Si no hay datos suficientes, mostrar mensaje vacío
  if (filteredData.length < 2) {
    noDataMsg.style.display = "flex";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  } else {
    noDataMsg.style.display = "none";
  }

  // Establecer resolución real para óptima nitidez en pantallas de alta densidad
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  // Configuración de márgenes
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;

  // Encontrar valores límites
  const weights = filteredData.map(d => d.weight);
  let maxWeight = Math.max(...weights);
  let minWeight = Math.min(...weights);

  // Buffer para el valor superior del gráfico
  maxWeight = Math.ceil(maxWeight * 1.1);
  minWeight = Math.floor(minWeight * 0.9);
  if (minWeight < 0) minWeight = 0;
  
  if (maxWeight === minWeight) {
    maxWeight += 10;
    minWeight = Math.max(0, minWeight - 10);
  }

  // Limpiar lienzo
  ctx.clearRect(0, 0, width, height);

  // 1. Dibujar Líneas de Guía Horizontales (Grilla)
  const steps = 4;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#94a3b8"; // Slate 400 para textos
  ctx.font = "10px Inter";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const yVal = minWeight + ratio * (maxWeight - minWeight);
    const yPos = paddingTop + graphHeight - ratio * graphHeight;

    // Línea
    ctx.beginPath();
    ctx.moveTo(paddingLeft, yPos);
    ctx.lineTo(width - paddingRight, yPos);
    ctx.stroke();

    // Texto de peso (Y-Axis)
    ctx.fillText(`${yVal.toFixed(0)} kg`, paddingLeft - 8, yPos);
  }

  // 2. Trazar Coordenadas de los Puntos
  const points = [];
  const totalPoints = filteredData.length;

  filteredData.forEach((d, index) => {
    const xRatio = totalPoints > 1 ? index / (totalPoints - 1) : 0.5;
    const yRatio = (d.weight - minWeight) / (maxWeight - minWeight);

    const x = paddingLeft + xRatio * graphWidth;
    const y = paddingTop + graphHeight - yRatio * graphHeight;

    points.push({ x, y, data: d });
  });

  // 3. Dibujar área bajo la curva (Gradiente)
  if (points.length > 0) {
    const gradient = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + graphHeight);
    gradient.addColorStop(0, "rgba(56, 189, 248, 0.35)"); // Sky blue
    gradient.addColorStop(1, "rgba(56, 189, 248, 0.0)");

    ctx.beginPath();
    ctx.moveTo(points[0].x, paddingTop + graphHeight);
    
    points.forEach(p => {
      ctx.lineTo(p.x, p.y);
    });
    
    ctx.lineTo(points[points.length - 1].x, paddingTop + graphHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // 4. Dibujar línea de tendencia principal
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#38bdf8"; // Sky 400
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  points.forEach((p, idx) => {
    if (idx === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x, p.y);
    }
  });
  ctx.stroke();

  // 5. Dibujar los marcadores (círculos) en cada punto
  points.forEach((p) => {
    // Brillo exterior del punto
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(56, 189, 248, 0.3)";
    ctx.fill();

    // Círculo central
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.5, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  });

  // 6. Escribir etiquetas de tiempo / fechas en el eje X
  ctx.fillStyle = "#94a3b8"; // Slate 400
  ctx.textAlign = "center";
  ctx.font = "9px Inter";
  ctx.textBaseline = "top";

  const moduloLabel = Math.max(1, Math.ceil(totalPoints / 5)); // Mostrar máximo 5 fechas para evitar solapamientos
  points.forEach((p, idx) => {
    if (idx % moduloLabel === 0 || idx === totalPoints - 1) {
      // Dibujar pequeña línea indicadora en eje X
      ctx.beginPath();
      ctx.moveTo(p.x, paddingTop + graphHeight);
      ctx.lineTo(p.x, paddingTop + graphHeight + 4);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.stroke();

      // Recortar la fecha (por ej, "27/5/2026" a "27/5")
      const dateParts = p.data.date.split("/");
      const shortDate = dateParts.length >= 2 ? `${dateParts[0]}/${dateParts[1]}` : p.data.date;

      ctx.fillText(shortDate, p.x, paddingTop + graphHeight + 8);
    }
  });
}

// --- Registro de Service Worker para capacidades PWA ---
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js")
        .then(reg => {
          console.log("Service Worker registrado con éxito. Scope:", reg.scope);
        })
        .catch(err => {
          console.warn("Fallo al registrar Service Worker:", err);
        });
    });
  }
}

// Escapar HTML para seguridad ante inyección de datos de texto
function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Exponer la función de cambio de vista de forma global
window.switchView = switchView;
