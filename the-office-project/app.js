(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const header = document.querySelector(".site-header");
  const progress = document.getElementById("scrollProgress");
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];

  function updateScrollState() {
    const top = window.scrollY;
    const available = document.documentElement.scrollHeight - window.innerHeight;
    header?.classList.toggle("is-scrolled", top > 12);
    if (progress) progress.style.width = `${available > 0 ? (top / available) * 100 : 0}%`;
  }

  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  if ("IntersectionObserver" in window && navLinks.length) {
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: "-35% 0px -60%", threshold: 0 });
    sections.forEach((section) => navObserver.observe(section));
  }

  const workflow = document.querySelector("[data-workflow]");
  if (workflow) {
    const steps = [...workflow.querySelectorAll(".flow-step")];
    const title = document.getElementById("workflowTitle");
    const event = document.getElementById("workflowEvent");
    const detailTitle = document.getElementById("workflowDetailTitle");
    const description = document.getElementById("workflowDescription");
    const proof = document.getElementById("workflowProof");
    const terminal = document.getElementById("workflowTerminal");
    const previous = document.getElementById("workflowPrev");
    const next = document.getElementById("workflowNext");
    const play = document.getElementById("workflowPlay");
    const scenes = [
      {
        title: "01 — Orientarse",
        event: "PROJECT.CURRENT",
        heading: "Primero, entender dónde está.",
        description: "El agente refresca el proyecto activo y recibe el contexto mínimo para actuar sobre el repositorio correcto.",
        proof: "Monitor actualizado + agente en zona de proyecto",
        terminal: [
          ["command", "office-project current bruce-lee"],
          ["output", "active_project: micromundo"],
          ["output", "team: richard, jared, bruce-lee, gilfoyle"]
        ]
      },
      {
        title: "02 — Coordinarse",
        event: "CHAT.READ",
        heading: "Leer antes de irrumpir.",
        description: "Consulta la conversación reciente, identifica dependencias y deja un mensaje solo cuando aporta coordinación real.",
        proof: "Contexto compartido + mensaje trazado si hace falta",
        terminal: [
          ["command", "office-chat read bruce-lee --limit 15"],
          ["output", "15 messages loaded"],
          ["output", "dependency: research findings available"]
        ]
      },
      {
        title: "03 — Elegir trabajo",
        event: "KANBAN.ASSIGN",
        heading: "Una tarea concreta, no una nube de intención.",
        description: "Revisa el tablero, elige una tarjeta compatible con su rol y la mueve a trabajo en curso antes de tocar código.",
        proof: "Responsable, prioridad e histórico visibles",
        terminal: [
          ["command", "office-kanban list bruce-lee"],
          ["output", "candidate: task_908 · HIGH"],
          ["command", "office-kanban move bruce-lee task_908 IN_PROGRESS"]
        ]
      },
      {
        title: "04 — Declarar intención",
        event: "AGENT.THINK",
        heading: "El plan aparece antes que los cambios.",
        description: "Registra qué va a comprobar, qué modificará y cómo sabrá que ha terminado. La oficina representa esa intención.",
        proof: "Bocadillo de pensamiento + evento persistido",
        terminal: [
          ["command", "office-event think bruce-lee task_908"],
          ["output", "intent: reproduce → patch → verify"],
          ["output", "event stored"]
        ]
      },
      {
        title: "05 — Ejecutar",
        event: "WORK.STARTED",
        heading: "Trabajar en el repositorio real.",
        description: "El agente entra en su clon, inspecciona el estado y realiza cambios acotados. La oficina coordina; no finge la ejecución.",
        proof: "Agente en escritorio + tarea vinculada",
        terminal: [
          ["command", "git status --short"],
          ["output", "working tree inspected"],
          ["command", "apply scoped implementation"]
        ]
      },
      {
        title: "06 — Verificar",
        event: "WORK.VERIFIED",
        heading: "La evidencia decide si está hecho.",
        description: "Ejecuta las pruebas adecuadas, comprueba el comportamiento y conserva resultados útiles para el reporte final.",
        proof: "Pruebas, salida y criterio de aceptación",
        terminal: [
          ["command", "pytest -q"],
          ["output", "42 passed in 3.18s"],
          ["command", "git diff --check"],
          ["output", "clean"]
        ]
      },
      {
        title: "07 — Entregar",
        event: "DEPLOY.RECORDED",
        heading: "Cerrar el circuito, no solo el editor.",
        description: "La entrega queda asociada a un commit verificable; después se actualizan kanban, reporte y estado del agente.",
        proof: "Commit + push + reporte + tarjeta terminada",
        terminal: [
          ["command", "office-deploy commit-push bruce-lee"],
          ["output", "push: verified · commit: 9fd21a"],
          ["command", "office-report done bruce-lee task_908"]
        ]
      }
    ];
    let active = 0;
    let playing = !prefersReducedMotion.matches;
    let timer;

    function terminalMarkup(lines) {
      return lines.map(([kind, value]) => {
        if (kind === "command") return `<p><span class="prompt">›</span> ${value}</p>`;
        return `<p class="terminal-output">${value}</p>`;
      }).join("") + '<p class="terminal-cursor">█</p>';
    }

    function render(index, focus = false) {
      active = (index + scenes.length) % scenes.length;
      const scene = scenes[active];
      steps.forEach((step, stepIndex) => {
        const selected = stepIndex === active;
        step.classList.toggle("is-active", selected);
        step.setAttribute("aria-pressed", String(selected));
      });
      title.textContent = scene.title;
      event.textContent = scene.event;
      detailTitle.textContent = scene.heading;
      description.textContent = scene.description;
      proof.textContent = scene.proof;
      terminal.innerHTML = terminalMarkup(scene.terminal);
      const track = steps[active].parentElement;
      const targetLeft = steps[active].offsetLeft - (track.clientWidth - steps[active].clientWidth) / 2;
      track.scrollTo({ left: Math.max(0, targetLeft), behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
      if (focus) steps[active].focus({ preventScroll: true });
    }

    function updatePlayButton() {
      play.textContent = playing ? "Ⅱ" : "▶";
      play.setAttribute("aria-label", playing ? "Pausar animación" : "Reanudar animación");
      play.setAttribute("aria-pressed", String(playing));
    }

    function schedule() {
      window.clearInterval(timer);
      if (playing && !document.hidden) timer = window.setInterval(() => render(active + 1), 4800);
    }

    steps.forEach((step, index) => step.addEventListener("click", () => {
      render(index);
      schedule();
    }));
    previous.addEventListener("click", () => { render(active - 1, true); schedule(); });
    next.addEventListener("click", () => { render(active + 1, true); schedule(); });
    play.addEventListener("click", () => {
      playing = !playing;
      updatePlayButton();
      schedule();
    });
    document.addEventListener("visibilitychange", schedule);
    prefersReducedMotion.addEventListener?.("change", (media) => {
      if (media.matches) playing = false;
      updatePlayButton();
      schedule();
    });
    render(0);
    updatePlayButton();
    schedule();
  }

  document.querySelectorAll("[data-shot]").forEach((figure) => {
    const image = figure.querySelector("img[data-src]");
    if (!image) return;
    image.addEventListener("load", () => figure.classList.add("has-image"));
    image.addEventListener("error", () => {
      figure.classList.remove("has-image");
      image.removeAttribute("src");
    });
    image.src = image.dataset.src;
  });
})();
