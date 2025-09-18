// Señales de diagnóstico
console.log("app.js solicitado");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM listo; iniciando cuestionario");

  try {
    // ===== CONFIGURACIÓN =====
    var LABELS = [
      "Nunca o casi nunca",
      "Pocas veces al mes",
      "Algunas veces al mes",
      "Varias veces a la semana",
      "Diariamente"
    ];

    var SECTIONS = [
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

    // Interpretaciones EXACTAS del PDF
    var RANGES = [
      {
        min: 12, max: 24, title: "Riesgo bajo", badge: "ok",
        text:
          "Tu nivel de riesgo de burnout es bajo. Aunque puedes experimentar estrés ocasional, tu situación es manejable. Es importante mantener hábitos saludables para seguir previniendo el agotamiento."
      },
      {
        min: 25, max: 48, title: "Zona de advertencia", badge: "mid",
        text:
          "Estás en una zona de advertencia. Experimentas algunos síntomas de burnout. Te sientes estresado y podrías estar perdiendo el entusiasmo por tu trabajo. Es un buen momento para evaluar tus hábitos, establecer límites y buscar estrategias de bienestar."
      },
      {
        min: 49, max: 60, title: "Alto riesgo de burnout", badge: "high",
        text:
          "Estás en alto riesgo de burnout o ya lo estás experimentando. Los síntomas son severos y afectan significativamente tu bienestar. No ignores estas señales. Es crucial que tomes medidas de inmediato, como buscar apoyo profesional (un psicólogo, un coach) y hablar con tu supervisor o equipo de Talento Humano para encontrar soluciones. Este no es un signo de debilidad, sino una señal de que necesitas un cambio."
      }
    ];

    // ===== REFERENCIAS AL DOM =====
    var $quiz    = document.getElementById("quiz");
    var $result  = document.getElementById("result");
    var $pct     = document.getElementById("pct");
    var $count   = document.getElementById("count");
    var $total   = document.getElementById("total");
    var $fill    = document.getElementById("fill");
    var $btnOk   = document.getElementById("btnFinish");
    var $btnRst  = document.getElementById("btnReset");

    if (!($quiz && $result && $pct && $count && $total && $fill && $btnOk && $btnRst)) {
      throw new Error("Faltan elementos con ids esperados en el HTML.");
    }

    // ===== RENDER =====
    var totalQuestions = SECTIONS.reduce(function (acc, s) { return acc + s.items.length; }, 0);
    $total.textContent = String(totalQuestions);

    function renderQuiz() {
      var idx = 0;
      $quiz.innerHTML = "";

      SECTIONS.forEach(function (sec) {
        var h = document.createElement("h2");
        h.className = "section";
        h.textContent = sec.title;
        $quiz.appendChild(h);

        sec.items.forEach(function (text) {
          var card = document.createElement("section");
          card.className = "card";

          var q = document.createElement("div");
          q.className = "q";
          q.textContent = (++idx) + ". " + text;
          card.appendChild(q);

          LABELS.forEach(function (label, i) {
            var wrap = document.createElement("label");
            wrap.className = "opt";
            var value = i + 1;
            // uso comillas simples en HTML para minimizar errores
            wrap.innerHTML = '<input type="radio" name="q' + idx + '" value="' + value + '"> ' + label;
            card.appendChild(wrap);
          });

          $quiz.appendChild(card);
        });
      });
    }
    renderQuiz();

    // ===== LÓGICA =====
    function getAnswers() {
      var values = [];
      var answered = 0;
      for (var i = 1; i <= totalQuestions; i++) {
        var picked = document.querySelector('input[name="q' + i + '"]:checked');
        var v = picked ? Number(picked.value) : null;
        values.push(v);
        if (v !== null) answered++;
      }
      return { values: values, answered: answered };
    }

    function updateProgress() {
      var st = getAnswers();
      var pct = Math.round((st.answered / totalQuestions) * 100);
      $pct.textContent = pct + "%";
      $count.textContent = String(st.answered);
      $fill.style.width = pct + "%";
    }

    function sum(values) {
      return values.reduce(function (a, v) { return a + (v || 0); }, 0);
    }

    function classify(total) {
      for (var i = 0; i < RANGES.length; i++) {
        var r = RANGES[i];
        if (total >= r.min && total <= r.max) return r;
      }
      return RANGES[RANGES.length - 1];
    }

    document.addEventListener("change", function (e) {
      if (e.target && e.target.matches('input[type="radio"]')) updateProgress();
    });

    $btnOk.addEventListener("click", function () {
      var st = getAnswers();
      if (st.answered < totalQuestions) {
        alert("Por favor responde todas las preguntas.");
        return;
      }
      var total = sum(st.values);
      var r = classify(total);

      $result.style.display = "block";
      $result.innerHTML =
        '<h2>Resultado</h2>' +
        '<p>Puntaje total: <b>' + total + '</b></p>' +
        '<p class="badge ' + r.badge + '">' + r.title + '</p>' +
        '<p>' + r.text + '</p>';

      window.scrollTo({ top: $result.offsetTop - 10, behavior: "smooth" });
    });

    $btnRst.addEventListener("click", function () {
      var inputs = document.querySelectorAll('input[type="radio"]');
      inputs.forEach(function (i) { i.checked = false; });
      $result.style.display = "none";
      updateProgress();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Init
    updateProgress();
    console.log("Cuestionario activo ✔");
  } catch (err) {
    console.error("Error en app.js:", err);
    var box = document.getElementById("result");
    if (box) {
      box.style.display = "block";
      box.style.borderLeft = "6px solid #ef4444";
      box.innerHTML =
        "<h2 style='margin-top:0'>Error en el script</h2>" +
        "<pre style='white-space:pre-wrap'>" +
        (err && err.stack ? err.stack : String(err)) +
        "</pre>";
    }
  }
});
