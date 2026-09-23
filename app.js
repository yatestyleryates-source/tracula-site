import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const configured = !String(firebaseConfig.apiKey).startsWith("PASTE_");
let db = null;
if (configured) {
  db = getFirestore(initializeApp(firebaseConfig));
} else {
  console.warn("Tracula: Firebase isn't configured yet. Paste your config into firebase-config.js.");
}


const form = document.getElementById("lead-form");
const thanks = document.getElementById("thanks");
const errorBox = document.getElementById("form-error");
const sendBtn = document.getElementById("send");
const pills = Array.from(form.querySelectorAll("[data-help]"));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

pills.forEach((pill) => {
  pill.addEventListener("click", () => {
    const on = pill.getAttribute("aria-pressed") !== "true";
    pill.setAttribute("aria-pressed", String(on));
    pill.classList.toggle("pill-on", on);
  });
});

form.querySelectorAll("select.ln").forEach((sel) => {
  sel.addEventListener("change", () => {
    sel.classList.toggle("ln-filled", !!sel.value);
    sel.classList.toggle("ln-empty", !sel.value);
  });
});

["name", "store", "email"].forEach((key) => {
  form.elements[key].addEventListener("input", () => {
    form.elements[key].classList.remove("ln-err");
    form.elements[key].removeAttribute("aria-invalid");
  });
});

function value(key) {
  return (form.elements[key].value || "").trim();
}

function validate() {
  const problems = [];
  const flag = (key, msg) => {
    form.elements[key].classList.add("ln-err");
    form.elements[key].setAttribute("aria-invalid", "true");
    problems.push({ key, msg });
  };
  if (!value("name")) flag("name", "Enter your name.");
  if (!value("store")) flag("store", "Enter your store or company name.");
  if (!value("email")) flag("email", "Enter your email so we can reach you.");
  else if (!EMAIL_RE.test(value("email"))) flag("email", "That email doesn't look right. Check it and try again.");
  return problems;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorBox.textContent = "";

  // Bots fill in the hidden field. People never see it.
  if (value("website")) return;

  const problems = validate();
  if (problems.length) {
    errorBox.textContent = problems.map((p) => p.msg).join(" ");
    form.elements[problems[0].key].focus();
    return;
  }

  if (!db) {
    errorBox.textContent = "The form isn't connected yet. Email us in the meantime and we'll get right back to you.";
    return;
  }

  const lead = {
    name: value("name"),
    store: value("store"),
    email: value("email"),
    phone: value("phone"),
    role: value("role"),
    locations: value("locations"),
    help: pills.filter((p) => p.getAttribute("aria-pressed") === "true").map((p) => p.dataset.help),
    message: value("message"),
    source: value("source"),
    page: location.pathname,
    createdAt: serverTimestamp()
  };

  sendBtn.disabled = true;
  sendBtn.textContent = "Sending…";
  try {
    await addDoc(collection(db, "leads"), lead);
    const first = lead.name.split(/\s+/)[0];
    document.getElementById("thanks-title").textContent = `Thanks, ${first}. We've got it.`;
    document.getElementById("thanks-body").textContent = `We'll reach out soon to set up a time to talk about ${lead.store}.`;
    form.hidden = true;
    thanks.hidden = false;
    document.getElementById("thanks-title").focus();
  } catch (err) {
    console.error(err);
    errorBox.textContent = "Your note didn't send. Check your connection and try again.";
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "Start the conversation";
  }
});

document.getElementById("again").addEventListener("click", () => {
  form.reset();
  pills.forEach((p) => { p.setAttribute("aria-pressed", "false"); p.classList.remove("pill-on"); });
  form.querySelectorAll("select.ln").forEach((s) => { s.classList.remove("ln-filled"); s.classList.add("ln-empty"); });
  thanks.hidden = true;
  form.hidden = false;
  form.elements.name.focus();
});
