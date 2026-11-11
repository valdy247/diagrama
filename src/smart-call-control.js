import {createClient} from "@supabase/supabase-js";

const es=document.documentElement.lang==="es";
const t=(a,b)=>es?a:b;
const url=import.meta.env.VITE_SUPABASE_URL||"";
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||"";
const configured=/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url)&&key.startsWith("sb_publishable_");
const supabase=configured?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}}):null;
// A public API base is not a credential. The backend still verifies each user's JWT and plan.
// Vercel previews can override this using a PUBLIC VITE_SMARTCALL_API_URL setting.
const apiOrigin=import.meta.env.VITE_SMARTCALL_API_URL||"https://smartjob-xi.vercel.app";
const apiValid=(()=>{try{const u=new URL(apiOrigin);return u.protocol==="https:"&&
 (u.hostname==="smartjob-xi.vercel.app"||/^smartjob-[a-z0-9-]+\.vercel\.app$/.test(u.hostname))&&
 u.pathname==="/"&&u.search===""&&u.hash==="";}catch{return false}})();
const $=id=>document.getElementById(id);
const show=(el,value)=>{if(el)el.hidden=!value};
const set=(id,value)=>{const el=$(id);if(el)el.textContent=value===undefined||value===null||value===""?"—":String(value)};
const feedback=(id,message,error=false)=>{const el=$(id);if(el){el.textContent=message;el.classList.toggle("is-error",error)}};
let revision=0;let ownerId=null;let editable=false;let settingsExist=false;
const signedFields=["user-name","user-email","account-status","line-number","line-note","plan","plan-note","minutes","calls-count"];
function clean(){
 ownerId=null;editable=false;settingsExist=false;
 signedFields.forEach(id=>set(id,"—"));
 ["owner-language","caller-language","assistant-name","voice-customer","voice-owner","greeting-customer","greeting-owner"].forEach(id=>{
  const el=$(id);if(el&&"value" in el)el.value="";
 });
 $("activity-list")?.replaceChildren();$("basic-save").disabled=true;
 $("premium-fields").disabled=true;$("premium-save").disabled=true;
 feedback("basic-feedback","");feedback("premium-feedback","");feedback("global-feedback","");
}
function renderHistory(items){
 const list=$("activity-list");if(!list)return;
 const fragment=document.createDocumentFragment();
 if(!items.length){const empty=document.createElement("p");empty.className="activity-empty";
  empty.textContent=t("Aún no hay llamadas registradas.","No calls recorded yet.");fragment.append(empty)}
 for(const item of items){
  const row=document.createElement("div");row.className="activity-item";
  const date=document.createElement("strong"),type=document.createElement("span"),
   status=document.createElement("span"),duration=document.createElement("span");
  const stamp=new Date(item.started_at||"");date.textContent=Number.isFinite(stamp.getTime())
   ?stamp.toLocaleString(es?"es-US":"en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}):"—";
  type.textContent=item.call_mode==="translated"?t("Traducida","Translated"):t("Directa","Direct");
  status.textContent=String(item.status||"—");
  duration.textContent=typeof item.duration_seconds==="number"
   ?Math.ceil(Math.max(0,item.duration_seconds)/60)+" min":"—";
  row.append(date,type,status,duration);fragment.append(row);
 }
 list.replaceChildren(fragment);
}
async function premiumRequest(method,body){
 if(!supabase||!apiValid)throw new Error(t("API no configurada.","API not configured."));
 const {data}=await supabase.auth.getSession();
 if(!data.session||data.session.user.id!==ownerId)throw new Error(t("Inicia sesión de nuevo.","Please sign in again."));
 const res=await fetch(apiOrigin+"/api/billing/preferences",{
  method,headers:{Authorization:"Bearer "+data.session.access_token,...(body?{"Content-Type":"application/json"}:{})},
  ...(body?{body:JSON.stringify(body)}:{})
 });
 const json=await res.json().catch(()=>({}));
 if(!res.ok)throw new Error(res.status===403?t("Necesitas Pro o Premium activo.","An active Pro or Premium plan is required."):
  t("No se pudo contactar con la configuración de voz.","Voice settings are unavailable."));
 return json;
}
async function loadAccount(user,attempt){
 if(!supabase)return;
 ownerId=user.id;
 set("user-name",user.user_metadata?.first_name||t("Mi cuenta","My account"));
 set("user-email",user.email||"");
 feedback("global-feedback","");
 const [profile,route,billing,settings,history,count]=await Promise.all([
  supabase.from("smartjob_profiles").select("id,business_name,first_name").eq("id",user.id).maybeSingle(),
  supabase.from("smartjob_phone_routes").select("id,enabled,public_number,twilio_number,receive_method")
   .eq("user_id",user.id).order("created_at",{ascending:false}).limit(1),
  supabase.from("smartjob_billing_accounts").select("plan_code,status,included_minutes,used_minutes,topup_minutes")
   .eq("user_id",user.id).maybeSingle(),
  supabase.from("smartjob_call_settings").select("desired_language,caller_language,assistant_name")
   .eq("user_id",user.id).maybeSingle(),
  supabase.from("smartjob_call_sessions").select("started_at,status,call_mode,duration_seconds")
   .eq("owner_id",user.id).order("started_at",{ascending:false}).limit(25),
  supabase.from("smartjob_call_sessions").select("bridge_sid",{count:"exact",head:true}).eq("owner_id",user.id)
 ]);
 if(attempt!==revision)return;
 const errors=[profile,route,billing,settings,history,count].some(r=>r.error);
 const routeValue=route.data?.[0];
 const plan=billing.data;
 set("user-name",profile.data?.business_name||profile.data?.first_name||user.user_metadata?.first_name||t("Mi cuenta","My account"));
 set("account-status",route.error?t("Estado no disponible","Status unavailable"):routeValue?.enabled?t("Línea configurada","Line configured"):t("Línea pendiente","Line pending"));
 set("line-number",route.error?t("No disponible","Unavailable"):routeValue?.public_number||routeValue?.twilio_number||t("Sin número asignado","No number assigned"));
 set("line-note",routeValue?.enabled?t("La recepción real requiere una llamada de prueba.","Actual reception requires a test call."):t("Completa la activación de tu línea.","Complete line activation."));
 set("plan",billing.error?t("No disponible","Unavailable"):plan?.plan_code?.toUpperCase()||t("SIN PLAN","NO PLAN"));
 set("plan-note",billing.error?"—":plan?.status||t("Sin suscripción","No subscription"));
 const minutes=plan?Math.max(0,(plan.included_minutes||0)+(plan.topup_minutes||0)-(plan.used_minutes||0)):null;
 set("minutes",billing.error?"—":minutes===null?"—":minutes);
 set("calls-count",count.error?"—":Number.isFinite(count.count)?count.count:"—");
 settingsExist=!settings.error&&!!settings.data;
 $("basic-save").disabled=!settingsExist;
 if(settingsExist){
  $("owner-language").value=["en","es"].includes(settings.data.desired_language)?settings.data.desired_language:"es";
  $("caller-language").value=["en","es"].includes(settings.data.caller_language)?settings.data.caller_language:"en";
  $("assistant-name").value=String(settings.data.assistant_name||"");
 }else{
  feedback("basic-feedback",t("Completa primero la activación de tu línea para editar preferencias.","Complete line activation before editing preferences."),true);
 }
 renderHistory(history.error?[]:history.data||[]);
 if(errors)feedback("global-feedback",t("Algunos datos no pudieron cargarse. Comprueba tu conexión y actualiza.","Some information could not be loaded. Check your connection and refresh."),true);
 await loadPremium(attempt);
}
async function loadPremium(attempt){
 editable=false;
 $("premium-fields").disabled=true;$("premium-save").disabled=true;
 set("premium-hint",t("Comprobando personalización…","Checking customization…"));
 try{
  const data=await premiumRequest("GET");
  if(attempt!==revision)return;
  editable=data.editable===true;
  const p=data.settings||{};
  $("voice-customer").value=["default","bright","calm"].includes(p.voice_customer)?p.voice_customer:"default";
  $("voice-owner").value=["default","bright","calm"].includes(p.voice_owner)?p.voice_owner:"default";
  $("greeting-customer").value=String(p.greeting_customer||"");
  $("greeting-owner").value=String(p.greeting_owner||"");
  $("premium-fields").disabled=!editable;$("premium-save").disabled=!editable;
  set("premium-hint",editable?t("Disponible · Pro/Premium activo","Available · Pro/Premium active"):
   t("Requiere Pro o Premium activo.","Requires active Pro or Premium."));
 }catch(e){
  if(attempt!==revision)return;
  set("premium-hint",t("No se pudo consultar la configuración de voz.","Voice settings unavailable."));
  feedback("premium-feedback",e.message||t("Error de conexión.","Connection error."),true);
 }
}
async function refresh(){
 if(!supabase){show($("loading"),true);set("loading",t("La conexión segura no está disponible en este despliegue.","Secure connection unavailable in this deployment."));return;}
 const attempt=++revision;
 show($("loading"),true);show($("login-form"),false);show($("dashboard"),false);
 try{
  const {data,error}=await supabase.auth.getUser();
  if(attempt!==revision)return;
  if(error||!data?.user){
   clean();show($("loading"),false);show($("login-form"),true);return;
  }
  show($("loading"),false);show($("dashboard"),true);
  await loadAccount(data.user,attempt);
 }catch{
  if(attempt!==revision)return;
  clean();show($("loading"),false);show($("login-form"),true);
  feedback("global-feedback",t("No se pudo verificar tu cuenta.","Could not verify account."),true);
 }
}
$("login-form")?.addEventListener("submit",async event=>{
 event.preventDefault();if(!supabase)return;
 const email=$("email").value.trim(),password=$("password").value;
 if(!email||!password)return;
 const button=$("login-button");button.disabled=true;feedback("global-feedback","");
 try{
  const {error}=await supabase.auth.signInWithPassword({email,password});
  if(error)throw error;
  $("password").value="";
  await refresh();
 }catch{feedback("global-feedback",t("No pudimos iniciar sesión. Revisa el correo y la contraseña.","Could not sign in. Check email and password."),true);}
 finally{button.disabled=false;$("password").value="";}
});
$("logout")?.addEventListener("click",async()=>{
 if(!supabase)return;
 $("logout").disabled=true;
 await supabase.auth.signOut();
 $("logout").disabled=false;revision++;clean();
 show($("dashboard"),false);show($("login-form"),true);show($("loading"),false);
});
$("refresh")?.addEventListener("click",()=>void refresh());
$("basic-form")?.addEventListener("submit",async event=>{
 event.preventDefault();if(!supabase||!ownerId||!settingsExist)return;
 const owner=$("owner-language").value,caller=$("caller-language").value,assistant=$("assistant-name").value.trim();
 if(!["es","en"].includes(owner)||!["es","en"].includes(caller)||owner===caller){
  feedback("basic-feedback",t("Selecciona dos idiomas diferentes.","Choose two different languages."),true);return;
 }
 if(!assistant||assistant.length>40){feedback("basic-feedback",t("Escribe un nombre válido para el asistente.","Enter a valid assistant name."),true);return;}
 const button=$("basic-save");button.disabled=true;feedback("basic-feedback",t("Guardando…","Saving…"));
 try{
  const {data:identity,error:authError}=await supabase.auth.getUser();
  if(authError||identity.user?.id!==ownerId)throw new Error("session");
  // Prevent any accidental changes to forwarding, number assignments or line state.
  const {data,error}=await supabase.from("smartjob_call_settings").update({
   desired_language:owner,caller_language:caller,assistant_name:assistant,updated_at:new Date().toISOString()
  }).eq("user_id",ownerId).select("user_id").maybeSingle();
  if(error||!data)throw new Error("not_saved");
  feedback("basic-feedback",t("Guardado. Los cambios en una línea activa requieren verificación.","Saved. Changes to an active line require verification."));
 }catch{feedback("basic-feedback",t("No se pudieron guardar los cambios. Actualiza e inténtalo nuevamente.","Could not save changes. Refresh and try again."),true);}
 finally{button.disabled=!settingsExist;}
});
$("premium-form")?.addEventListener("submit",async event=>{
 event.preventDefault();if(!editable||!ownerId)return;
 const values={
  voice_customer:$("voice-customer").value,voice_owner:$("voice-owner").value,
  greeting_customer:$("greeting-customer").value,greeting_owner:$("greeting-owner").value
 };
 const greetings=[values.greeting_customer,values.greeting_owner];
 if(greetings.some(x=>x.length>180||/[<>\r\n]/.test(x)||(x.trim()&&x.trim().length<10))){
  feedback("premium-feedback",t("Saludos de 10 a 180 caracteres, sin saltos de línea ni símbolos < >.","Greetings must contain 10–180 characters, without line breaks or < >."),true);
  return;
 }
 const button=$("premium-save");button.disabled=true;feedback("premium-feedback",t("Guardando…","Saving…"));
 try{
  await premiumRequest("POST",values);
  feedback("premium-feedback",t("Voces y saludos guardados para futuras llamadas.","Voices and greetings saved for future calls."));
 }catch(e){feedback("premium-feedback",e.message||t("No se pudo guardar.","Could not save."),true);}
 finally{button.disabled=!editable;}
});
document.querySelectorAll(".nav-item").forEach(item=>item.addEventListener("click",()=>{
 document.querySelectorAll(".nav-item").forEach(el=>el.classList.toggle("is-current",el===item));
}));
if(supabase){
 supabase.auth.onAuthStateChange(event=>{
  if(event==="SIGNED_OUT"){revision++;clean();show($("dashboard"),false);show($("login-form"),true);show($("loading"),false);}
  else if(event==="SIGNED_IN"||event==="TOKEN_REFRESHED")queueMicrotask(()=>void refresh());
 });
}
void refresh();
