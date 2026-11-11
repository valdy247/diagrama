import {createClient} from "@supabase/supabase-js";

// VMV Business and the native calling app use the SAME Supabase Auth project.
// Only the publishable browser key is bundled. Every data read is restricted
// through existing owner-only PostgreSQL RLS; no service-role keys belong here.
const url = import.meta.env.VITE_SUPABASE_URL || "";
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
const valid = /^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url) && key.startsWith("sb_publishable_");
const supabase = valid ? createClient(url, key, {
  auth: {persistSession:true, autoRefreshToken:true, detectSessionInUrl:false}
}) : null;

const root = document.getElementById("workspace-account");
const form = document.getElementById("w-login-form");
const loginView = document.getElementById("w-login-view");
const dashboardView = document.getElementById("w-account-view");
const info = document.getElementById("w-auth-message");
const submit = document.getElementById("w-login-submit");
const logout = document.getElementById("w-signout");
const refresh = document.getElementById("w-account-refresh");
let generation = 0;

const show = (element, visible) => {if(element) element.hidden=!visible;};
const setText = (id, value) => {
  const el = document.getElementById(id);
  if(el) el.textContent = value == null || value === "" ? "No disponible" : String(value);
};
function clearSensitiveData() {
  ["w-account-name","w-account-email","w-account-business","w-account-line","w-account-plan","w-account-calls","w-account-language"]
    .forEach(id=>setText(id,"—"));
  document.getElementById("w-calls-list")?.replaceChildren();
}

async function readOwnAccount(user, revision) {
  setText("w-account-name", user.user_metadata?.first_name || "Cuenta VMV");
  setText("w-account-email", user.email || "");
  setText("w-account-business","Cargando…");
  setText("w-account-line","Cargando…");
  setText("w-account-plan","Cargando…");
  setText("w-account-calls","Cargando…");
  setText("w-account-language","Cargando…");

  // owner-only existing tables. Select only the fields needed for a summary.
  const calls = supabase.from("smartjob_call_sessions")
    .select("bridge_sid",{count:"exact",head:true}).eq("owner_id",user.id);
  const [profile, phone, plan, callSettings, history, recent] = await Promise.all([
    supabase.from("smartjob_profiles").select("id,first_name,business_name,account_type").eq("id",user.id).maybeSingle(),
    supabase.from("smartjob_phone_routes").select("id,enabled,twilio_number,public_number").eq("user_id",user.id).order("created_at",{ascending:false}).limit(1),
    supabase.from("smartjob_billing_accounts").select("plan_code,status").eq("user_id",user.id).maybeSingle(),
    supabase.from("smartjob_call_settings").select("desired_language,caller_language").eq("user_id",user.id).maybeSingle(),
    calls,
    supabase.from("smartjob_call_sessions")
      .select("started_at,status,duration_seconds,call_mode")
      .eq("owner_id",user.id).order("started_at",{ascending:false}).limit(5)
  ]);

  if(revision!==generation) return;
  const account = profile.data;
  setText("w-account-name",account?.first_name || user.user_metadata?.first_name || "Mi cuenta");
  setText("w-account-business",profile.error?"No disponible":account?.business_name?.trim() || "Sin nombre de empresa");
  const route = phone.data?.[0];
  // Never claim the line is live solely because a database row exists.
  setText("w-account-line",phone.error?"No disponible":route?.enabled?"Línea configurada":"Sin línea activa");
  const planCode=plan.data?.plan_code;
  const planStatus=plan.data?.status;
  setText("w-account-plan",plan.error?"No disponible":planCode ? planCode+" · "+(planStatus||"sin estado") : "Sin plan configurado");
  setText("w-account-calls",history.error?"No disponible":Number.isFinite(history.count)?String(history.count):"Sin registros");
  const owner=callSettings.data?.desired_language;
  const caller=callSettings.data?.caller_language;
  setText("w-account-language",callSettings.error?"No disponible":owner&&caller?owner.toUpperCase()+" ↔ "+caller.toUpperCase():"Sin configurar");
  const list=document.getElementById("w-calls-list");
  if(list) {
    const records=Array.isArray(recent.data)?recent.data:[];
    const fragment=document.createDocumentFragment();
    if(recent.error || !records.length) {
      const empty=document.createElement("p");
      empty.textContent=recent.error
        ? "No se pudo consultar el historial."
        : "No hay llamadas registradas en esta cuenta.";
      fragment.append(empty);
    }else{
      for(const call of records) {
        const item=document.createElement("div");
        item.className="w-recent-item";
        const date=document.createElement("strong");
        const parsed=call.started_at?new Date(call.started_at):null;
        date.textContent=parsed&&Number.isFinite(parsed.getTime())
          ?parsed.toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"})
          :"Fecha no disponible";
        const details=document.createElement("span");
        const minutes=typeof call.duration_seconds==="number"
          ?Math.ceil(Math.max(0,call.duration_seconds)/60)+" min":"—";
        details.textContent=(call.status||"Sin estado")+" · "+minutes;
        item.append(date,details);
        fragment.append(item);
      }
    }
    list.replaceChildren(fragment);
  }
  info.textContent = profile.error || phone.error || plan.error || callSettings.error || history.error
    ? "Algunos datos no están disponibles. La información mostrada procede de tu propia cuenta."
    : "Datos leídos directamente de tu cuenta con permisos de Supabase.";
}
async function refreshIdentity() {
  const revision=++generation;
  if(!supabase) {
    show(loginView,false);
    show(dashboardView,false);
    setText("w-connection-help","La conexión con Supabase no está disponible en este despliegue.");
    return;
  }
  const {data,error}=await supabase.auth.getUser();
  if(revision!==generation) return;
  if(error || !data?.user) {
    show(loginView,true);
    show(dashboardView,false);
    clearSensitiveData();
    setText("w-auth-message","");
    setText("w-connection-help","Inicia sesión con el mismo correo y contraseña que usas en Smart Call. La app y el navegador conservan sesiones distintas por seguridad.");
    return;
  }
  show(loginView,false);
  show(dashboardView,true);
  setText("w-connection-help","Sesión verificada en Supabase. La configuración avanzada de los servicios se habilitará progresivamente.");
  await readOwnAccount(data.user,revision);
}

