const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll("a[href^='#']").forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  });
});

const serviceTrack = document.querySelector("[data-service-track]");
const serviceCards = Array.from(document.querySelectorAll(".service-card"));
const serviceCurrent = document.querySelector("[data-service-current]");

function updateServiceCounter() {
  if (!serviceTrack || !serviceCards.length || !serviceCurrent) return;

  const trackCenter = serviceTrack.scrollLeft + serviceTrack.clientWidth / 2;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  serviceCards.forEach((card, index) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const distance = Math.abs(cardCenter - trackCenter);
    if (distance < closestDistance) {
      closestIndex = index;
      closestDistance = distance;
    }
  });

  serviceCurrent.textContent = String(closestIndex + 1).padStart(2, "0");
}

function moveServices(direction) {
  if (!serviceTrack) return;
  serviceTrack.scrollBy({
    left: direction * serviceTrack.clientWidth * 0.88,
    behavior: reducedMotion ? "auto" : "smooth",
  });
}

document.querySelector("[data-service-prev]")?.addEventListener("click", () => moveServices(-1));
document.querySelector("[data-service-next]")?.addEventListener("click", () => moveServices(1));
serviceTrack?.addEventListener("scroll", updateServiceCounter, { passive: true });
updateServiceCounter();

document.querySelectorAll("[data-case-lab]").forEach((lab) => {
  const cards = Array.from(lab.querySelectorAll("[data-case-card]"));
  const prev = lab.querySelector("[data-case-prev]");
  const next = lab.querySelector("[data-case-next]");
  const stack = lab.querySelector(".case-stack");
  let active = 0;
  let pointerStart = null;

  const render = () => {
    cards.forEach((card, index) => {
      card.classList.toggle("is-active", index === active);
      card.classList.toggle("is-prev", index === (active - 1 + cards.length) % cards.length);
      card.classList.toggle("is-next", index === (active + 1) % cards.length);
    });
  };

  const move = (direction) => {
    active = (active + direction + cards.length) % cards.length;
    render();
  };

  prev?.addEventListener("click", () => move(-1));
  next?.addEventListener("click", () => move(1));

  stack?.addEventListener("pointerdown", (event) => {
    pointerStart = event.clientX;
  });

  stack?.addEventListener("pointerup", (event) => {
    if (pointerStart === null) return;
    const distance = event.clientX - pointerStart;
    pointerStart = null;

    if (Math.abs(distance) > 45) move(distance > 0 ? -1 : 1);
  });

  stack?.addEventListener("pointercancel", () => {
    pointerStart = null;
  });

  render();
});

document.querySelectorAll("[data-review-lab]").forEach((lab) => {
  const cards = Array.from(lab.querySelectorAll("[data-review-card]"));
  const dotsContainer = lab.querySelector(".review-dots");
  let dots = Array.from(lab.querySelectorAll("[data-review-dot]"));
  const current = lab.querySelector("[data-review-current]");
  const total = lab.querySelector("[data-review-total]");
  const prev = lab.querySelector("[data-review-prev]");
  const next = lab.querySelector("[data-review-next]");
  const stack = lab.querySelector(".review-stack");
  let active = 0;
  let pointerStart = null;

  if (dotsContainer && dots.length !== cards.length) {
    const buttons = cards.map((_, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.reviewDot = String(index);
      button.setAttribute("aria-label", `Відгук ${index + 1}`);
      return button;
    });
    dotsContainer.replaceChildren(...buttons);
    dots = buttons;
  }

  const render = () => {
    cards.forEach((card, index) => {
      card.classList.toggle("is-active", index === active);
      card.classList.toggle("is-prev", index === (active - 1 + cards.length) % cards.length);
      card.classList.toggle("is-next", index === (active + 1) % cards.length);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === active);
    });

    if (current) current.textContent = String(active + 1).padStart(2, "0");
    if (total) total.textContent = String(cards.length).padStart(2, "0");
  };

  const move = (direction) => {
    active = (active + direction + cards.length) % cards.length;
    render();
  };

  prev?.addEventListener("click", () => move(-1));
  next?.addEventListener("click", () => move(1));

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      active = index;
      render();
    });
  });

  stack?.addEventListener("pointerdown", (event) => {
    pointerStart = event.clientX;
  });

  stack?.addEventListener("pointerup", (event) => {
    if (pointerStart === null) return;
    const distance = event.clientX - pointerStart;
    pointerStart = null;

    if (Math.abs(distance) > 45) move(distance > 0 ? -1 : 1);
  });

  stack?.addEventListener("pointercancel", () => {
    pointerStart = null;
  });

  render();
});

const formatSelect = document.querySelector("#format-select");

document.querySelectorAll("[data-format]").forEach((link) => {
  link.addEventListener("click", () => {
    const format = link.dataset.format;
    if (formatSelect && format) formatSelect.value = format;
  });
});

const form = document.querySelector("#lead-form");
const formError = document.querySelector("#form-error");
const telegramRecipient = "SilkaAlina";

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = Array.from(form.querySelectorAll("[required]"));
  let firstInvalid = null;

  fields.forEach((field) => {
    const invalid = !field.checkValidity();
    field.classList.toggle("is-invalid", invalid);
    if (invalid && !firstInvalid) firstInvalid = field;
  });

  if (firstInvalid) {
    if (formError) formError.textContent = "Будь ласка, заповніть усі поля коректно.";
    firstInvalid.focus();
    return;
  }

  if (formError) formError.textContent = "";
  const data = Object.fromEntries(new FormData(form).entries());
  sessionStorage.setItem("targetologyLead", JSON.stringify(data));

  const message = [
    "Нова заявка із сайту Аліни Силки",
    "",
    `Ім’я та ніша: ${data.name}`,
    `Сайт / Instagram: ${data.project_url}`,
    `Рекламний бюджет: ${data.budget}`,
    `Формат роботи: ${data.format}`,
    `Telegram клієнта: ${data.telegram}`,
  ].join("\n");

  window.location.href = `https://t.me/${telegramRecipient}?text=${encodeURIComponent(message)}`;
});
