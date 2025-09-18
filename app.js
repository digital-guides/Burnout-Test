// ===== CONFIGURACIÓN (escala exacta del PDF, SIN números en el texto) =====
const LABELS = [
  "Nunca o casi nunca",
  "Pocas veces al mes",
  "Algunas veces al mes",
  "Varias veces a la semana",
  "Diariamente"
];

// Secciones y preguntas (12 en total)
const SECTIONS = [
  { title: "Sección 1: Agotamiento Emocional y Físico", items: [
      "¿Con qué frecuencia te sientes emocionalmente agotado por tu trabajo?",
      "¿Te sientes cansado al despertar y sin ganas de ir a trabajar?",
      "¿Sientes que tu trabajo está absorbiendo toda tu energía mental y física?",
      "¿Tienes problemas para dormir, como insomnio o sueño fragmentado?"
    ]
  },
  { title: "Sección 2: Cinismo y Despersonalización", items: [
      "¿Con qué frecuencia te sientes desilusionado con tu trabajo?",
      "¿Has desarrollado una actitud más cínica o negativa hacia tus colegas, clientes o tu profesión?",
      "¿Sientes que te has distanciado emocionalmente de las personas con las que trabajas?",
      "¿Sientes que tu trabajo ha perdido su sentido o su valor para ti?"
    ]
  },
  { title: "Sección 3: Falta de Realización Personal", items: [
      "¿Con qué frecuencia sientes que tus logros en el trabajo no son significativos?",
      "¿Crees que tu capacidad para resolver problemas ha disminuido?",
      "¿Sientes que ya no eres tan efectivo en tu trabajo como antes?",
      "¿Has perdido el interés en los nuevos desafíos o proyectos en el trabajo?"
    ]
  }
];

// Rangos del PDF (12–24, 25–48, 49–60)
const RANGES = [
  {
    min: 12, max: 24, title: "Riesgo bajo", badge: "ok",
    text: "Tu nivel de riesgo de burnout es bajo. Aunque puedes experimentar estrés ocasional, tu situación es manejable. Es importante mantener hábitos saludables para seguir previniendo el agotamiento."
  },
  {
    min: 25, max: 48, title: "Zona de advertencia", badge: "mid",
    text: "Estás en una *zona de advertencia*. Experimentas algunos síntomas de burnout. Te sientes estresado y podrías estar perdiendo el entusiasmo por tu trabajo. Es un buen momento para evaluar tus hábitos, establecer límites y buscar estrategias de bienestar."
  },
  {
    min: 49, max: 60, title: "Alto riesgo", badge: "high",
    text: "Estás en **alto riesgo de burnout** o ya lo estás experimentando. Los síntomas son severos y afectan significativamente tu bienestar. No ignores estas señales. Es crucial que tomes medidas de inmediato, como buscar apoyo profesional (un psicólogo, un coach) y hablar con tu supervisor o equipo de Talento Humano para encontrar soluciones. Este no es un signo de debilidad, sino una señal de que necesitas un cambio."
  }
];

// ===== REFERENCIAS AL DOM =====
const $quiz   = document.getElementById("quiz");
const $result = document.getElementById("result");
const $pct    = document.getElementById("pct");
const $count  = document.getElementById("count");
const $total  = document.getElementById("total");
const $fill   = document.getElementById("fill");
const $btnFinish = document.getElementById("btnFinish");
const $btnReset  = document.getElementById("btnReset");

// ===== RENDER DE PREGUNTAS =====
const totalQuestions = SECTIONS.reduce((acc, s) => acc + s.items.length, 0);
$total.textContent = totalQuestions;

function renderQuiz() {
  let idx = 0;
  $quiz.innerHTML = "";

  SECTIONS.forEach(section => {
    const h = document.createElement("h2");
    h.className = "section";
    h.textContent = section.title;
    $quiz.appendChild(h);

    section.items.forEach(text => {
      const card = document.createElement("section");
      card.className = "card";

      const q = document.createElement("div");
      q.className = "q";
      q.textContent = `${++idx}. ${text}`;
      card.appendChild(q);

      // valores 1..5 (no se muestran en el texto)
      LABELS.forEach((label, i) => {
        const wrap = document.createElement("label");
        wrap.className = "opt";
        const value = i + 1;
        wrap.innerHTML = `<input type="radio" name="q${idx}" value="${value}"> ${label}`;
        card.appendChild(wrap);
      });

      $quiz.appendChild(card);
    });
  });
}
renderQuiz();

// ===== LÓGICA DE PROGRESO =====
function getAnswers() {
  const values = [];
  let answered = 0;
  for (let i = 1; i <= totalQuestions; i++) {
    const picked = document.querySelector(`input[name="q${i}"]:checked`);
    const v = picked ? Number(picked.value) : null; // 1..5 o null
    values.push(v);
    if (v !== null) answered++;
  }
  return { values, answered };
}

function updateProgress() {
  const { answered } = getAnswers();
  const pct = Math.round((answered / totalQuestions) * 100);
  $pct.textContent = pct + "%";
  $count.textContent = answered;
  $fill.style.width = pct + "%";
}

document.addEventListener("change", (e) => {
  if (e.target.matches('input[type="radio"]')) updateProgress();
});

// ===== RESULTADOS =====
function sum(values) { return values.reduce((a, v) => a + (v || 0), 0); }
function classify(total) {
  return RANGES.find(r => total >= r.min && total <= r.max) || RANGES[RANGES.length - 1];
}

$btnFinish.addEventListener("click", () => {
  const { values, answered } = getAnswers();
  if (answered < totalQuestions) {
    alert("Por favor responde todas las preguntas.");
    return;
  }
  const total = sum(values);
  const r = classify(total);

  $result.style.display = "block";
  $result.innerHTML = `
    <h2>Resultado</h2>
    <p>Puntaje total: <b>${total}</b> </p>
    <p class="badge ${r.badge}">${r.title}</p>
    <p>${r.text}</p>
  `;
  window.scrollTo({ top: $result.offsetTop - 10, behavior: "smooth" });
});

$btnReset.addEventListener("click", () => {
  document.querySelectorAll('input[type="radio"]').forEach(i => i.checked = false);
  $result.style.display = "none";
  updateProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Init
updateProgress();