if(root) {
  if(!supabase) {
    show(loginView,false);show(dashboardView,false);
    setText("w-connection-help","No se pudo configurar la conexión segura. Vuelve a intentarlo más tarde.");
  }else{
    form?.addEventListener("submit",async event=>{
      event.preventDefault();
      if(!form || !submit)return;
      const email=String(form.elements.namedItem("email")?.value||"").trim();
      const password=String(form.elements.namedItem("password")?.value||"");
      if(!email||!password) return;
      submit.disabled=true;
      info.textContent="Verificando tu cuenta…";
      const {error}=await supabase.auth.signInWithPassword({email,password});
      const passwordInput=form.elements.namedItem("password");
      if(passwordInput)passwordInput.value="";
      submit.disabled=false;
      if(error) {
        info.textContent="No se pudo iniciar sesión. Revisa tus datos e inténtalo nuevamente.";
        return;
      }
      await refreshIdentity();
    });
    logout?.addEventListener("click",async()=>{
      logout.disabled=true;
      await supabase.auth.signOut();
      logout.disabled=false;
      ++generation;
      clearSensitiveData();
      show(loginView,true);show(dashboardView,false);
      setText("w-auth-message","Sesión cerrada en este navegador.");
    });
    refresh?.addEventListener("click",()=>{void refreshIdentity();});
    supabase.auth.onAuthStateChange((event)=>{
      if(event==="SIGNED_IN"||event==="SIGNED_OUT"||event==="TOKEN_REFRESHED")
        queueMicrotask(()=>{void refreshIdentity();});
    });
    void refreshIdentity();
  }
}
