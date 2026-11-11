/* Preview-only service catalog renderer. No secrets, login, customer data or mutating API calls. */
const cards = document.getElementById("service-cards");
const nav = document.getElementById("service-nav");
const selectedTitle = document.getElementById("detail-title");
const mobileActions = document.getElementById("mobile-actions");
const webActions = document.getElementById("web-actions");
const status = document.getElementById("service-availability");
const explore = document.getElementById("explore-service");
const count = document.getElementById("total-services");
const filters = [...document.querySelectorAll(".w-filter")];

const spanish=document.documentElement.lang==="es";
const localizedGroups={
  communication:"Comunicación",intelligence:"Inteligencia",
  "digital-presence":"Presencia digital",operations:"Operaciones",
  customers:"Clientes",growth:"Crecimiento"
};
const spanishDescriptions={
  "smart-call":"Llamadas y traducción en la app. Configuración de línea e idiomas desde la web.",
  "ai-agents":"Diseño, revisión y control de asistentes inteligentes para tu negocio.",
  "web-services":"Presencia digital, páginas web y consultas de clientes.",
  inventory:"Existencias en el móvil y configuración detallada del catálogo en la web.",
  scheduling:"Agenda diaria en el teléfono y reglas avanzadas de reservas en la web.",
  "crm-leads":"Contactos y seguimientos rápidos con el embudo completo en la web.",
  "business-operations":"Pedidos, equipos y tareas administrativas del negocio.",
  "marketing-analytics":"Indicadores básicos en la app e informes completos en la web.",
  automations:"Alertas y aprobaciones en la app; flujos avanzados en la web."
};
const groupNames = {
  communication: "Communication",
  intelligence: "Intelligence",
  "digital-presence": "Digital Presence",
  operations: "Operations",
  customers: "Customers",
  growth: "Growth",
};
const serviceDescriptions = {
  "smart-call": "Calls and language support belong in the mobile phone experience. Setup belongs on the web.",
  "ai-agents": "Design, review and supervise assistants that support your customer conversations.",
  "web-services": "Manage your company's online presence and connected website inquiries.",
  inventory: "Keep stock checks quick on mobile and detailed catalog management on the web.",
  scheduling: "Daily appointments on the phone, complete scheduling rules on the web.",
  "crm-leads": "Keep customer context connected while managing the full pipeline online.",
  "business-operations": "Organize orders, team responsibilities and administrative workflows.",
  "marketing-analytics": "Review performance snapshots on mobile and explore reporting on the web.",
  automations: "Monitor workflow results on the phone; create and refine rules on the web.",
};
const friendly = value => value.split("-").map(word => word[0]?.toUpperCase() + word.slice(1)).join(" ");
const make = (tag, className, value) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value != null) element.textContent = value;
  return element;
};
function fillList(target, actions) {
  target.replaceChildren(...actions.map(action => make("li", null, friendly(action))));
}
function showService(module, push = true) {
  selectedTitle.replaceChildren(
    document.createTextNode(module.name),
    document.createElement("br"),
    make("strong", null, spanish?"App + web.":"App + web.")
  );
  fillList(mobileActions, module.mobile.actions);
  fillList(webActions, module.web.actions);
  status.textContent = spanish?"Vista previa · Este servicio aún no está conectado.":"Preview only · Service connection not yet configured.";
  explore.href = module.publicPath;
  explore.textContent = (spanish?"Conocer ":"Explore ") + module.name + " ↗";
  explore.href=(spanish?"/es":"")+module.publicPath;
  const url = new URL(window.location.href);
  url.searchParams.set("service", module.id);
  if (push) window.history.replaceState(null, "", url);
}
function renderCards(modules, filter, current) {
  const subset = filter === "all" ? modules : modules.filter(module => module.group === filter);
  const fragment = document.createDocumentFragment();
  subset.forEach(module => {
    const card = make("article", "w-card");
    card.append(make("span", "w-card-category", (spanish?localizedGroups[module.group]:groupNames[module.group]) || friendly(module.group)));
    card.append(make("strong", null, module.name));
    card.append(make("p", null, (spanish?spanishDescriptions[module.id]:serviceDescriptions[module.id]) || ""));
    const bottom = make("div", "w-card-bottom");
    const button = make("a", null, spanish?"Ver funciones ↗":"View responsibilities ↗");
    button.href = (spanish?"/es":"")+module.workspacePath;
    button.addEventListener("click", event => {
      event.preventDefault();
      showService(module);
      document.getElementById("service-detail").scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block:"start"});
    });
    bottom.append(button, make("span", "w-card-status", spanish?"En preparación":"Not connected"));
    card.append(bottom);
    fragment.append(card);
  });
  cards.replaceChildren(fragment);
}
async function initialize() {
  try {
    const response = await fetch("/service-catalog.json", {cache:"no-store"});
    if (!response.ok) throw new Error("Catalog cannot be loaded");
    const registry = await response.json();
    if (registry.schemaVersion !== "1.0.0" || !Array.isArray(registry.modules)) throw new Error("Unexpected catalog format");
    const modules = registry.modules.filter(item => item.id && item.publicPath && item.web && item.mobile);
    if (!modules.length) throw new Error("Empty catalog");
    count.textContent = String(modules.length);
    for (const module of modules) {
      const a = make("a", null, module.name + " ↗");
      a.href = (spanish?"/es":"")+module.workspacePath;
      a.addEventListener("click", event => {event.preventDefault();showService(module);document.getElementById("service-detail").scrollIntoView({block:"start"});});
      nav.append(a);
    }
    const requestedId = new URLSearchParams(window.location.search).get("service");
    const initialModule = modules.find(m => m.id === requestedId);
    if (initialModule) showService(initialModule, false);
    else {
      selectedTitle.replaceChildren(document.createTextNode("App and web."),document.createElement("br"),make("strong",null,spanish?"Distintas funciones.":"Different roles."));
    }
    renderCards(modules, "all");
    for (const button of filters) {
      button.addEventListener("click", () => {
        filters.forEach(filter => {
          const selected = filter === button;
          filter.classList.toggle("is-selected", selected);
          filter.setAttribute("aria-pressed", String(selected));
        });
        renderCards(modules, button.dataset.filter);
      });
    }
  } catch (error) {
    cards.replaceChildren(make("p", "w-description", spanish?"El catálogo no está disponible temporalmente. Regresa a las páginas de productos.":"The module directory is temporarily unavailable. Please return to the product pages."));
    console.error("VMV module preview:", error.message);
  }
}
initialize();
