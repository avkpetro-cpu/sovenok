const tg = window.Telegram?.WebApp;

const FORCE_LIGHT_BG = "#F7F8FC";
const FORCE_LIGHT_HEADER = "#FFFFFF";

if (tg) {
  tg.ready();

  // Важно: эти методы меняют фон "оболочки" Telegram
  tg.setBackgroundColor(FORCE_LIGHT_BG);
  tg.setHeaderColor(FORCE_LIGHT_HEADER);

  // На iOS иногда помогает расширить
  tg.expand();
}

if (tg) tg.ready();

const C = window.APP_CONTENT;

const screens = ["home", "about", "programs", "schedule", "team", "pricing", "gallery", "faq", "contacts"];
let historyStack = ["home"];

const el = (id) => document.getElementById(id);

const modal = () => el("modal");

function openModal() {
  modal().classList.add("open");
  modal().setAttribute("aria-hidden", "false");
  const bb = document.querySelector(".bottombar");
  if (bb) bb.style.display = "none";
}

function closeModal() {
  modal().classList.remove("open");
  modal().setAttribute("aria-hidden", "true");
  const bb = document.querySelector(".bottombar");
  if (bb) bb.style.display = "";
}



function setAppTexts() {
  document.title = C.name;
  el("appName").textContent = C.name;
  el("appSubtitle").textContent = C.subtitle || "";

  el("heroTitle").textContent = C.hero?.title || C.name;
  el("heroDesc").textContent = C.hero?.desc || "";

  // CTA + Telegram link
  const username = C.telegram?.username;
  const start = encodeURIComponent(C.telegram?.startMessage || "Здравствуйте!");
  const link = username ? `https://t.me/${username}?text=${start}` : "#";

  const tgLink = el("tgLink");
  tgLink.href = link;

 el("primaryCta").addEventListener("click", () => {
  openModal();
});


  el("callBtn").addEventListener("click", () => {
    const phone = (C.phone || "").trim();
    if (!phone) return;
    window.location.href = `tel:${phone.replace(/\s/g, "")}`;
  });

  // Share (просто копируем ссылку на бота/чат — без бэка)
  el("shareBtn").addEventListener("click", async () => {
    const shareText = `${C.name} — ${C.subtitle || ""}`.trim();
    const shareLink = username ? `https://t.me/${username}` : window.location.href;

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareLink}`);
      toast("Скопировано в буфер обмена");
    } catch {
      toast("Не удалось скопировать");
    }
  });
}

function render() {
  // About
  el("aboutText").textContent = C.about?.text || "";
  const benefits = el("benefitsList");
  benefits.innerHTML = "";
  (C.about?.benefits || []).forEach((b) => {
    const li = document.createElement("li");
    li.textContent = b;
    benefits.appendChild(li);
  });

  // Programs
  const programs = el("programsList");
  programs.innerHTML = "";
  (C.programs || []).forEach((p) => programs.appendChild(renderCard(p.title, p.desc, p.bullets)));

    // Schedule
  const schedule = el("scheduleList");
  if (schedule) {
    schedule.innerHTML = "";
    const items = C.schedule?.items || [];
    items.forEach((it) => schedule.appendChild(renderScheduleItem(it)));
  }

  // Team
  const team = el("teamList");
  if (team) {
    team.innerHTML = "";
    const members = C.team?.members || [];
    members.forEach((m) => team.appendChild(renderTeamMember(m)));
  }


  // Pricing
  const pricing = el("pricingList");
  pricing.innerHTML = "";
  (C.pricing?.items || []).forEach((x) => pricing.appendChild(renderPrice(x)));
  el("pricingNote").textContent = C.pricing?.note || "";

  // FAQ
  const faq = el("faqList");
  faq.innerHTML = "";
  (C.faq || []).forEach((item) => faq.appendChild(renderFaq(item.q, item.a)));

  // Contacts
  const contacts = el("contactsList");
  contacts.innerHTML = "";
  (C.contacts || []).forEach((c) => contacts.appendChild(renderContact(c)));

  // Gallery
  const gallery = el("galleryGrid");
  gallery.innerHTML = "";
  const photos = C.gallery?.photos || [];
  if (photos.length === 0) {
    const empty = document.createElement("div");
    empty.className = "hint muted";
    empty.textContent = "Добавь фотографии в assets/photos и перечисли их в content.js";
    gallery.appendChild(empty);
  } else {
    photos.forEach((file) => {
      const img = document.createElement("img");
      img.className = "photo";
      img.src = `assets/photos/${file}`;
      img.alt = "Фото";
      img.loading = "lazy";
      img.addEventListener("click", () => openImageViewer(img.src));
      gallery.appendChild(img);
    });
  }
}

function renderCard(title, desc, bullets = []) {
  const wrap = document.createElement("div");
  wrap.className = "block cardBlock";

  const h = document.createElement("div");
  h.className = "cardBlock__title";
  h.textContent = title;

  const p = document.createElement("div");
  p.className = "muted";
  p.textContent = desc || "";

  wrap.appendChild(h);
  wrap.appendChild(p);

  if (bullets?.length) {
    const ul = document.createElement("ul");
    ul.className = "list";
    bullets.forEach((b) => {
      const li = document.createElement("li");
      li.textContent = b;
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
  }

  return wrap;
}

function renderPrice(x) {
  const wrap = document.createElement("div");
  wrap.className = "block price";

  const left = document.createElement("div");
  const t = document.createElement("div");
  t.className = "price__title";
  t.textContent = x.title;

  const d = document.createElement("div");
  d.className = "muted";
  d.textContent = x.desc || "";

  left.appendChild(t);
  left.appendChild(d);

  const right = document.createElement("div");
  right.className = "price__value";
  right.textContent = x.price;

  wrap.appendChild(left);
  wrap.appendChild(right);
  return wrap;
}

function renderFaq(q, a) {
  const wrap = document.createElement("details");
  wrap.className = "block faq";

  const s = document.createElement("summary");
  s.textContent = q;

  const p = document.createElement("div");
  p.className = "muted";
  p.textContent = a;

  wrap.appendChild(s);
  wrap.appendChild(p);
  return wrap;
}

function renderContact(c) {
  const wrap = document.createElement("div");
  wrap.className = "block contact";

  const t = document.createElement("div");
  t.className = "contact__title";
  t.textContent = c.title || "Контакты";

  const a = document.createElement("div");
  a.className = "muted";
  a.textContent = c.address || "";

  const h = document.createElement("div");
  h.className = "muted";
  h.textContent = c.hours || "";

  wrap.appendChild(t);
  wrap.appendChild(a);
  wrap.appendChild(h);

  return wrap;
}

function renderScheduleItem(it) {
  const wrap = document.createElement("div");
  wrap.className = "block scheduleItem";

  const row = document.createElement("div");
  row.className = "scheduleRow";

  const time = document.createElement("div");
  time.className = "scheduleTime";
  time.textContent = it.time || "";

  const right = document.createElement("div");
  const title = document.createElement("div");
  title.className = "scheduleTitle";
  title.textContent = it.title || "";

  const desc = document.createElement("div");
  desc.className = "muted";
  desc.textContent = it.desc || "";

  right.appendChild(title);
  right.appendChild(desc);

  row.appendChild(time);
  row.appendChild(right);

  wrap.appendChild(row);
  return wrap;
}

function renderTeamMember(m) {
  const wrap = document.createElement("div");
  wrap.className = "block teamMember";

  const name = document.createElement("div");
  name.className = "teamName";
  name.textContent = m.name || "Сотрудник";

  const role = document.createElement("div");
  role.className = "muted";
  role.textContent = m.role || "";

  const bio = document.createElement("div");
  bio.className = "muted";
  bio.style.marginTop = "8px";
  bio.textContent = m.bio || "";

  wrap.appendChild(name);
  wrap.appendChild(role);
  wrap.appendChild(bio);

  return wrap;
}


function showScreen(id, pushHistory = true) {
  if (!screens.includes(id)) id = "home";

  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  el(id).classList.add("active");

  // Tabs active state
  document.querySelectorAll(".tab").forEach((b) => {
    b.classList.toggle("active", b.dataset.nav === id);
  });

  // Back button
  const isHome = id === "home";
  el("backBtn").style.display = isHome ? "none" : "inline-flex";
  if (tg?.BackButton) {
    if (isHome) tg.BackButton.hide();
    else tg.BackButton.show();
  }

  // History
  if (pushHistory) {
    const current = historyStack[historyStack.length - 1];
    if (current !== id) historyStack.push(id);
  }

  // URL hash (чтобы можно было обновлять страницу)
  if (location.hash !== `#${id}`) {
    history.replaceState(null, "", `#${id}`);
  }
}

