const state = {
  player: getSavedPlayer(),
  catalog: [],
  dex: null,
};

setupPlayerModal(async (chosenPlayer) => {
  if (chosenPlayer === state.player) return;
  state.player = chosenPlayer;
  await loadDex();
});

function setMessage(text, kind = "") {
  const el = $("message");
  if (!el) return;
  el.textContent = text;
  el.className = `message ${kind}`;
}

function renderDex() {
  if (!state.dex) return;

  const caughtIds = new Set(
    (state.dex.pokedex || [])
      .filter((p) => p.capturado)
      .map((p) => String(p.id).padStart(3, "0")),
  );

  const count = state.dex.capturados || 0;
  const total = state.dex.total || state.catalog.length || 151;
  const pct = Math.round((count / Math.max(total, 1)) * 100);

  if ($("capturedCount")) $("capturedCount").textContent = count;
  if ($("remainingCount"))
    $("remainingCount").textContent = Math.max(total - count, 0);
  if ($("progressText")) $("progressText").textContent = `${pct}%`;
  if ($("progressBar")) $("progressBar").style.width = `${pct}%`;
  if ($("dexHeading")) {
    $("dexHeading").textContent =
      `Pokédex de ${state.dex.jogador || "Jogador"}`;
  }

  const q = ($("dexSearch")?.value || "")
    .trim()
    .toLowerCase()
    .replace(/^#/, "");

  const filtered = state.catalog.filter((p) => {
    const paddedId = String(p.id).padStart(3, "0");
    return !q || p.pokemon.toLowerCase().includes(q) || paddedId.includes(q);
  });

  if ($("dexGrid")) {
    $("dexGrid").innerHTML = filtered
      .map((p) => {
        const paddedId = String(p.id).padStart(3, "0");
        const captured = caughtIds.has(paddedId);
        return `
          <article class="pokemon-card ${captured ? "captured" : ""}">
            <span class="dex-number">#${paddedId}</span>
            ${sprite(paddedId, p.pokemon, "dex-sprite")}
            <b>${captured ? p.pokemon : "Pokémon não capturado"}</b>
            <div class="dex-status">${captured ? "✓ CAPTURADO" : "BLOQUEADO"}</div>
          </article>`;
      })
      .join("");
  }
}

async function loadDex() {
  try {
    state.dex = await api(`/users/${state.player}/pokedex`);
    setMessage("");
    renderDex();
  } catch (e) {
    setMessage(`Erro ao carregar Pokédex: ${e.message}`, "error");
  }
}

async function init() {
  try {
    state.catalog = await api("/pokedex");
    if ($("apiStatus")) $("apiStatus").textContent = "API conectada";
    if ($("apiStatus")?.previousElementSibling) {
      $("apiStatus").previousElementSibling.style.background =
        "var(--green, #22c55e)";
    }
    if ($("pokemonOptions")) {
      $("pokemonOptions").innerHTML = state.catalog
        .map(
          (p) =>
            `<option value="${p.pokemon}">#${String(p.id).padStart(3, "0")}</option>`,
        )
        .join("");
    }
    if ($("pokemonInput")) $("pokemonInput").disabled = false;

    await loadDex();
  } catch (e) {
    console.error(e);
    const statusEl = $("apiStatus");
    if (statusEl) statusEl.textContent = "API indisponível";
    setMessage(`Erro ao conectar com o backend: ${e.message}`, "error");
  }
}

if ($("dexSearch")) {
  $("dexSearch").addEventListener("input", renderDex);
}

init();
