/* Small progressive UX enhancements; page remains usable without JS. */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const progress = document.createElement("div");
progress.className = "vmv-scroll-progress";
progress.setAttribute("aria-hidden","true");
document.body.prepend(progress);
const revealElements = [
  ...document.querySelectorAll(".vmv-intro .vmv-inner,.vmv-product,.vmv-industry,.vmv-process-step,.vmv-experience-copy,.vmv-interpret-grid,.vmv-dashboard")
];
if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
  const observer = new IntersectionObserver((entries, instance) => {
    for(const entry of entries) {
      if(entry.isIntersecting) {
        entry.target.classList.add("vmv-revealed");
        instance.unobserve(entry.target);
      }
    }
  }, {rootMargin:"0px 0px -8% 0px",threshold:0.01});
  // Delay adding the hidden state until observers exist, preventing no-JS blank content.
  for(const el of revealElements) {
    el.classList.add("vmv-reveal-ready");
    observer.observe(el);
  }
}
let pending = false;
function updateScroll() {
  pending = false;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (max <= 0 ? 0 : Math.min(100,(window.scrollY/max)*100))+"%";
}
window.addEventListener("scroll",() => {if(!pending){pending=true;requestAnimationFrame(updateScroll);}}, {passive:true});
updateScroll();
const menus = [...document.querySelectorAll(".vmv-mega,.vmv-mobile-menu")];
function closeMenus() { for(const menu of menus) menu.open=false; }
for(const menu of menus) {
  menu.addEventListener("toggle", () => {
    if(menu.open) for(const other of menus) if(other!==menu) other.open=false;
  });
  menu.addEventListener("click", event => {
    if(event.target.closest("a")) menu.open=false;
  });
}
document.addEventListener("keydown",event => {if(event.key==="Escape")closeMenus();});
document.addEventListener("click",event => {
  if(!event.target.closest(".vmv-mega,.vmv-mobile-menu"))closeMenus();
});