function goBack() {
  if (historyStack.length > 1) {
    historyStack.pop();
    const prev = historyStack[historyStack.length - 1];
    showScreen(prev, false);
  } else {
    showScreen("home", false);
  }
}

function setupNav() {
  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => showScreen(btn.dataset.nav));
  });

  el("backBtn").addEventListener("click", goBack);

  if (tg?.BackButton) {
    tg.BackButton.onClick(goBack);
  }

  // hash routing
  const initial = (location.hash || "#home").replace("#", "");
  showScreen(initial, false);
}

function applyTelegramTheme() {
  const p = tg?.themeParams;
  if (!p) return;

  const root = document.documentElement;

  // Не используем p.bg_color, потому что он может быть чёрный
  // и ты как раз хочешь всегда светлый фон.
  root.style.setProperty("--tg-bg", FORCE_LIGHT_BG);

  if (p.text_color) root.style.setProperty("--tg-text", p.text_color);
  if (p.hint_color) root.style.setProperty("--tg-hint", p.hint_color);

  // Кнопки можно оставить как есть или тоже зафиксировать
  root.style.setProperty("--tg-btn", p.button_color || "#5B8DEF");
  root.style.setProperty("--tg-btn-text", p.button_text_color || "#ffffff");
}


function toast(text) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 200);
  }, 1500);
}

