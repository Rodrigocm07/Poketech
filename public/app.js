const API = window.POKETECH_API || "";
const $ = (id) => document.getElementById(id);
const state = { player: "jogador1", catalog: [], gameId: null, guesses: [], attemptsLeft: 5, finished: false, dex: [], view: "game" };

function api(path, options={}) {
  return fetch(`${API}${path}`, { ...options, headers: { "Content-Type":"application/json", ...(options.headers||{}) } })
    .then(async response => {
      const data = await response.json().catch(()=>({}));
      if (!response.ok) { const error = new Error(data.erro || `Erro ${response.status}`); error.data = data; error.status = response.status; throw error; }
      return data;
    });
}
function imagePath(id){ return `/assets/pokemon/${String(id).padStart(3,"0")}.png`; }
function sprite(id, name, cls="mini-sprite") {
  return `<img class="${cls}" src="${imagePath(id)}" alt="${name}" onerror="this.outerHTML='<span class=&quot;sprite-fallback&quot;>◉</span>'">`;
}
function setMessage(text, kind=""){ $("message").textContent=text; $("message").className=`message ${kind}`; }
function setBusy(busy){ $("guessButton").disabled=busy || !state.gameId || state.finished; $("newGameButton").disabled=busy; }
function findPokemon(text){const q=text.trim().toLowerCase();return state.catalog.find(p=>p.pokemon.toLowerCase()===q || p.id===q.padStart(3,"0"));}
function numberLabel(value){return ({maior:"↑ Maior",menor:"↓ Menor",igual:"✓ Igual"})[value] || "—";}
function cell(value, kind){return `<span class="result-cell ${kind||""}">${value}</span>`;}
function renderGuesses(){
  if(!state.guesses.length){$("guessHistory").innerHTML='<div class="empty-state"><div class="empty-ball">?</div><b>Nenhum palpite ainda</b><span>Seus resultados aparecerão aqui.</span></div>';}
  else $("guessHistory").innerHTML=state.guesses.map(g=>{
    const d=g.dicas;
    const types=(d.tipos||[]).map(t=>`<span class="type-chip ${t.resultado==="certo"?"good":t.resultado==="existe"?"exists":"bad"}">${t.tipo}</span>`).join("");
    return `<div class="guess-row"><div class="guess-name">${sprite(g.id,g.pokemon)}<span>${g.pokemon}</span></div>${cell(numberLabel(d.id),d.id==="igual"?"good":"")}${cell(numberLabel(d.peso),d.peso==="igual"?"good":"")}${cell(numberLabel(d.altura),d.altura==="igual"?"good":"")}<div class="type-results">${types||"—"}</div></div>`;
  }).reverse().join("");
  $("attemptsLeft").textContent=state.attemptsLeft;
  $("attemptTrack").innerHTML=Array.from({length:5},(_,i)=>`<span class="${i < state.guesses.length?"filled":""}"></span>`).join("");
}
async function startGame(){
  setBusy(true); setMessage("Preparando uma nova partida...");
  try{
    let result;
    try { result=await api(`/users/${state.player}/games`,{method:"POST",body:"{}"}); }
    catch(error){
      if(!error.message.includes("andamento")) throw error;
      const match=error.message.match(/jogo-\d+/);
      if(!match) throw error;
      result={gameId:match[0]};
    }
    state.gameId=result.gameId;
    const game=await api(`/users/${state.player}/games/${state.gameId}`);
    state.guesses=(game.palpites||[]).map(p=>({id:p.id,pokemon:p.pokemon,dicas:p.dicas}));
    state.attemptsLeft=game.tentativasRestantes;
    state.finished=game.resultado!=="em_andamento";
    renderGuesses();
    setMessage(state.finished?"Esta partida já foi encerrada. Inicie uma nova para continuar.":"Partida pronta. Faça seu primeiro palpite.");
  }catch(e){setMessage(e.message,"error");}
  finally{setBusy(false);}
}
async function submitGuess(){
  const raw=$("pokemonInput").value;
  const pokemon=findPokemon(raw);
  if(!pokemon){setMessage("Escolha um Pokémon válido da lista.","error");return;}
  if(state.guesses.some(g=>g.id===pokemon.id)){setMessage("Você já tentou esse Pokémon.","error");return;}
  setBusy(true);
  try{
    const result=await api(`/users/${state.player}/games/${state.gameId}/guess`,{method:"POST",body:JSON.stringify({pokemon:pokemon.pokemon})});
    state.guesses.push({id:pokemon.id,pokemon:pokemon.pokemon,dicas:result.dicas});
    state.attemptsLeft=result.tentativasRestantes;
    $("pokemonInput").value="";
    if(result.resultado==="vitoria"){
      state.finished=true;setMessage(`Você acertou! ${result.capturado.pokemon} foi adicionado à Pokédex de ${state.player==="jogador1"?"Jogador 1":"Jogador 2"}.`,"success");
      await loadDex();
    }else if(result.resultado==="derrota"){
      state.finished=true;setMessage(`Fim de jogo! O Pokémon era ${result.secreto.pokemon}. Tente novamente.`,"error");
    }else setMessage("Palpite registrado. Confira as dicas e tente novamente.");
    renderGuesses();
  }catch(e){setMessage(e.message,"error");}
  finally{setBusy(false);}
}
async function loadDex(){
  try{state.dex=await api(`/users/${state.player}/pokedex`);renderDex();}
  catch(e){$("dexGrid").innerHTML=`<p class="message error">${e.message}</p>`;}
}
function renderDex(){
  const data=state.dex, caught=new Set(data.pokedex.filter(p=>p.capturado).map(p=>p.id));
  const count=data.capturados||0,total=data.total||state.catalog.length;
  $("capturedCount").textContent=count;$("remainingCount").textContent=total-count;
  $("progressText").textContent=`${Math.round(count/Math.max(total,1)*100)}%`;
  $("progressBar").style.width=`${count/Math.max(total,1)*100}%`;
  $("dexHeading").textContent=`Pokédex de ${data.jogador||"Jogador"}`;
  const q=$("dexSearch").value.trim().toLowerCase();
  $("dexGrid").innerHTML=state.catalog.filter(p=>!q||p.pokemon.toLowerCase().includes(q)||p.id.includes(q)).map(p=>{
    const captured=caught.has(p.id);
    return `<article class="pokemon-card ${captured?"captured":""}"><span class="dex-number">#${p.id}</span>${sprite(p.id,p.pokemon,"dex-sprite")}<b>${captured?p.pokemon:"Pokémon não capturado"}</b><div class="dex-status">${captured?"✓ CAPTURADO":"BLOQUEADO"}</div></article>`;
  }).join("");
}
function switchView(view){
  state.view=view;$("gameView").classList.toggle("hidden",view!=="game");$("dexView").classList.toggle("hidden",view!=="dex");
  $("pageTitle").textContent=view==="game"?"Termo Pokémon":"Pokédex";
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  if(view==="dex")loadDex();
}
async function init(){
  try{
    state.catalog=await api("/pokedex");
    $("apiStatus").textContent="API conectada";
    $("apiStatus").previousElementSibling.style.background="var(--green)";
    $("pokemonOptions").innerHTML=state.catalog.map(p=>`<option value="${p.pokemon}">#${p.id}</option>`).join("");
    $("pokemonInput").disabled=false;$("guessButton").disabled=false;
    await startGame();
  }catch(e){$("apiStatus").textContent="API indisponível";setMessage(`Não foi possível conectar ao backend: ${e.message}`,"error");}
}
$("playerSelect").addEventListener("change",async e=>{
  state.player=e.target.value;state.gameId=null;state.guesses=[];state.attemptsLeft=5;state.finished=false;
  renderGuesses();if(state.view==="dex")await loadDex();else await startGame();
});
$("newGameButton").addEventListener("click",startGame);
$("guessButton").addEventListener("click",submitGuess);
$("pokemonInput").addEventListener("keydown",e=>{if(e.key==="Enter")submitGuess();});
$("dexSearch").addEventListener("input",renderDex);
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));
init();
