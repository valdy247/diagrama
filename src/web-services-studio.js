/* Web Services Studio v1. No network calls, account mutations or publish claims. */
(() => {
  'use strict';
  const root = document.getElementById('ws-studio');
  if (!root) return;
  const es = document.documentElement.lang === 'es';
  const messages = es ? {
    saved:'Borrador guardado en este navegador', unavailable:'Almacenamiento bloqueado. Exporta el archivo para conservarlo.',
    exported:'Archivo descargado', reset:'Borrador restablecido', confirm:'¿Restablecer todos los cambios de este dispositivo?',
    preview:'Vista previa de tu sitio web'
  } : {
    saved:'Draft saved in this browser', unavailable:'Browser storage blocked. Export your file to keep your changes.',
    exported:'File downloaded', reset:'Draft restored to defaults', confirm:'Reset all changes saved on this device?',
    preview:'Preview of your website'
  };
  const key = 'vmv:web-services:local-draft:v1:' + (es ? 'es' : 'en');
  const defaults = es ? {
    brand:'Casa Aurora', eyebrow:'Diseño con intención', title:'Tu próxima gran idea comienza aquí.',
    description:'Creamos experiencias cuidadas, pensadas para las personas y para los detalles que importan.',
    about:'Un espacio único para quienes valoran la calidad, la cercanía y una nueva forma de hacer las cosas.',
    services:'Experiencias a medida\nAtención personalizada\nProyectos especiales',
    email:'', phone:'', hours:'Lunes a viernes · 9:00–18:00', cta:'Hablemos',
    seoTitle:'Casa Aurora | Diseño con intención',
    seoDescription:'Conoce Casa Aurora y descubre nuestros servicios personalizados.',
    template:'editorial', palette:'lavender'
  } : {
    brand:'Atelier House', eyebrow:'Thoughtfully made', title:'Make room for something remarkable.',
    description:'Intentional experiences, designed for people and all the details that matter.',
    about:'A different kind of place for those who value quality, character and a personal approach.',
    services:'Tailored experiences\nPersonal service\nSpecial projects',
    email:'', phone:'', hours:'Monday–Friday · 9 AM–6 PM', cta:'Get in touch',
    seoTitle:'Atelier House | Thoughtfully made',
    seoDescription:'Discover Atelier House and our personalized services.',
    template:'editorial', palette:'lavender'
  };
  const keys = Object.keys(defaults);
  const palettes = {
    lavender:{accent:'#7054c6',soft:'#f3effc',ink:'#232033',warm:'#fffefa'},
    mint:{accent:'#187761',soft:'#e6f7ef',ink:'#1f302b',warm:'#fafffb'},
    terracotta:{accent:'#a54d39',soft:'#fbece7',ink:'#362821',warm:'#fffaf6'},
    charcoal:{accent:'#25242c',soft:'#e9e9ef',ink:'#202026',warm:'#ffffff'}
  };
  const form = root.querySelector('#ws-editor-form');
  const frame = root.querySelector('#ws-preview-frame');
  const status = document.getElementById('ws-status');
  const shell = root.querySelector('#ws-frame-shell');
  let data = {...defaults};

  function limited(value, max = 600) { return String(value == null ? '' : value).slice(0, max); }
  function escapeHTML(value) {
    return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function text(value, fallback = '') { return escapeHTML(String(value || '').trim() || fallback); }
  function safeEmail(value) {
    const s = String(value || '').trim();
    return /^[^\s@<>:"?&#]+@[^\s@<>:"?&#]+\.[^\s@<>:"?&#]+$/.test(s) && s.length <= 254 ? s : '';
  }
  function safePhone(value) {
    const s = String(value || '').replace(/[^\d+]/g, '');
    return /^\+?\d{7,15}$/.test(s) ? s : '';
  }
  function htmlForSite(d) {
    const color = palettes[d.palette] || palettes.lavender;
    const template = ['editorial','bold','minimal'].includes(d.template) ? d.template : 'editorial';
    const services = String(d.services || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean).slice(0, 6);
    const email = safeEmail(d.email);
    const phone = safePhone(d.phone);
    const brand = text(d.brand, es ? 'Tu negocio' : 'Your business');
    const title = text(d.title, brand);
    const description = text(d.description);
    const about = text(d.about);
    const eyebrow = text(d.eyebrow);
    const callToAction = text(d.cta, es ? 'Contáctanos' : 'Contact us');
    const seoTitle = text(d.seoTitle, d.brand);
    const seoDesc = text(d.seoDescription, d.description).slice(0, 500);
    const serviceTitle = es ? 'Lo que hacemos' : 'What we do';
    const aboutTitle = es ? 'Nuestra historia' : 'Our story';
    const contactTitle = es ? 'Empecemos algo bueno.' : 'Let’s make something good.';
    const contactCaption = es ? 'Estamos aquí para ayudarte a dar el siguiente paso.' : 'We are here to help you take the next step.';
    const menu = es ? ['Servicios','Nosotros','Contacto'] : ['Services','About','Contact'];
    const servicesHTML = services.map((item,i)=>'<article><small>0'+(i+1)+'</small><h3>'+escapeHTML(item)+'</h3><span aria-hidden="true">↗</span></article>').join('');
    const contactItems = [
      email ? '<a href="mailto:'+escapeHTML(email)+'">'+escapeHTML(email)+'</a>' : '',
      phone ? '<a href="tel:'+escapeHTML(phone)+'">'+text(d.phone)+'</a>' : '',
      d.hours ? '<p>'+text(d.hours)+'</p>' : ''
    ].filter(Boolean).join('');
    const css = [
      '*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--ink);background:var(--bg);font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}a{color:inherit;text-decoration:none}header{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:27px 6%;font-size:12px}header .logo{font-size:clamp(16px,2.5vw,23px);font-weight:800;letter-spacing:-.06em}header nav{display:flex;gap:16px;font-size:clamp(8px,1.2vw,12px)}main{overflow:hidden}.hero{background:var(--soft);padding:clamp(55px,9vw,130px) 7%;min-height:400px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center}.eyebrow{color:var(--accent);font-size:11px;text-transform:uppercase;letter-spacing:.18em;font-weight:800}.hero h1{font-size:clamp(43px,7.8vw,112px);line-height:.95;letter-spacing:-.085em;font-weight:740;max-width:860px;margin:22px 0}.hero p{font-size:clamp(13px,1.6vw,19px);line-height:1.6;max-width:550px}.cta{display:inline-flex;align-items:center;gap:17px;background:var(--accent);color:white;padding:15px 20px;border-radius:100px;font-size:13px;font-weight:700;margin-top:20px}.cta:after{content:"↗"}.section{padding:clamp(52px,7vw,90px) 7%}.section>p{max-width:680px;line-height:1.65;font-size:clamp(16px,2vw,23px)}.section h2{font-size:clamp(30px,4vw,55px);letter-spacing:-.065em;margin:10px 0 22px}.services-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:32px}.services-grid article{background:var(--soft);border-radius:12px;padding:24px;min-height:145px;display:flex;flex-direction:column}.services-grid small{font-size:11px;color:var(--accent);font-weight:800}.services-grid h3{font-size:clamp(15px,2vw,24px);line-height:1.2;letter-spacing:-.04em;margin:22px 0 10px;word-break:break-word}.services-grid span{margin-top:auto;margin-left:auto;color:var(--accent)}.about{background:var(--ink);color:var(--bg)}.contact{background:var(--soft)}.contact a{display:inline-block;margin:8px 17px 8px 0;font-weight:700;color:var(--accent);overflow-wrap:anywhere}.contact p{line-height:1.6}footer{border-top:1px solid #80808030;padding:22px 7%;display:flex;justify-content:space-between;gap:20px;font-size:12px}body.bold .hero{background:var(--ink);color:white;min-height:500px}body.bold .hero .eyebrow{color:#e0d7ff}body.bold .hero .cta{background:var(--soft);color:var(--ink)}body.minimal .hero{background:var(--bg);min-height:340px}body.minimal .services-grid article{border:1px solid #ddd;background:transparent;border-radius:0}body.minimal .cta{border-radius:5px}@media(max-width:560px){header{padding:20px 5%;align-items:flex-start;flex-direction:column}header nav{gap:15px}.hero{padding:54px 6%;min-height:360px}.hero h1{font-size:clamp(43px,12vw,67px)}.section{padding:55px 6%}.services-grid{grid-template-columns:1fr}.services-grid article{min-height:100px;padding:19px}.services-grid h3{margin:12px 0}footer{flex-direction:column}}'
    ].join('');
    const doc = [
      '<!doctype html><html lang="',es ? 'es' : 'en','"><head><meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width,initial-scale=1">',
      '<meta name="description" content="',seoDesc,'"><meta name="theme-color" content="',color.accent,'">',
      '<title>',seoTitle,'</title><style>',
      ':root{--accent:',color.accent,';--soft:',color.soft,';--ink:',color.ink,';--bg:',color.warm,'}',
      css,'</style></head><body class="',template,'">',
      '<header><a href="#home" class="logo">',brand,'<span style="color:var(--accent)">.</span></a>',
      '<nav><a href="#services">',menu[0],'</a><a href="#about">',menu[1],'</a><a href="#contact">',menu[2],'</a></nav></header>',
      '<main><section class="hero" id="home"><span class="eyebrow">',eyebrow,'</span><h1>',title,'</h1>',
      '<p>',description,'</p><a class="cta" href="#contact">',callToAction,'</a></section>',
      '<section class="section" id="services"><span class="eyebrow">01 / ',menu[0],'</span><h2>',serviceTitle,'</h2>',
      '<div class="services-grid">',servicesHTML,'</div></section>',
      '<section class="section about" id="about"><span class="eyebrow">02 / ',menu[1],'</span><h2>',aboutTitle,'</h2><p>',about,'</p></section>',
      '<section class="section contact" id="contact"><span class="eyebrow">03 / ',menu[2],'</span><h2>',contactTitle,'</h2>',
      '<p>',contactCaption,'</p>',contactItems,'</section></main>',
      '<footer><span>© ',new Date().getFullYear(),' ',brand,'</span><span>',es?'Creado para tu negocio':'Built for your business','</span></footer>',
      '</body></html>'
    ];
    return doc.join('');
  }
  function setStatus(message) { if (status) status.textContent = message; }
  function refresh() {
    frame.srcdoc = htmlForSite(data);
    frame.title = messages.preview;
    const brandLabel = root.querySelector('#ws-site-label');
    if (brandLabel) brandLabel.textContent = data.brand.trim() || defaults.brand;
  }
  function save() {
    try { localStorage.setItem(key,JSON.stringify(data)); setStatus(messages.saved); }
    catch (_) { setStatus(messages.unavailable); }
  }
  function syncForm() {
    form.querySelectorAll('[data-ws-field]').forEach(element => {
      element.value = data[element.name] || '';
    });
    root.querySelectorAll('[data-ws-choice]').forEach(button => {
      button.setAttribute('aria-pressed',String(data[button.dataset.wsChoice] === button.dataset.value));
    });
  }
  try {
    const stored = JSON.parse(localStorage.getItem(key) || 'null');
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      keys.forEach(k => {
        if (typeof stored[k] === 'string' && stored[k].length <= 1400) data[k] = stored[k];
      });
    }
  } catch (_) { /* Private browsing and corrupt stored drafts fall back to defaults. */ }
  syncForm();
  refresh();
  form.addEventListener('input', event => {
    const input = event.target.closest('[data-ws-field]');
    if (!input) return;
    const field = input.name;
    if (!keys.includes(field)) return;
    data[field] = limited(input.value, field === 'services' || field === 'about' ? 1200 : 600);
    refresh(); save();
  });
  root.querySelectorAll('[data-ws-choice]').forEach(button => {
    button.addEventListener('click', () => {
      const field = button.dataset.wsChoice, value = button.dataset.value;
      if (!['palette','template'].includes(field)) return;
      if (field === 'palette' && !palettes[value]) return;
      if (field === 'template' && !['editorial','bold','minimal'].includes(value)) return;
      data[field] = value; syncForm(); refresh(); save();
    });
  });
  root.querySelectorAll('[data-ws-device]').forEach(button => {
    button.addEventListener('click', () => {
      shell.dataset.device = button.dataset.wsDevice;
      root.querySelectorAll('[data-ws-device]').forEach(el => {
        el.setAttribute('aria-pressed',String(el === button));
      });
    });
  });
  function download(filename,contents,mime) {
    const url = URL.createObjectURL(new Blob([contents],{type:mime}));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = filename; document.body.appendChild(anchor);
    anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url),1000);
    setStatus(messages.exported);
  }
  function slug(value) {
    return String(value || '').normalize('NFKD').toLowerCase()
      .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,45) || 'my-website';
  }
  root.querySelector('#ws-export-html').addEventListener('click', () => {
    download(slug(data.brand)+'.html',htmlForSite(data),'text/html;charset=utf-8');
  });
  root.querySelector('#ws-export-json').addEventListener('click', () => {
    download(slug(data.brand)+'-draft.json',JSON.stringify({schemaVersion:1,language:es?'es':'en',website:data},null,2),'application/json;charset=utf-8');
  });
  root.querySelector('#ws-reset').addEventListener('click', () => {
    if (!window.confirm(messages.confirm)) return;
    data = {...defaults}; syncForm(); refresh(); save(); setStatus(messages.reset);
  });
})();