function openImageViewer(src) {
  const overlay = document.createElement("div");
  overlay.className = "viewer";
  overlay.addEventListener("click", () => overlay.remove());

  const img = document.createElement("img");
  img.src = src;
  img.alt = "Фото";
  overlay.appendChild(img);

  document.body.appendChild(overlay);
}

function setupLeadForm() {
  // Тексты
  const lf = C.leadForm || {};
  el("modalTitle").textContent = lf.title || "Запись";
  el("modalSubtitle").textContent = lf.subtitle || "";

  el("fNameLabel").textContent = lf.fields?.nameLabel || "Имя";
  el("fAgeLabel").textContent = lf.fields?.childAgeLabel || "Возраст ребёнка";
  el("fTimeLabel").textContent = lf.fields?.timeLabel || "Удобное время";
  el("fNoteLabel").textContent = lf.fields?.noteLabel || "Комментарий";

  // Options
  const select = el("fTime");
  select.innerHTML = "";
  (lf.timeOptions || ["Утро", "День", "Вечер", "Не важно"]).forEach((opt) => {
    const o = document.createElement("option");
    o.value = opt;
    o.textContent = opt;
    select.appendChild(o);
  });

  // Close handlers
  el("modalClose").addEventListener("click", closeModal);
  el("cancelLeadBtn").addEventListener("click", closeModal);
  modal().querySelector("[data-close='1']").addEventListener("click", closeModal);

  // Telegram MainButton (если доступен)
  if (tg?.MainButton) {
    tg.MainButton.setText("Отправить заявку");
    tg.MainButton.hide();

    // Показать MainButton только когда модалка открыта
    const observer = new MutationObserver(() => {
      const isOpen = modal().classList.contains("open");
      if (isOpen) {
        tg.MainButton.show();
      } else {
        tg.MainButton.hide();
      }
    });
    observer.observe(modal(), { attributes: true, attributeFilter: ["class"] });

    tg.MainButton.onClick(() => submitLead());
  }

  // Submit form
  el("leadForm").addEventListener("submit", (e) => {
    e.preventDefault();
    submitLead();
  });
}

function submitLead() {
  const name = (el("fName").value || "").trim();
  const age = (el("fAge").value || "").trim();
  const time = (el("fTime").value || "").trim();
  const note = (el("fNote").value || "").trim();

  // Простая валидация
  if (name.length < 2) {
    toast("Введите имя (минимум 2 символа)");
    el("fName").focus();
    return;
  }
  if (age.length < 1) {
    toast("Укажите возраст ребёнка");
    el("fAge").focus();
    return;
  }

  const text =
`Здравствуйте! Хочу записаться на экскурсию.
Имя: ${name}
Возраст ребёнка: ${age}
Удобное время: ${time || "—"}
Комментарий: ${note || "—"}`;

  const username = C.telegram?.username;
  if (!username) {
    toast("Не задан telegram.username в content.js");
    return;
  }

  const encoded = encodeURIComponent(text);
  const link = `https://t.me/${username}?text=${encoded}`;

  // Нативно внутри Telegram
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(link);
  } else {
    window.open(link, "_blank");
  }

  toast(C.leadForm?.successToast || "Готово!");
  closeModal();

  // очистим форму
  el("fNote").value = "";
}


// Init
applyTelegramTheme();
setAppTexts();
render();
setupNav();
setupLeadForm();
