(() => {
  const scenes = document.querySelectorAll("[data-business-card-scene]");
  if (!scenes.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hasFinePointer = window.matchMedia("(pointer: fine)");

  scenes.forEach((scene) => {
    const card = scene.querySelector("[data-business-card]");
    const status = scene.querySelector("[data-business-card-status]");
    const image = scene.querySelector("[data-business-card-image]");

    if (!card || !image) {
      return;
    }

    const flipDurationMs = prefersReducedMotion.matches ? 0 : 720;

    let targetX = -8;
    let targetY = 10;
    let currentX = targetX;
    let currentY = targetY;
    let frameId = null;
    let isBackShowing = false;
    let isAnimatingFlip = false;
    let swapTimerId = null;
    let flipEndTimerId = null;

    card.style.setProperty("--business-card-flip-duration", `${flipDurationMs}ms`);

    const updateLabels = (flipped) => {
      const action = flipped
        ? "Show the front of Salvador Guzman's business card"
        : "Show the back of Salvador Guzman's business card";
      const state = flipped
        ? "Showing the back of the business card"
        : "Showing the front of the business card";

      card.setAttribute("aria-label", action);
      card.setAttribute("aria-pressed", String(flipped));
      if (status) {
        status.textContent = state;
      }
    };

    const render = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      scene.style.setProperty("--card-rotate-x", `${currentX.toFixed(2)}deg`);
      scene.style.setProperty("--card-rotate-y", `${currentY.toFixed(2)}deg`);

      if (Math.abs(targetX - currentX) > 0.02 || Math.abs(targetY - currentY) > 0.02) {
        frameId = window.requestAnimationFrame(render);
      } else {
        frameId = null;
      }
    };

    const queueRender = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const resetTilt = () => {
      targetX = -8;
      targetY = 10;
      queueRender();
    };

    if (!prefersReducedMotion.matches && hasFinePointer.matches) {
      window.addEventListener("pointermove", (event) => {
        const { innerWidth, innerHeight } = window;
        const px = innerWidth ? event.clientX / innerWidth : 0.5;
        const py = innerHeight ? event.clientY / innerHeight : 0.5;

        targetX = (0.5 - py) * 14 - 4;
        targetY = (px - 0.5) * 22;
        queueRender();
      });

      window.addEventListener("pointerleave", resetTilt);
      window.addEventListener("blur", resetTilt);
      window.addEventListener("resize", resetTilt);
      queueRender();
    } else {
      scene.style.setProperty("--card-rotate-x", "-4deg");
      scene.style.setProperty("--card-rotate-y", "0deg");
    }

    card.addEventListener("click", () => {
      if (isAnimatingFlip) {
        return;
      }

      isAnimatingFlip = true;
      const nextShowsBack = !isBackShowing;

      card.classList.add("is-flipping");
      card.classList.toggle("is-flipped", nextShowsBack);
      updateLabels(nextShowsBack);

      swapTimerId = window.setTimeout(() => {
        image.src = nextShowsBack ? image.dataset.backSrc : image.dataset.frontSrc;
        image.alt = nextShowsBack ? image.dataset.backAlt : image.dataset.frontAlt;
        isBackShowing = nextShowsBack;
      }, prefersReducedMotion.matches ? 0 : 24);

      flipEndTimerId = window.setTimeout(() => {
        isAnimatingFlip = false;
        card.classList.remove("is-flipping");
        swapTimerId = null;
        flipEndTimerId = null;
      }, flipDurationMs);
    });

    updateLabels(false);
  });
})();
