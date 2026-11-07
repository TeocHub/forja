// Forja · documentos legales: menú según haya sesión, versión vigente e índice que sigue la lectura.
import { sb, nav, navApp, DOCS } from "./forja.js";
export async function legal(id) {
  const { data } = await sb.auth.getSession();
  if (data.session) navApp(null); else nav(id);
  document.getElementById("l-ver").textContent = "Versión del " + DOCS.fecha;
  const secs = [...document.querySelectorAll("#l-texto section")];
  document.getElementById("l-toc").innerHTML = secs.map((s) => '<a href="#' + s.id + '">' + s.querySelector("h2").textContent + "</a>").join("");
  const links = [...document.querySelectorAll("#l-toc a")];
  const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle("activo", a.hash === "#" + e.target.id)); }), { rootMargin: "-20% 0px -70% 0px" });
  secs.forEach((s) => obs.observe(s));
}
