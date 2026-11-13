// Forja · enviar-correos
// Vacía la cola privado.correos (avisos de servicio —cambios a los documentos y cuentas inactivas, a todas las cuentas—, avisos de herramientas, boletín, novedades de vitrinas seguidas, invitaciones a proyectos).
// Envía con la API de Resend (plan gratis: 100 por día, 3.000 al mes) como "Forja <forja@digitalmonster.cl>".
// La llama pg_cron cada 10 minutos (privado.despachar) solo si hay correos pendientes; public.cola_tomar
// entrega como máximo 40 por hora y 90 por día, bajo el límite del plan.
// Secreto (Supabase → Edge Functions → Secrets): RESEND_API_KEY. Opcionales: CORREO_FROM, CORREO_RESPONDER, SITIO.
// Respaldo: sin RESEND_API_KEY usa SMTP si existe SMTP_PASS (con SMTP_USER, SMTP_HOST, SMTP_PORT).
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los pone Supabase.
// Solo responde a pg_cron: el encabezado x-forja-clave debe coincidir con privado.config('cola_clave'),
// una clave aleatoria creada dentro de la base que nadie escribe a mano.
import { createClient } from "jsr:@supabase/supabase-js@2";

const env = (k: string, d = "") => Deno.env.get(k) ?? d;
const SITIO = env("SITIO", "https://forja.digitalmonster.cl").replace(/\/$/, "");
// Cómo se ve cada correo: correos.js, copia idéntica de docs/js/correos.js (el mismo que usa Moderación para la vista previa).
import { armar as armarCorreo } from "./correos.js";

type Fila = { id: number; email: string; token: string | null; tipo: string; datos: Record<string, any> };
type Correo = { asunto: string; html: string; texto: string; baja: string };
const armar = (f: Fila): Correo => armarCorreo(f, SITIO);

Deno.serve(async (req) => {
  const sb = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
  const { data: clave } = await sb.rpc("cola_clave");
  if (!clave || req.headers.get("x-forja-clave") !== clave) return new Response("no autorizado", { status: 401 });
  const resend = env("RESEND_API_KEY"), pass = env("SMTP_PASS");
  if (!resend && !pass) return Response.json({ error: "Falta el secreto RESEND_API_KEY" }, { status: 503 });
  const { data, error } = await sb.rpc("cola_tomar", { limite: 15 });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const lote = (data || []) as Fila[];
  if (!lote.length) return Response.json({ enviados: 0 });
  const from = env("CORREO_FROM", env("SMTP_FROM", "Forja <forja@digitalmonster.cl>")), responder = env("CORREO_RESPONDER");
  let enviar: (f: Fila, c: Correo) => Promise<void>, cerrar = async () => {};
  if (resend) {
    enviar = async (f, c) => {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        // La clave de idempotencia evita duplicados si un envío se reintenta.
        headers: { Authorization: "Bearer " + resend, "Content-Type": "application/json", "Idempotency-Key": "forja-correo-" + f.id },
        body: JSON.stringify({ from, to: [f.email], subject: c.asunto, html: c.html, text: c.texto, ...(c.baja ? { headers: { "List-Unsubscribe": "<" + c.baja + ">" } } : {}), ...(responder ? { reply_to: responder } : {}) }),
      });
      if (!r.ok) throw new Error("Resend " + r.status + ": " + (await r.text()).slice(0, 300));
      await new Promise((ok) => setTimeout(ok, 600)); // Resend acepta pocas solicitudes por segundo
    };
  } else {
    const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");
    const usuario = env("SMTP_USER", "forja@digitalmonster.cl");
    const smtp = new SMTPClient({ connection: { hostname: env("SMTP_HOST", "smtp.titan.email"), port: Number(env("SMTP_PORT", "465")), tls: true, auth: { username: usuario, password: pass } } });
    enviar = (f, c) => smtp.send({ from, to: f.email, subject: c.asunto, content: c.texto, html: c.html, ...(c.baja ? { headers: { "List-Unsubscribe": "<" + c.baja + ">" } } : {}) });
    cerrar = async () => { try { await smtp.close(); } catch (_) { /* nada */ } };
  }
  let enviados = 0;
  for (const f of lote) {
    try {
      await enviar(f, armar(f));
      await sb.rpc("cola_marcar", { id: f.id, ok: true });
      enviados++;
    } catch (e) {
      await sb.rpc("cola_marcar", { id: f.id, ok: false, error: String((e as Error)?.message || e) });
    }
  }
  await cerrar();
  return Response.json({ enviados, de: lote.length });
});
