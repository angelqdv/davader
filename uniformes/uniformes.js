let allKits = [];
let currentFilter = 'all';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
  loadKits();
});

async function loadKits() {
  try {
    const res = await fetch('uniformes.json');
    allKits = await res.json();
  } catch (e) {
    console.warn("Fetch fallback to inline/local:", e);
    allKits = [
      {
        id: "dv_local_2627",
        team: "Darth Vader FC",
        teamCode: "dv",
        name: "Obsidian Crimson (Kit Titular)",
        type: "local",
        season: "2026/2027",
        creator: "David Peñuela",
        description: "Inspirada en la armadura del Lord Sith. Base negro grafito carbón con franja vertical carmesí mate y detalles monoespaciados tácticos en cuello y mangas.",
        primaryColor: "#0c0d12",
        secondaryColor: "#991b1b",
        accentColor: "#ffffff",
        colors: ["#0c0d12", "#991b1b", "#141722", "#ffffff"],
        collar: "Cuello en V Táctico Imperial",
        shorts: "Negro Carbón con vivos Rojo Carmesí",
        socks: "Negro con franja carmesí y monograma DV",
        tags: ["Darth Vader", "Titular", "Obsidiana", "Carmesí"],
        formula: "Base: 1/1/1 | Franja Central: 153/27/27 | Dorsal: Blanco Puro (Tipografía 21)"
      },
      {
        id: "fcb_local_1899",
        team: "FCB David",
        teamCode: "fcb",
        name: "Blaugrana Sagrado (Camp Nou 1899)",
        type: "local",
        season: "2026/2027",
        creator: "David Peñuela",
        description: "Los colores legendarios del club: Franjas azul marino profundo y granate noble con acabados en oro Senyera en cuello y dorsales.",
        primaryColor: "#0a1424",
        secondaryColor: "#a50044",
        accentColor: "#edbb00",
        colors: ["#0a1424", "#a50044", "#edbb00", "#ffffff"],
        collar: "Cuello Polo Retro con borde dorado",
        shorts: "Azul Marino Camp Nou",
        socks: "Franjas horizontales Azul y Grana",
        tags: ["FCB David", "Titular", "Blaugrana", "1899"],
        formula: "Base: Azul 10/20/36 | Franja: Grana 165/0/68 | Dorsal: Oro 237/187/0"
      }
    ];
  }

  document.getElementById('count-all').textContent = allKits.length;
  renderKits();
}

function renderJerseySvg(kit) {
  const c1 = kit.primaryColor || '#111';
  const c2 = kit.secondaryColor || '#991b1b';
  const c3 = kit.accentColor || '#fff';

  return `
    <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 6px 14px rgba(0,0,0,0.6));">
      <!-- Cuerpo de la Camiseta -->
      <path d="M30 20 L40 26 L60 26 L70 20 L86 36 L74 46 L68 40 L68 85 L32 85 L32 40 L26 46 L14 36 Z" fill="${c1}" stroke="${c3}" stroke-width="1.2" />
      
      <!-- Mangas laterales -->
      <path d="M14 36 L26 46 L21 51 L10 40 Z" fill="${c2}" />
      <path d="M86 36 L74 46 L79 51 L90 40 Z" fill="${c2}" />
      
      <!-- Franja central o detalle de pecho -->
      <rect x="42" y="26" width="16" height="59" fill="${c2}" opacity="0.9" />
      
      <!-- Cuello -->
      <path d="M40 26 C45 32 55 32 60 26 Z" fill="${c3}" opacity="0.95" />

      <!-- Escudo en el pecho -->
      <circle cx="39" cy="40" r="3.5" fill="${c3}" stroke="${c2}" stroke-width="0.8" />
      
      <!-- Logo dorsal / patrocinador estilizado -->
      <line x1="45" y1="52" x2="55" y2="52" stroke="${c3}" stroke-width="1.5" stroke-linecap="round" />
      <line x1="46" y1="56" x2="54" y2="56" stroke="${c3}" stroke-width="1" stroke-linecap="round" />
    </svg>
  `;
}

