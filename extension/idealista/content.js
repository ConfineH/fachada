(function () {
  const API_BASE =
    localStorage.getItem("fachada_api_base") ||
    "https://fachada-tau.vercel.app";

  function normalize(text) {
    return (text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function findAgencyNameEl() {
    const selectors = [
      "[data-testid='advertiser-name']",
      ".professional-name",
      "a[href*='inmobiliaria']",
      ".about-advertiser-name",
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el?.textContent?.trim()) return el;
    }
    return null;
  }

  async function injectBadge(nameEl, name) {
    if (nameEl.dataset.fachadaBadge) return;
    nameEl.dataset.fachadaBadge = "1";

    const wrap = document.createElement("span");
    wrap.className = "fachada-badge";
    wrap.style.cssText =
      "display:inline-flex;margin-left:8px;align-items:center;gap:4px;font-size:12px;font-weight:600;color:#92400e;background:#fef3c7;padding:2px 8px;border-radius:999px;";
    wrap.textContent = "Fachada…";
    nameEl.appendChild(wrap);

    try {
      const url = `${API_BASE}/api/agencies/match?name=${encodeURIComponent(name)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.match) {
        wrap.textContent = "Sin datos Fachada";
        wrap.style.background = "#f5f5f4";
        wrap.style.color = "#57534e";
        return;
      }
      const inq = data.match.ratings?.inquilino;
      const prop = data.match.ratings?.propietario;
      const inqLabel =
        inq?.reviewCount > 0 ? inq.averageRating.toFixed(1) : "—";
      const propLabel =
        prop?.reviewCount > 0 ? prop.averageRating.toFixed(1) : "—";
      wrap.innerHTML = "";
      const link = document.createElement("a");
      link.href = `${API_BASE}${data.match.urlPath}`;
      link.target = "_blank";
      link.rel = "noopener";
      link.style.color = "inherit";
      link.textContent = `Inq. ${inqLabel} · Prop. ${propLabel}`;
      wrap.appendChild(link);
    } catch {
      wrap.textContent = "Fachada no disponible";
    }
  }

  function scan() {
    const nameEl = findAgencyNameEl();
    if (!nameEl) return;
    const name = nameEl.textContent?.trim();
    if (!name || normalize(name).length < 3) return;
    void injectBadge(nameEl, name);
  }

  scan();
  const observer = new MutationObserver(() => scan());
  observer.observe(document.body, { childList: true, subtree: true });
})();
