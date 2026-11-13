// Forja · cómo se ve cada correo (avisos de servicio, herramientas, boletín, vitrinas, invitaciones).
// Un solo archivo para dos lugares: Moderación lo usa para la vista previa antes de enviar y la Edge Function
// enviar-correos lo usa para armar lo que de verdad sale. La función lleva una copia idéntica en
// supabase/functions/enviar-correos/correos.js: al cambiar este archivo, copiarlo allá y volver a desplegar la función.
// Identidad «Grafito con color propio»: blanco, negro y grafito; la chispa morada es el único color. Sin letras web
// (los programas de correo no las cargan): Arial en todo.
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const okUrl = (u) => /^https:\/\/[^\s"'<>]+$/i.test(String(u ?? ""));
const TINTA = "#161616", LAPIZ = "#575757", LINEA = "#DEDEDA", MESA = "#F4F4F2", CHISPA = "#7A3FC4";
const parrafos = (t) => esc(t).split(/\n{2,}/).map((p) => '<p style="margin:0 0 14px;font-size:16px;line-height:1.55">' + p.replace(/\n/g, "<br>") + "</p>").join("");
const boton = (href, txt) => '<p style="margin:24px 0"><a href="' + esc(href) + '" style="background:' + TINTA + ";color:#ffffff;padding:13px 22px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block\">" + esc(txt) + "</a></p>";
const rotulo = (t) => '<p style="font-family:\'Courier New\',monospace;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:' + LAPIZ + ';margin:0 0 8px">' + esc(t) + "</p>";
const titulo = (t) => '<h1 style="font-size:26px;line-height:1.15;letter-spacing:-.5px;margin:0 0 16px;color:' + TINTA + '">' + esc(t) + "</h1>";
export const NOMBRE_DOC = { terminos: "Términos de uso", privacidad: "Política de privacidad", normas: "Normas de la comunidad y uso aceptable", cookies: "Política de cookies y almacenamiento", pagos: "Planes, pagos y reembolsos" };
const fechaLarga = (f) => new Date(String(f) + "T12:00:00Z").toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// Arma un correo de la cola. f = { tipo, token, datos } (tipo `prueba` con datos.de = el tipo que se prueba).
// Devuelve { asunto, html, texto, baja }.
export function armar(f, sitio = "https://forja.digitalmonster.cl") {
  const SITIO = String(sitio).replace(/\/$/, "");
  const enlaceBaja = (t, q, slug = "") => SITIO + "/correo/?t=" + t + "&q=" + q + (slug ? "&v=" + encodeURIComponent(slug) : "");
  const marco = (cuerpo, pie, aviso = "") => '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:' + MESA + '">' +
    '<div style="background:' + MESA + ';padding:24px 12px"><div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:26px 24px 22px;color:' + TINTA + ';background:#ffffff;border:1px solid ' + LINEA + ';border-radius:14px">' +
    (aviso ? '<p style="border:2px dashed ' + TINTA + ";border-radius:8px;padding:8px 12px;font-size:13px;font-weight:bold;margin:0 0 18px\">" + aviso + "</p>" : "") +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px"><tr><td style="vertical-align:middle"><img src="' + SITIO + '/img/marca-correo.png" width="28" height="28" alt="" style="display:block;border:0"></td>' +
    '<td style="vertical-align:middle;padding-left:8px;font-size:22px;font-weight:900;letter-spacing:-.6px;color:' + TINTA + '">forja</td></tr></table>' + cuerpo +
    '<div style="border-top:1px solid ' + LINEA + ';margin:26px 0 14px"></div><div style="font-size:12.5px;color:' + LAPIZ + ';line-height:1.55">' + pie +
    '<br><span style="color:' + CHISPA + '">✦</span> forja · un taller para crear, hecho en Chile · <a href="' + SITIO + '/" style="color:' + LAPIZ + '">forja.digitalmonster.cl</a></div></div></div></body></html>';
  const prueba = f.tipo === "prueba", tipo = prueba ? String(f.datos.de || "boletin") : f.tipo, d = f.datos || {};
  const aviso = prueba ? "Esto es una prueba: solo te llegó a ti." : "";

  if (tipo === "invitacion") {
    // Invitación a un proyecto: va a personas que quizá aún no tienen cuenta (sin enlace de baja: es un correo único que pidió alguien que la conoce).
    const ir = SITIO + "/invitacion/?t=" + encodeURIComponent(d.token), hasta = new Date(d.expira).toLocaleDateString("es-CL", { day: "numeric", month: "long" });
    return {
      asunto: String(d.de || "").split("@")[0] + " te invitó a trabajar en «" + d.proyecto + "»", baja: "",
      html: marco(rotulo("Una invitación para trabajar juntos") + titulo(d.proyecto) +
        parrafos(d.de + " te invitó a " + (d.rol === "lector" ? "ver" : "trabajar en") + " su proyecto en Forja, un lugar para dar forma a historias, juegos y productos. Para entrar necesitas una cuenta gratis con este mismo correo.") +
        boton(ir, "Ver la invitación") + '<p style="font-size:13px;color:' + LAPIZ + ';margin:0">La invitación vence el ' + esc(hasta) + ". Solo funciona con este correo.</p>",
        "Si no conoces a quien te invitó, ignora este correo: no se creó ninguna cuenta y no volverás a recibir nada.", aviso),
      texto: d.de + " te invitó a " + (d.rol === "lector" ? "ver" : "trabajar en") + " «" + d.proyecto + "» en Forja.\n\nVer la invitación: " + ir + "\n\nVence el " + hasta + " y solo funciona con este correo. Si no conoces a quien te invitó, ignora este correo.",
    };
  }
  if (tipo === "legal") {
    // Aviso de servicio: llega a todas las cuentas, sin enlace de baja. Sin este aviso ninguna versión nueva de los documentos se publica.
    // El texto lo escribe cada versión en docs/legal/versiones.json (`correo`); sin él se usa el resumen.
    const ir = SITIO + "/" + String(d.enlace || "documentos/"), cuando = fechaLarga(d.rige), c = d.correo || {};
    const dest = (Array.isArray(c.destacados) ? c.destacados : []).filter((x) => x && x.t).slice(0, 6);
    const dia = new Date(String(d.rige) + "T12:00:00Z"), num = dia.getUTCDate(), mes = dia.toLocaleDateString("es-CL", { month: "short", timeZone: "UTC" }).replace(".", "");
    // El timbre con la fecha en que rige.
    const sello = '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px"><tr>' +
      '<td style="border:3px double ' + TINTA + ";border-radius:8px;padding:8px 0;width:66px;text-align:center;font-family:Arial,Helvetica,sans-serif;color:" + TINTA + '"><div style="font-size:26px;font-weight:900;line-height:1">' + num + '</div><div style="font-family:\'Courier New\',monospace;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin-top:3px">' + esc(mes) + "</div></td>" +
      '<td style="padding-left:14px;font-size:14px;line-height:1.45;color:' + LAPIZ + '">Desde este día rigen<br>los documentos nuevos de Forja</td></tr></table>';
    const tarjetas = dest.map((x, i) =>
      '<div style="border:1px solid ' + LINEA + ";border-left:3px dashed " + TINTA + ';border-radius:8px;padding:14px 16px;margin:0 0 10px">' +
      '<p style="margin:0 0 5px;font-family:\'Courier New\',monospace;font-size:12px;font-weight:bold;color:' + LAPIZ + '">N.º ' + String(i + 1).padStart(2, "0") + "</p>" +
      '<p style="margin:0 0 5px;font-size:16px;font-weight:bold;line-height:1.35">' + esc(x.t) + '</p><p style="margin:0;font-size:15px;line-height:1.55;color:#3a3a3a">' + esc(x.d) + "</p></div>").join("");
    const previa = c.previa ? '<div style="display:none;max-height:0;overflow:hidden;opacity:0">' + esc(c.previa) + "</div>" : "";
    const cuerpo = previa + sello + titulo(c.titulo || "Te contamos qué cambia en Forja") +
      parrafos(c.intro || d.resumen) + tarjetas +
      (c.igual ? '<div style="background:' + MESA + ';border-radius:8px;padding:14px 16px;margin:16px 0 0">' + rotulo("Lo que no cambia") + '<p style="margin:0;font-size:15px;line-height:1.55">' + esc(c.igual) + "</p></div>" : "") +
      boton(ir, "Ver los cambios lado a lado") +
      '<p style="margin:-8px 0 18px;font-size:13.5px;color:' + LAPIZ + ';line-height:1.5">Cada sección dice si es nueva, si cambió o si sigue igual, así que puedes leer solo lo que te interesa.</p>' +
      parrafos("Hasta el " + cuando + " todo sigue como está. Desde ese día, Forja te pedirá aceptar la versión nueva al entrar. Si no te convence, puedes descargar tus datos y borrar tu cuenta cuando quieras, desde Mi cuenta.") +
      (c.firma ? '<p style="margin:18px 0 0;font-size:15px">' + esc(c.firma) + "</p>" : "");
    return {
      asunto: c.asunto || "Cambian los documentos de Forja: rigen el " + cuando, baja: "",
      html: marco(cuerpo, "Este es un aviso de servicio: llega a todas las cuentas de Forja, aunque no recibas otros correos, porque cambia el acuerdo entre tú y nosotros. ¿Dudas? Escríbenos desde Mi cuenta → Escríbenos.", aviso),
      texto: (c.titulo || "Te contamos qué cambia en Forja") + "\nRige desde el " + cuando + ".\n\n" + (c.intro || d.resumen) + "\n\n" +
        dest.map((x) => "· " + x.t + "\n  " + x.d).join("\n\n") + (c.igual ? "\n\nLo que no cambia: " + c.igual : "") +
        "\n\nVer los cambios lado a lado: " + ir + "\n\nHasta el " + cuando + " todo sigue como está. Desde ese día, Forja te pedirá aceptar la versión nueva al entrar. Si no te convence, puedes descargar tus datos y borrar tu cuenta desde Mi cuenta." +
        (c.firma ? "\n\n" + c.firma : "") + "\n\nEste es un aviso de servicio: llega a todas las cuentas de Forja.",
    };
  }
  if (tipo === "inactiva") {
    // Aviso de servicio por inactividad (90 y 120 días sin entrar). Entrar basta para conservar la cuenta.
    const entrar = SITIO + "/entrar/?siguiente=" + encodeURIComponent("cuenta/#datos"), cuando = fechaLarga(d.borra), dias = d.etapa === 2 ? 120 : 90;
    const t = (d.etapa === 2 ? "Segundo aviso: " : "") + "tu cuenta de Forja se borrará el " + cuando, T = t.charAt(0).toUpperCase() + t.slice(1);
    return {
      asunto: T, baja: "",
      html: marco(rotulo("Aviso de servicio") + titulo(T) +
        parrafos("Hace " + dias + " días que no entras a Forja. Como dicen nuestros Términos de uso, las cuentas sin uso se borran a los 150 días, con todo lo que guardan.\n\nPara conservarla, basta con entrar una vez. Si prefieres irte, puedes descargar antes todos tus datos.") +
        boton(entrar, "Entrar y descargar mis datos") +
        '<p style="font-size:13px;color:' + LAPIZ + ';margin:0">Nunca borramos cuentas con un plan pagado, del equipo Digital Monster o con una vitrina publicada.</p>',
        "Este es un aviso de servicio: llega aunque no recibas otros correos de Forja. Si no creaste esta cuenta, ignóralo y se borrará sola.", aviso),
      texto: T + ".\n\nHace " + dias + " días que no entras a Forja. Las cuentas sin uso se borran a los 150 días, con todo lo que guardan. Para conservarla, basta con entrar una vez. Si prefieres irte, descarga antes tus datos:\n" + entrar,
    };
  }
  if (tipo === "funcion") {
    const baja = enlaceBaja(f.token, "funciones"), ir = okUrl(d.enlace) ? d.enlace : SITIO + "/proyectos/";
    return {
      asunto: "Ya está en Forja: " + d.titulo, baja,
      html: marco(rotulo("Pediste que te avisáramos y ya está lista") + titulo(d.titulo) + parrafos(d.texto) + boton(ir, "Probarla en Forja"),
        'Te llegó porque tocaste «Avísame» en esta herramienta. <a href="' + esc(baja) + '" style="color:' + LAPIZ + '">No quiero avisos de herramientas</a>.', aviso),
      texto: "Ya está en Forja: " + d.titulo + "\n\n" + d.texto + "\n\nProbarla: " + ir + "\n\nNo quiero avisos de herramientas: " + baja,
    };
  }
  if (tipo === "vitrina") {
    const baja = enlaceBaja(f.token, "seguir", d.slug), todas = enlaceBaja(f.token, "vitrinas"), ver = SITIO + "/vitrina/?v=" + encodeURIComponent(d.slug);
    return {
      asunto: d.vitrina + ": " + d.titulo, baja,
      html: marco('<p style="font-size:14px;color:' + LAPIZ + ';margin:0 0 8px">Novedades de <b style="color:' + TINTA + '">' + esc(d.vitrina) + "</b>, un proyecto que sigues</p>" +
        titulo(d.titulo) + parrafos(d.texto) + boton(ver, "Ver la vitrina") +
        '<p style="font-size:13px;color:' + LAPIZ + ';margin:0">Este mensaje lo escribió quien crea el proyecto. Forja no revisa su contenido antes de enviarlo; si algo está mal, <a href="' + esc(ver) + '#reportar" style="color:' + LAPIZ + '">repórtalo</a>.</p>',
        'Te llegó porque sigues este proyecto en Forja. <a href="' + esc(baja) + '" style="color:' + LAPIZ + '">Dejar de seguirlo</a> · <a href="' + esc(todas) + '" style="color:' + LAPIZ + '">No recibir avisos de ninguna vitrina</a>.', aviso),
      texto: "Novedades de " + d.vitrina + "\n\n" + d.titulo + "\n\n" + d.texto + "\n\nVer la vitrina: " + ver + "\n\nDejar de seguirlo: " + baja + "\nNo recibir avisos de vitrinas: " + todas,
    };
  }
  // boletín
  const baja = enlaceBaja(f.token, "boletin");
  const bloque = (t, html) => '<div style="border-top:1px solid ' + LINEA + ';margin:26px 0 0;padding-top:18px">' + rotulo(t) + html + "</div>";
  const nov = (d.novedades || []).filter((n) => n && n.titulo);
  const opo = (d.oportunidades || []).filter((o) => o && o.nombre);
  const vit = (d.vitrinas || []).filter((v) => v && v.slug);
  let html = titulo(d.asunto) + (d.intro ? parrafos(d.intro) : "");
  let texto = d.asunto + "\n\n" + (d.intro || "") + "\n";
  if (nov.length) {
    html += bloque("Novedades de Forja", nov.map((n) => '<p style="margin:0 0 4px;font-weight:bold;font-size:17px">' + esc(n.titulo) + "</p>" + parrafos(n.texto)).join(""));
    texto += "\nNOVEDADES DE FORJA\n" + nov.map((n) => "· " + n.titulo + "\n" + (n.texto || "")).join("\n") + "\n";
  }
  if (opo.length) {
    html += bloque("Oportunidades que se vienen", '<table role="presentation" style="width:100%;border-collapse:collapse;font-size:14.5px">' + opo.map((o) =>
      '<tr><td style="padding:8px 0;border-bottom:1px solid ' + LINEA + '">' + (okUrl(o.url) ? '<a href="' + esc(o.url) + '" style="color:' + TINTA + '">' + esc(o.nombre) + "</a>" : esc(o.nombre)) + '</td><td style="padding:8px 0 8px 10px;border-bottom:1px solid ' + LINEA + ";color:" + LAPIZ + ';text-align:right;white-space:nowrap;font-family:\'Courier New\',monospace;font-size:13px">' + esc(o.cuando) + "</td></tr>").join("") + "</table>" +
      '<p style="font-size:13px;color:' + LAPIZ + ';margin:8px 0 0">Todas las fechas en <a href="' + SITIO + '/oportunidades/" style="color:' + LAPIZ + '">el calendario de Forja</a>. Confirma siempre las bases en la fuente oficial.</p>');
    texto += "\nOPORTUNIDADES QUE SE VIENEN\n" + opo.map((o) => "· " + o.nombre + " — " + o.cuando + (o.url ? " " + o.url : "")).join("\n") + "\n";
  }
  if (vit.length) {
    html += bloque("Proyectos para conocer", vit.map((v) => '<p style="margin:0 0 12px"><a href="' + SITIO + "/vitrina/?v=" + encodeURIComponent(v.slug) + '" style="color:' + TINTA + ';font-weight:bold;font-size:16px">' + esc(v.titulo) + "</a>" + (v.lema ? '<br><span style="color:' + LAPIZ + '">' + esc(v.lema) + "</span>" : "") + "</p>").join(""));
    texto += "\nPROYECTOS PARA CONOCER\n" + vit.map((v) => "· " + v.titulo + " " + SITIO + "/vitrina/?v=" + v.slug).join("\n") + "\n";
  }
  if (d.cierre) { html += '<div style="margin-top:22px">' + parrafos(d.cierre) + "</div>"; texto += "\n" + d.cierre + "\n"; }
  return {
    asunto: d.asunto, baja,
    html: marco(html, 'Te llegó porque te suscribiste al boletín de Forja. <a href="' + esc(baja) + '" style="color:' + LAPIZ + '">Darme de baja</a>.', aviso),
    texto: texto + "\nDarme de baja: " + baja,
  };
}
