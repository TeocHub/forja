// Forja · documentos legales: menú según haya sesión, versión e índice que sigue la lectura.
// Las versiones anteriores quedan publicadas en <documento>/<versión>/ (por ejemplo terminos/2026-11-06/) y llaman legal(id, versión).
import { sb, nav, navApp, DOCS, docsPorRegir, fechaDocs, u, esc } from "./forja.js";
export async function legal(id, version) {
  const { data } = await sb.auth.getSession();
  if (data.session) navApp(null); else nav(id);
  const ver = document.getElementById("l-ver"), cambios = document.getElementById("l-cambios");
  if (version && version !== DOCS.version) {
    // Una versión anterior, guardada para consulta.
    const rigio = DOCS.anterior && version === DOCS.anterior.version && docsPorRegir();
    ver.innerHTML = "Versión del " + esc(fechaDocs(version)) + (rigio ? ", vigente hasta que empiece a regir la del " + esc(DOCS.fecha) + "." : ", ya no está vigente.") + ' <a href="' + u(id + "/") + '">Ver la versión ' + (rigio ? "que rige desde el " + esc(DOCS.fecha) : "vigente") + "</a>";
  } else if (docsPorRegir()) {
    // Cambio importante publicado con aviso: rige desde DOCS.rige; hasta entonces sigue la anterior.
    ver.innerHTML = "Versión del " + esc(DOCS.fecha) + ". Publicada el " + esc(DOCS.publicada) + " y vigente desde el " + esc(DOCS.fecha) +
      '. Hasta entonces rige la <a href="' + u(id + "/" + DOCS.anterior.version + "/") + '">versión del ' + esc(DOCS.anterior.fecha) + "</a>.";
    if (cambios) cambios.hidden = false;
  } else {
    ver.textContent = "Versión del " + DOCS.fecha;
    if (cambios && cambios.dataset.version === DOCS.version) cambios.hidden = false; // lo que cambió en esta versión sigue a la vista
  }
  const secs = [...document.querySelectorAll("#l-texto section")];
  document.getElementById("l-toc").innerHTML = secs.map((s) => '<a href="#' + s.id + '">' + s.querySelector("h2").textContent + "</a>").join("");
  const links = [...document.querySelectorAll("#l-toc a")];
  const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle("activo", a.hash === "#" + e.target.id)); }), { rootMargin: "-20% 0px -70% 0px" });
  secs.forEach((s) => obs.observe(s));
}
