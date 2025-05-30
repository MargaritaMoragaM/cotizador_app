document.addEventListener("DOMContentLoaded", () => {
  // ==== ELEMENTOS DEL DOM PRINCIPALES ====
  const steps = [...document.querySelectorAll(".form-step")];
  const nextBtns = [...document.querySelectorAll(".next")];
  const prevBtns = [...document.querySelectorAll(".prev")];
  const progressSteps = [...document.querySelectorAll(".progress-bar .step")];
  const options = [...document.querySelectorAll(".option")];
  const tipoInput = document.getElementById("tipo");
  const opcionesWeb = document.getElementById("opciones-web");
  const opcionesDatos = document.getElementById("opciones-datos");
  const resultadoDiv = document.getElementById("resultado");
  const emailInput = document.getElementById("email");
  const alerta = document.getElementById("alerta");

  let currentStep = 0;
  let tipoSeleccionado = "";

  // ==== FUNCIONES DE UTILIDAD ====

  // Mostrar mensajes de alerta personalizados
  function mostrarAlerta(tipo, mensaje) {
    alerta.className = "alerta"; // Limpiar clases previas
    alerta.innerHTML = "";

    let icono = "";
    if (tipo === "info") icono = "ℹ️";
    else if (tipo === "error") icono = "❌";
    else if (tipo === "success") icono = "✅";
    else if (tipo === "loading") icono = "⏳";

    alerta.innerHTML = `<span class="icono">${icono}</span> ${mensaje}`;
    alerta.classList.add(tipo);
    alerta.classList.remove("oculto");

    // Ocultar alerta automáticamente si no es loading
    if (tipo !== "loading") {
      setTimeout(() => alerta.classList.add("oculto"), 3000);
    }
  }

  // Selección de tipo de servicio
  options.forEach(option => {
    option.addEventListener("click", () => {
      options.forEach(o => o.classList.remove("selected"));
      option.classList.add("selected");
      tipoSeleccionado = option.getAttribute("data-value");
      tipoInput.value = tipoSeleccionado;

      // Mostrar solo el formulario correspondiente
      if (tipoSeleccionado === "web") {
        opcionesWeb.style.display = "block";
        opcionesDatos.style.display = "none";
      } else {
        opcionesWeb.style.display = "none";
        opcionesDatos.style.display = "block";
      }
    });
  });

  // Actualizar el paso visual del formulario
  function updateStep() {
    steps.forEach((step, idx) => {
      step.classList.toggle("active", idx === currentStep);
      progressSteps[idx].classList.toggle("active", idx <= currentStep);
    });
  }

  // Validar campos por paso
  function validarPaso() {
    if (currentStep === 0 && !tipoSeleccionado) {
      mostrarAlerta("error", "Por favor, selecciona un tipo de servicio");
      return false;
    }

    if (currentStep === 1) {
      if (tipoSeleccionado === "web") {
        const plazo = document.getElementById("plazo");
        if (!plazo.value || plazo.value <= 0) {
          mostrarAlerta("error", "Por favor, ingresa un plazo válido");
          return false;
        }
      } else {
        const visualizaciones = document.getElementById("visualizaciones");
        if (!visualizaciones.value || visualizaciones.value <= 0) {
          mostrarAlerta("error", "Por favor, ingresa un número válido de visualizaciones");
          return false;
        }
      }
    }

    if (currentStep === 2) {
      if (!emailInput.value || !validarEmail(emailInput.value)) {
        mostrarAlerta("error", "Por favor, ingresa un correo electrónico válido");
        return false;
      }
    }

    return true;
  }

  // Validar email con expresión regular
  function validarEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  // Mostrar resultado de cotización basado en la selección
  function mostrarResultado() {
  let texto = "";
  if (tipoSeleccionado === "web") {
    const complejidad = document.getElementById("complejidad").value;
    const plazo = parseInt(document.getElementById("plazo").value, 10);
    const funcionalidad = document.getElementById("funcionalidad").value;
    const diseno = document.getElementById("diseno").value;

    let base = 500;
    if (complejidad === "media") base += 300;
    else if (complejidad === "alta") base += 700;

    base += plazo * 20;

    if (funcionalidad === "auth") base += 150;
    else if (funcionalidad === "admin") base += 120;
    else if (funcionalidad === "ecommerce") base += 200;
    else if (funcionalidad === "pagos") base += 180;

    if (diseno === "responsive") base += 100;
    else if (diseno === "personalizado") base += 200;
    else if (diseno === "oscuro") base += 80;

    texto = `Servicio: Desarrollo Web<br>
    Complejidad: ${complejidad}<br>
    Plazo: ${plazo} días<br>
    Funcionalidad: ${funcionalidad}<br>
    Diseño: ${diseno}<br>
    Precio estimado: $${base.toFixed(2)}`;
  } else {
    const tipoAnalisis = document.getElementById("tipo-analisis").value;
    const volumen = document.getElementById("volumen").value;
    const visualizaciones = parseInt(document.getElementById("visualizaciones").value, 10);
    const frecuencia = document.getElementById("frecuencia").value;

    let base = 400;
    if (volumen === "mediano") base += 250;
    else if (volumen === "grande") base += 600;

    base += visualizaciones * 50;

    if (frecuencia === "semanal") base *= 1.2;
    else if (frecuencia === "mensual") base *= 1.5;

    texto = `Servicio: Análisis de Datos<br>
    Tipo de análisis: ${tipoAnalisis}<br>
    Volumen: ${volumen}<br>
    Visualizaciones: ${visualizaciones}<br>
    Frecuencia: ${frecuencia}<br>
    Precio estimado: $${base.toFixed(2)}`;
  }
  resultadoDiv.innerHTML = texto;
}
  // ==== BOTONES DE NAVEGACIÓN ====
  nextBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (!validarPaso()) return;

      if (currentStep < steps.length - 1) {
        currentStep++;
        limpiarCamposPaso(currentStep); // Limpiar campos según paso
        updateStep();

        if (currentStep === 2) {
          mostrarResultado(); // Mostrar resultado solo en el último paso
        }
      }
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (currentStep > 0) {
        // Si se vuelve del paso 2, limpiar resultado y email
        if (currentStep === 2) {
          resultadoDiv.innerHTML = "";
          emailInput.value = "";
          document.getElementById("email-container").style.display = "none";
          document.getElementById("btn-email-show").style.display = "inline-block";
        }

        currentStep--;
        updateStep();
      }
    });
  });

  // ==== DESCARGAR PDF ====
  document.getElementById("btn-pdf").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Cotización de Servicios", 10, 20);
    doc.setFontSize(14);

    const textLines = resultadoDiv.textContent.split("\n");
    doc.text(textLines, 10, 40);
    doc.save("cotizacion.pdf");
  });

  // ==== MOSTRAR INPUT DE EMAIL ====
  document.getElementById("btn-email-show").addEventListener("click", () => {
    document.getElementById("email-container").style.display = "block";
    document.getElementById("btn-email-show").style.display = "none";
  });

  // ==== ENVÍO DE CORREO ====
  document.getElementById("btn-email-send").addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const contenido = resultadoDiv.textContent.trim();

    if (!email) {
      mostrarAlerta("error", "Por favor ingresa un correo.");
      return;
    }

    if (!validarEmail(email)) {
      mostrarAlerta("error", "Por favor ingresa un correo válido.");
      return;
    }

    try {
      mostrarAlerta("loading", "Enviando correo, por favor espera...");

      const response = await fetch("http://localhost:3000/enviar-correo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, contenido }),
      });

      const data = await response.json();
      if (!response.ok) {
        mostrarAlerta("error", "Error al enviar correo: " + (data.message || "Desconocido"));
        return;
      }

      mostrarAlerta("success", data.message || "Correo enviado correctamente.");
    } catch (error) {
      console.error("Error en la petición:", error);
      mostrarAlerta("error", "Ocurrió un error al enviar el correo.");
    }
  });

  // ==== ENVÍO FINAL DEL FORMULARIO ====
  document.getElementById("formulario").addEventListener("submit", e => {
    e.preventDefault();

    // Validaciones finales antes de enviar
    if (tipoSeleccionado === "web") {
      const plazo = document.getElementById("plazo");
      if (!plazo.value || parseInt(plazo.value) < 1) {
        mostrarAlerta("error", "Por favor completa el plazo correctamente.");
        return;
      }
    }

    if (tipoSeleccionado === "datos") {
      const visualizaciones = document.getElementById("visualizaciones");
      if (!visualizaciones.value || parseInt(visualizaciones.value) < 1) {
        mostrarAlerta("error", "Por favor completa la cantidad de visualizaciones.");
        return;
      }
    }

    if (document.getElementById("email-container").style.display !== "none") {
      const email = emailInput.value.trim();
      if (!validarEmail(email)) {
        mostrarAlerta("error", "Por favor ingresa un correo válido.");
        return;
      }
    }

    // Redireccionar a pantalla de agradecimiento
    window.location.href = "gracias.html";
  });

  // Limpiar campos según el paso actual
  function limpiarCamposPaso(paso) {
    if (paso === 0) {
      tipoInput.value = "";
      tipoSeleccionado = "";
      options.forEach(o => o.classList.remove("selected"));
      opcionesWeb.style.display = "none";
      opcionesDatos.style.display = "none";
    }

    if (paso === 1) {
      // Campos web
      document.getElementById("complejidad").value = "";
      document.getElementById("plazo").value = "";
      document.getElementById("funcionalidad").value = "";
      document.getElementById("diseno").value = "";

      // Campos datos
      document.getElementById("volumen").value = "";
      document.getElementById("visualizaciones").value = "";
      document.getElementById("frecuencia").value = "";
    }

    if (paso === 2) {
      resultadoDiv.innerHTML = "";
      emailInput.value = "";
      document.getElementById("email-container").style.display = "none";
      document.getElementById("btn-email-show").style.display = "inline-block";
    }
  }

  // Inicializar estado visual
  updateStep();
});
