const STORAGE_KEY = "mundial-2026-miniweb-v1";
let state = loadState();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return { matches: generateMatches(), knockout: [] };
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function baseStats() {
  const stats = {};
  Object.entries(GROUPS).forEach(([group, teams]) => {
    teams.forEach(team => stats[team] = { team, group, pj:0, g:0, e:0, p:0, gf:0, gc:0, dg:0, pts:0 });
  });
  return stats;
}

function calculateStats() {
  const stats = baseStats();
  state.matches.filter(m => m.played).forEach(m => {
    const hg = Number(m.homeGoals), ag = Number(m.awayGoals);
    if (Number.isNaN(hg) || Number.isNaN(ag)) return;
    const h = stats[m.home], a = stats[m.away];
    h.pj++; a.pj++;
    h.gf += hg; h.gc += ag; a.gf += ag; a.gc += hg;
    if (hg > ag) { h.g++; a.p++; h.pts += 3; }
    else if (hg < ag) { a.g++; h.p++; a.pts += 3; }
    else { h.e++; a.e++; h.pts++; a.pts++; }
  });
  Object.values(stats).forEach(s => s.dg = s.gf - s.gc);
  return stats;
}

function sortTeams(a,b) {
  return b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.team.localeCompare(b.team);
}

function standingsByGroup() {
  const stats = calculateStats();
  const groups = {};
  Object.keys(GROUPS).forEach(g => {
    groups[g] = Object.values(stats).filter(s => s.group === g).sort(sortTeams);
  });
  return groups;
}

function getQualifiers() {
  const groups = standingsByGroup();
  const direct = [];
  const thirds = [];
  Object.entries(groups).forEach(([group, rows]) => {
    direct.push({...rows[0], seed: `1${group}`}, {...rows[1], seed: `2${group}`});
    thirds.push({...rows[2], seed: `3${group}`});
  });
  const bestThirds = thirds.sort(sortTeams).slice(0,8).map(x => x.team);
  return { direct, thirds, bestThirds, all: [...direct.map(x => x.team), ...bestThirds] };
}

function renderGroups() {
  const container = document.getElementById("groupsContainer");
  const groups = standingsByGroup();
  const { bestThirds } = getQualifiers();
  container.innerHTML = Object.entries(groups).map(([group, rows]) => `
    <article class="panel group-card">
      <div class="group-head"><h2>Grupo ${group}</h2><span class="badge">${rows.filter(r => r.pj).length ? "En juego" : "Pendiente"}</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Equipo</th><th>Pts</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th></tr></thead>
          <tbody>${rows.map((r,i) => `<tr class="${i<2 ? "qualify" : bestThirds.includes(r.team) && i===2 ? "third-ok" : ""}"><td>${r.team}</td><td><b>${r.pts}</b></td><td>${r.pj}</td><td>${r.g}</td><td>${r.e}</td><td>${r.p}</td><td>${r.gf}</td><td>${r.gc}</td><td>${r.dg}</td></tr>`).join("")}</tbody>
        </table>
      </div>
      <div class="matches">
        ${state.matches.filter(m => m.group === group).map(matchTemplate).join("")}
      </div>
    </article>
  `).join("");
}

function matchTemplate(m) {
  return `<div class="match" data-id="${m.id}">
    <span class="team home">${m.home}</span>
    <input class="score" type="number" min="0" inputmode="numeric" data-field="homeGoals" value="${m.homeGoals}">
    <span class="vs">-</span>
    <input class="score" type="number" min="0" inputmode="numeric" data-field="awayGoals" value="${m.awayGoals}">
    <span class="team away">${m.away}</span>
    <input class="check" type="checkbox" data-field="played" ${m.played ? "checked" : ""}>
  </div>`;
}

function renderThirds() {
  const { thirds, bestThirds } = getQualifiers();
  document.getElementById("thirdsTable").innerHTML = `<div class="table-wrap"><table><thead><tr><th>Equipo</th><th>Grupo</th><th>Pts</th><th>DG</th><th>GF</th><th>Estado</th></tr></thead><tbody>${thirds.map(t => `<tr class="${bestThirds.includes(t.team) ? "third-ok" : ""}"><td>${t.team}</td><td>${t.group}</td><td><b>${t.pts}</b></td><td>${t.dg}</td><td>${t.gf}</td><td>${bestThirds.includes(t.team) ? "Avanza" : "Fuera"}</td></tr>`).join("")}</tbody></table></div>`;
}

function buildKnockout() {
  const q = getQualifiers().all;
  const names = [...q];
  while (names.length < 32) names.push("Por definir");
  return Array.from({length:16}, (_,i) => ({ id:`R32-${i+1}`, round:"Dieciseisavos", home:names[i], away:names[31-i], homeGoals:"", awayGoals:"" }));
}

function renderKnockout() {
  if (!state.knockout.length) state.knockout = buildKnockout();
  // Refresh only teams, keep scores
  const fresh = buildKnockout();
  state.knockout = fresh.map((m,i) => ({...m, homeGoals: state.knockout[i]?.homeGoals ?? "", awayGoals: state.knockout[i]?.awayGoals ?? ""}));
  document.getElementById("knockoutContainer").innerHTML = `<div class="round"><h3 class="round-title">Dieciseisavos de final</h3>${state.knockout.map(k => `<div class="match knock-match" data-ko="${k.id}"><span class="team home">${k.home}</span><input class="score" type="number" min="0" inputmode="numeric" data-field="homeGoals" value="${k.homeGoals}"><span class="vs">-</span><input class="score" type="number" min="0" inputmode="numeric" data-field="awayGoals" value="${k.awayGoals}"><span class="team away">${k.away}</span></div>`).join("")}</div>`;
}

function renderAll() { renderGroups(); renderThirds(); renderKnockout(); saveState(); }

document.addEventListener("input", e => {
  const matchEl = e.target.closest(".match[data-id]");
  const koEl = e.target.closest(".match[data-ko]");
  const field = e.target.dataset.field;
  if (matchEl && field) {
    const m = state.matches.find(x => x.id === matchEl.dataset.id);
    m[field] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    renderAll();
  }
  if (koEl && field) {
    const k = state.knockout.find(x => x.id === koEl.dataset.ko);
    k[field] = e.target.value;
    saveState();
  }
});

document.addEventListener("change", e => {
  if (e.target.matches('.check')) {
    const matchEl = e.target.closest(".match[data-id]");
    const m = state.matches.find(x => x.id === matchEl.dataset.id);
    m.played = e.target.checked;
    renderAll();
  }
});

document.querySelectorAll(".tab").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById(btn.dataset.view).classList.add("active");
}));

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("¿Seguro que quieres borrar todos los marcadores?")) {
    localStorage.removeItem(STORAGE_KEY);
    state = loadState();
    renderAll();
  }
});

renderAll();
