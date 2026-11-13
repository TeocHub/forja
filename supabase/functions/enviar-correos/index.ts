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
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const parrafos = (t: unknown) => esc(t).split(/\n{2,}/).map((p) => '<p style="margin:0 0 14px;font-size:16px;line-height:1.55">' + p.replace(/\n/g, "<br>") + "</p>").join("");
const okUrl = (u: unknown) => /^https:\/\/[^\s"'<>]+$/i.test(String(u ?? ""));

type Fila = { id: number; email: string; token: string | null; tipo: string; datos: Record<string, any> };
type Correo = { asunto: string; html: string; texto: string; baja: string };

function boton(href: string, txt: string) {
  return '<p style="margin:22px 0"><a href="' + esc(href) + '" style="background:#2a3fd1;color:#ffffff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block">' + esc(txt) + "</a></p>";
}
function marco(cuerpo: string, pie: string, aviso = "") {
  return '<!doctype html><html><body style="margin:0;background:#f4f3ee"><div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:28px 22px;color:#1a1d29;background:#ffffff">' +
    (aviso ? '<p style="background:#fff3cd;border-radius:8px;padding:8px 12px;font-size:13px;margin:0 0 16px">' + aviso + "</p>" : "") +
    '<p style="font-size:22px;font-weight:bold;margin:0 0 18px">Forja</p>' + cuerpo +
    '<hr style="border:0;border-top:1px solid #e3e1da;margin:26px 0 14px"><div style="font-size:12.5px;color:#6b7080;line-height:1.55">' + pie +
    "<br>Forja · Digital Monster, Chile · " + '<a href="' + SITIO + '/" style="color:#6b7080">forja.digitalmonster.cl</a></div></div></body></html>';
}
const NOMBRE_DOC: Record<string, string> = { terminos: "Términos de uso", privacidad: "Política de privacidad", normas: "Normas de la comunidad y uso aceptable", cookies: "Política de cookies y almacenamiento", pagos: "Planes, pagos y reembolsos" };
const fechaLarga = (f: unknown) => new Date(String(f) + "T12:00:00Z").toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const enlaceBaja = (t: string | null, q: string, slug = "") => SITIO + "/correo/?t=" + t + "&q=" + q + (slug ? "&v=" + encodeURIComponent(slug) : "");

function armar(f: Fila): Correo {
  const prueba = f.tipo === "prueba", tipo = prueba ? String(f.datos.de || "boletin") : f.tipo, d = f.datos;
  const aviso = prueba ? "Esto es una prueba: solo te llegó a ti." : "";
  if (tipo === "invitacion") {
    // Invitación a un proyecto: va a personas que quizá aún no tienen cuenta (sin enlace de baja: es un correo único que pidió alguien que la conoce).
    const ir = SITIO + "/invitacion/?t=" + encodeURIComponent(d.token), hasta = new Date(d.expira).toLocaleDateString("es-CL", { day: "numeric", month: "long" });
    return {
      asunto: d.de.split("@")[0] + " te invitó a trabajar en «" + d.proyecto + "»", baja: "",
      html: marco('<p style="font-size:14px;color:#6b7080;margin:0 0 6px">Una invitación para trabajar juntos</p><h1 style="font-size:24px;margin:0 0 14px">' + esc(d.proyecto) + "</h1>" +
        parrafos(d.de + " te invitó a " + (d.rol === "lector" ? "ver" : "trabajar en") + " su proyecto en Forja, un lugar para dar forma a historias, juegos y productos. Para entrar necesitas una cuenta gratis con este mismo correo.") +
        boton(ir, "Ver la invitación") + '<p style="font-size:13px;color:#6b7080;margin:0">La invitación vence el ' + esc(hasta) + ". Solo funciona con este correo.</p>",
        "Si no conoces a quien te invitó, ignora este correo: no se creó ninguna cuenta y no volverás a recibir nada.", aviso),
      texto: d.de + " te invitó a " + (d.rol === "lector" ? "ver" : "trabajar en") + " «" + d.proyecto + "» en Forja.\n\nVer la invitación: " + ir + "\n\nVence el " + hasta + " y solo funciona con este correo. Si no conoces a quien te invitó, ignora este correo.",
    };
  }
  if (tipo === "legal") {
    // Aviso de servicio: llega a todas las cuentas, sin enlace de baja. Sin este aviso ninguna versión nueva de los documentos se publica.
    // El texto lo escribe cada versión en docs/legal/versiones.json (`correo`); sin él se usa el resumen.
    const ir = SITIO + "/" + String(d.enlace || "documentos/"), cuando = fechaLarga(d.rige), c = d.correo || {};
    const dest = (Array.isArray(c.destacados) ? c.destacados : []).filter((x: any) => x && x.t).slice(0, 6);
    const dia = new Date(String(d.rige) + "T12:00:00Z"), num = dia.getUTCDate(), mes = dia.toLocaleDateString("es-CL", { month: "short", timeZone: "UTC" }).replace(".", "");
    const sello = '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px"><tr>' +
      '<td style="background:#2a3fd1;color:#ffffff;border-radius:12px;padding:10px 0;width:64px;text-align:center;font-family:Arial,Helvetica,sans-serif"><div style="font-size:26px;font-weight:bold;line-height:1">' + num + '</div><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-top:3px">' + esc(mes) + "</div></td>" +
      '<td style="padding-left:14px;font-size:14px;line-height:1.45;color:#4a4f5c">Desde este día rigen<br>los documentos nuevos de Forja</td></tr></table>';
    const tarjetas = dest.map((x: any, i: number) =>
      '<div style="border:1px solid #e3e1da;border-left:4px solid ' + ["#2a3fd1", "#c2410c", "#0f766e", "#7c3aed", "#b45309", "#be185d"][i % 6] + ';border-radius:10px;padding:14px 16px;margin:0 0 10px">' +
      '<p style="margin:0 0 5px;font-size:16px;font-weight:bold;line-height:1.35">' + esc(x.t) + '</p><p style="margin:0;font-size:15px;line-height:1.55;color:#3d4250">' + esc(x.d) + "</p></div>").join("");
    const previa = c.previa ? '<div style="display:none;max-height:0;overflow:hidden;opacity:0">' + esc(c.previa) + "</div>" : "";
    const cuerpo = previa + sello +
      '<h1 style="font-size:25px;line-height:1.25;margin:0 0 16px">' + esc(c.titulo || "Te contamos qué cambia en Forja") + "</h1>" +
      parrafos(c.intro || d.resumen) + tarjetas +
      (c.igual ? '<div style="background:#f4f3ee;border-radius:10px;padding:14px 16px;margin:16px 0 0"><p style="margin:0 0 4px;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;color:#6b7080">Lo que no cambia</p><p style="margin:0;font-size:15px;line-height:1.55">' + esc(c.igual) + "</p></div>" : "") +
      boton(ir, "Ver los cambios lado a lado") +
      '<p style="margin:-8px 0 18px;font-size:13.5px;color:#6b7080;line-height:1.5">Cada sección dice si es nueva, si cambió o si sigue igual, así que puedes leer solo lo que te interesa.</p>' +
      parrafos("Hasta el " + cuando + " todo sigue como está. Desde ese día, Forja te pedirá aceptar la versión nueva al entrar. Si no te convence, puedes descargar tus datos y borrar tu cuenta cuando quieras, desde Mi cuenta.") +
      (c.firma ? '<p style="margin:18px 0 0;font-size:15px">' + esc(c.firma) + "</p>" : "");
    return {
      asunto: c.asunto || "Cambian los documentos de Forja: rigen el " + cuando, baja: "",
      html: marco(cuerpo, "Este es un aviso de servicio: llega a todas las cuentas de Forja, aunque no recibas otros correos, porque cambia el acuerdo entre tú y nosotros. ¿Dudas? Escríbenos desde Mi cuenta → Escríbenos.", aviso),
      texto: (c.titulo || "Te contamos qué cambia en Forja") + "\nRige desde el " + cuando + ".\n\n" + (c.intro || d.resumen) + "\n\n" +
        dest.map((x: any) => "· " + x.t + "\n  " + x.d).join("\n\n") + (c.igual ? "\n\nLo que no cambia: " + c.igual : "") +
        "\n\nVer los cambios lado a lado: " + ir + "\n\nHasta el " + cuando + " todo sigue como está. Desde ese día, Forja te pedirá aceptar la versión nueva al entrar. Si no te convence, puedes descargar tus datos y borrar tu cuenta desde Mi cuenta." +
        (c.firma ? "\n\n" + c.firma : "") + "\n\nEste es un aviso de servicio: llega a todas las cuentas de Forja.",
    };
  }
  if (tipo === "inactiva") {
    // Aviso de servicio por inactividad (90 y 120 días sin entrar). Entrar basta para conservar la cuenta.
    const entrar = SITIO + "/entrar/?siguiente=" + encodeURIComponent("cuenta/#datos"), cuando = fechaLarga(d.borra), dias = d.etapa === 2 ? 120 : 90;
    const titulo = (d.etapa === 2 ? "Segundo aviso: " : "") + "tu cuenta de Forja se borrará el " + cuando;
    return {
      asunto: titulo.charAt(0).toUpperCase() + titulo.slice(1), baja: "",
      html: marco('<p style="font-size:14px;color:#6b7080;margin:0 0 6px">Aviso de servicio</p><h1 style="font-size:24px;margin:0 0 14px">' + esc(titulo.charAt(0).toUpperCase() + titulo.slice(1)) + "</h1>" +
        parrafos("Hace " + dias + " días que no entras a Forja. Como dicen nuestros Términos de uso, las cuentas sin uso se borran a los 150 días, con todo lo que guardan.\n\nPara conservarla, basta con entrar una vez. Si prefieres irte, puedes descargar antes todos tus datos.") +
        boton(entrar, "Entrar y descargar mis datos") +
        '<p style="font-size:13px;color:#6b7080;margin:0">Nunca borramos cuentas con un plan pagado, del equipo Digital Monster o con una vitrina publicada.</p>',
        "Este es un aviso de servicio: llega aunque no recibas otros correos de Forja. Si no creaste esta cuenta, ignóralo y se borrará sola.", aviso),
      texto: titulo + ".\n\nHace " + dias + " días que no entras a Forja. Las cuentas sin uso se borran a los 150 días, con todo lo que guardan. Para conservarla, basta con entrar una vez. Si prefieres irte, descarga antes tus datos:\n" + entrar,
    };
  }
  if (tipo === "funcion") {
    const baja = enlaceBaja(f.token, "funciones"), ir = okUrl(d.enlace) ? d.enlace : SITIO + "/proyectos/";
    return {
      asunto: "Ya está en Forja: " + d.titulo, baja,
      html: marco('<p style="font-size:14px;color:#6b7080;margin:0 0 6px">Pediste que te avisáramos y ya está lista</p><h1 style="font-size:24px;margin:0 0 14px">' + esc(d.titulo) + "</h1>" + parrafos(d.texto) + boton(ir, "Probarla en Forja"),
        'Te llegó porque tocaste "Avísame" en esta herramienta. <a href="' + esc(baja) + '" style="color:#6b7080">No quiero avisos de herramientas</a>.', aviso),
      texto: "Ya está en Forja: " + d.titulo + "\n\n" + d.texto + "\n\nProbarla: " + ir + "\n\nNo quiero avisos de herramientas: " + baja,
    };
  }
  if (tipo === "vitrina") {
    const baja = enlaceBaja(f.token, "seguir", d.slug), todas = enlaceBaja(f.token, "vitrinas"), ver = SITIO + "/vitrina/?v=" + encodeURIComponent(d.slug);
    return {
      asunto: d.vitrina + ": " + d.titulo, baja,
      html: marco('<p style="font-size:14px;color:#6b7080;margin:0 0 6px">Novedades de <b style="color:#1a1d29">' + esc(d.vitrina) + "</b>, un proyecto que sigues</p>" +
        '<h1 style="font-size:24px;margin:0 0 14px">' + esc(d.titulo) + "</h1>" + parrafos(d.texto) + boton(ver, "Ver la vitrina") +
        '<p style="font-size:13px;color:#6b7080;margin:0">Este mensaje lo escribió quien crea el proyecto. Forja no revisa su contenido antes de enviarlo; si algo está mal, <a href="' + esc(ver) + '#reportar" style="color:#6b7080">repórtalo</a>.</p>',
        'Te llegó porque sigues este proyecto en Forja. <a href="' + esc(baja) + '" style="color:#6b7080">Dejar de seguirlo</a> · <a href="' + esc(todas) + '" style="color:#6b7080">No recibir avisos de ninguna vitrina</a>.', aviso),
      texto: "Novedades de " + d.vitrina + "\n\n" + d.titulo + "\n\n" + d.texto + "\n\nVer la vitrina: " + ver + "\n\nDejar de seguirlo: " + baja + "\nNo recibir avisos de vitrinas: " + todas,
    };
  }
  // boletín
  const baja = enlaceBaja(f.token, "boletin");
  const bloque = (titulo: string, html: string) => '<h2 style="font-size:18px;margin:26px 0 10px;border-top:1px solid #e3e1da;padding-top:18px">' + esc(titulo) + "</h2>" + html;
  const nov = (d.novedades || []).filter((n: any) => n && n.titulo);
  const opo = (d.oportunidades || []).filter((o: any) => o && o.nombre);
  const vit = (d.vitrinas || []).filter((v: any) => v && v.slug);
  let html = '<h1 style="font-size:24px;margin:0 0 14px">' + esc(d.asunto) + "</h1>" + (d.intro ? parrafos(d.intro) : "");
  let texto = d.asunto + "\n\n" + (d.intro || "") + "\n";
  if (nov.length) {
    html += bloque("Novedades de Forja", nov.map((n: any) => '<p style="margin:0 0 4px;font-weight:bold;font-size:16px">' + esc(n.titulo) + "</p>" + parrafos(n.texto)).join(""));
    texto += "\nNOVEDADES DE FORJA\n" + nov.map((n: any) => "· " + n.titulo + "\n" + (n.texto || "")).join("\n") + "\n";
  }
  if (opo.length) {
    html += bloque("Oportunidades que se vienen", '<table style="width:100%;border-collapse:collapse;font-size:14.5px">' + opo.map((o: any) =>
      '<tr><td style="padding:7px 0;border-bottom:1px solid #eeece6">' + (okUrl(o.url) ? '<a href="' + esc(o.url) + '" style="color:#2a3fd1">' + esc(o.nombre) + "</a>" : esc(o.nombre)) + '</td><td style="padding:7px 0 7px 10px;border-bottom:1px solid #eeece6;color:#6b7080;text-align:right;white-space:nowrap">' + esc(o.cuando) + "</td></tr>").join("") + "</table>" +
      '<p style="font-size:13px;color:#6b7080;margin:8px 0 0">Todas las fechas en <a href="' + SITIO + '/oportunidades/" style="color:#6b7080">el calendario de Forja</a>. Confirma siempre las bases en la fuente oficial.</p>');
    texto += "\nOPORTUNIDADES QUE SE VIENEN\n" + opo.map((o: any) => "· " + o.nombre + " — " + o.cuando + (o.url ? " " + o.url : "")).join("\n") + "\n";
  }
  if (vit.length) {
    html += bloque("Proyectos para conocer", vit.map((v: any) => '<p style="margin:0 0 12px"><a href="' + SITIO + "/vitrina/?v=" + encodeURIComponent(v.slug) + '" style="color:#2a3fd1;font-weight:bold;font-size:16px">' + esc(v.titulo) + "</a>" + (v.lema ? '<br><span style="color:#4a4f5c">' + esc(v.lema) + "</span>" : "") + "</p>").join(""));
    texto += "\nPROYECTOS PARA CONOCER\n" + vit.map((v: any) => "· " + v.titulo + " " + SITIO + "/vitrina/?v=" + v.slug).join("\n") + "\n";
  }
  if (d.cierre) { html += '<div style="margin-top:22px">' + parrafos(d.cierre) + "</div>"; texto += "\n" + d.cierre + "\n"; }
  return {
    asunto: d.asunto, baja,
    html: marco(html, 'Te llegó porque te suscribiste al boletín de Forja. <a href="' + esc(baja) + '" style="color:#6b7080">Darme de baja</a>.', aviso),
    texto: texto + "\nDarme de baja: " + baja,
  };
}

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