function renderKits() {
  const container = document.getElementById('kits-container');
  if (!container) return;

  const filtered = allKits.filter(kit => {
    // Filtro por categoría
    if (currentFilter === 'dv' && kit.teamCode !== 'dv') return false;
    if (currentFilter === 'fcb' && kit.teamCode !== 'fcb') return false;
    if (currentFilter === 'local' && kit.type !== 'local') return false;
    if (currentFilter === 'visitante' && kit.type !== 'visitante') return false;
    if (currentFilter === 'portero' && kit.type !== 'portero') return false;
    if (currentFilter === 'especial' && kit.type !== 'especial') return false;

    // Filtro por búsqueda
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const matchName = kit.name.toLowerCase().includes(q);
      const matchTeam = kit.team.toLowerCase().includes(q);
      const matchTags = (kit.tags || []).some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchTeam && !matchTags) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: #131622; border-radius: 12px; border: 1px dashed #2d374f;">
        <span style="font-size: 2rem;">🔍</span>
        <h3 style="color: #fff; margin-top: 8px;">No se encontraron uniformes</h3>
        <p style="color: #94a3b8; font-size: 0.85rem;">Prueba cambiando los filtros o la búsqueda.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(kit => {
    const swatches = (kit.colors || [kit.primaryColor, kit.secondaryColor]).map(c => 
      `<span class="color-dot" style="background-color: ${c};" title="${c}"></span>`
    ).join('');

    return `
      <div class="kit-card">
        <div class="kit-preview-box">
          <span class="kit-badge-type badge-${kit.type}">${kit.type}</span>
          ${renderJerseySvg(kit)}
        </div>
        <div class="kit-body">
          <div class="kit-team-name">
            <span>${kit.teamCode === 'dv' ? '⚔️' : '🔵🔴'}</span>
            <span>${kit.team} • ${kit.season}</span>
          </div>
          <h3 class="kit-title">${kit.name}</h3>
          <p class="kit-desc">${kit.description}</p>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
            <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 700;">Paleta:</span>
            <div class="color-swatches">${swatches}</div>
          </div>

          <div class="kit-actions">
            <button class="btn-kit" onclick="openKitModal('${kit.id}')">📋 Ficha Técnica eFootball</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function setFilter(type, btnEl) {
  currentFilter = type;
  document.querySelectorAll('#team-filter-group .filter-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderKits();
}

function onSearchInput(val) {
  currentSearch = val.trim();
  renderKits();
}

function openKitModal(id) {
  const kit = allKits.find(k => k.id === id);
  if (!kit) return;

  const modalBody = document.getElementById('modal-body-content');
  const swatches = (kit.colors || []).map(c => 
    `<div style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; font-family: monospace; color: #cbd5e1;">
       <span class="color-dot" style="background:${c};"></span>
       <span>${c}</span>
     </div>`
  ).join('');

  modalBody.innerHTML = `
    <div style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
      <div style="background: #0c0d12; padding: 18px; border-radius: 12px; border: 1px solid #232a3e; display: flex; align-items: center; justify-content: center;">
        ${renderJerseySvg(kit)}
      </div>
      <div style="flex: 1; min-width: 260px;">
        <span class="kit-badge-type badge-${kit.type}">${kit.type} • ${kit.season}</span>
        <h2 style="color: #fff; font-size: 1.4rem; font-weight: 900; margin: 10px 0 4px;">${kit.name}</h2>
        <div style="font-size: 0.82rem; color: #38bdf8; font-weight: 700; margin-bottom: 8px;">${kit.team} • Creador: ${kit.creator}</div>
        <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.5;">${kit.description}</p>
      </div>
    </div>

    <hr style="border: none; border-top: 1px solid #232a3e; margin: 20px 0;" />

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; font-size: 0.83rem;">
      <div>
        <strong style="color: #ffffff; display: block; margin-bottom: 2px;">👕 Cuello:</strong>
        <span style="color: #94a3b8;">${kit.collar || 'Estándar'}</span>
      </div>
      <div>
        <strong style="color: #ffffff; display: block; margin-bottom: 2px;">🩳 Pantalón:</strong>
        <span style="color: #94a3b8;">${kit.shorts || 'A juego'}</span>
      </div>
      <div>
        <strong style="color: #ffffff; display: block; margin-bottom: 2px;">🧦 Medias:</strong>
        <span style="color: #94a3b8;">${kit.socks || 'A juego'}</span>
      </div>
    </div>

    <div style="margin-top: 16px;">
      <strong style="color: #ffffff; display: block; margin-bottom: 8px; font-size: 0.85rem;">🎨 Paleta Hexadecimal:</strong>
      <div style="display: flex; gap: 14px; flex-wrap: wrap;">${swatches}</div>
    </div>

    <div style="margin-top: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong style="color: #ffffff; font-size: 0.85rem;">⚙️ Fórmula de Configuración eFootball:</strong>
        <button class="btn-kit" style="flex: none; padding: 4px 10px; font-size: 0.75rem;" onclick="copyFormula('${escape(kit.formula)}')">📋 Copiar Fórmula</button>
      </div>
      <div class="formula-box">${kit.formula}</div>
    </div>
  `;

  document.getElementById('kit-modal').classList.add('open');
}

function closeKitModal() {
  document.getElementById('kit-modal').classList.remove('open');
}

function closeModalOnBackdrop(e) {
  if (e.target.id === 'kit-modal') {
    closeKitModal();
  }
}

function copyFormula(formulaText) {
  const decoded = unescape(formulaText);
  navigator.clipboard.writeText(decoded).then(() => {
    alert("¡Fórmula copiada al portapapeles!");
  });
}
