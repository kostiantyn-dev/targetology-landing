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
  let active = 0;

  const render = () => {
    cards.forEach((card, index) => {
      card.classList.toggle("is-active", index === active);
      card.classList.toggle("is-prev", index === (active - 1 + cards.length) % cards.length);
      card.classList.toggle("is-next", index === (active + 1) % cards.length);
    });
  };

  prev?.addEventListener("click", () => {
    active = (active - 1 + cards.length) % cards.length;
    render();
  });

  next?.addEventListener("click", () => {
    active = (active + 1) % cards.length;
    render();
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
  window.location.href = "thank-you.html";
});
