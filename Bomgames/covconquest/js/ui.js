/* =========================================================================
   COVENANT & CONQUEST — UI
   ========================================================================= */

const $ = id => document.getElementById(id);
let pendingAction = null;   // { type, callback }
let myFaction = FACTION.NEPHITE;
let audioOn = false;

/* ------------------------------------------------------- SCREEN 1: SETUP */

function showSetup() {
  $('game').classList.add('hidden');
  $('setup').classList.remove('hidden');
  $('result').classList.add('hidden');
}

function pickFaction(f) {
  myFaction = f;
  document.querySelectorAll('.faction-choice').forEach(el => el.classList.toggle('sel', el.dataset.f === f));
  $('startBtn').disabled = false;
}

function startMatch() {
  const enemy = myFaction === FACTION.NEPHITE ? FACTION.LAMANITE : FACTION.NEPHITE;
  newGame(myFaction, enemy);
  $('setup').classList.add('hidden');
  $('game').classList.remove('hidden');
  startTurn();
  render();
}

/* ---------------------------------------------------------- PROMPT MODAL */

function askZone(title, cb) { pendingAction = { type: 'zone', title, cb }; renderModal(); }
function askTarget(title, cb) { pendingAction = { type: 'target', title, cb }; renderModal(); }

function renderModal() {
  const m = $('modal');
  if (!pendingAction) { m.classList.add('hidden'); return; }
  m.classList.remove('hidden');
  $('modalTitle').textContent = pendingAction.title;
  const body = $('modalBody');
  body.innerHTML = '';
  if (pendingAction.type === 'zone') {
    S.zones.forEach((z, i) => {
      const b = document.createElement('button');
      b.className = 'zone-pick';
      b.innerHTML = `<b>${z.name}</b><small>${z.control ? who({ faction: z.control }) : 'Neutral'} · ${z.units.length}u ${z.forts.length + z.outposts.length}f</small>`;
      b.onclick = () => { const cb = pendingAction.cb; pendingAction = null; renderModal(); cb(i); };
      body.appendChild(b);
    });
  } else if (pendingAction.type === 'target') {
    const p = activeP();
    const all = [];
    S.zones.forEach((z, zi) => z.units.concat(z.forts, z.outposts).forEach(x => {
      if (x.owner !== p.idx) all.push({ inst: x, zi });
    }));
    all.forEach(({ inst, zi }) => {
      const d = cardDef(inst);
      const b = document.createElement('button');
      b.className = 'zone-pick enemy';
      b.innerHTML = `<b>${d.name}</b><small>${zi !== undefined ? S.zones[zi].name : ''} · ${isFort(inst) ? fortHp(inst) + ' HP' : unitHp(inst) + ' HP'} · ${who(S.players[inst.owner])}</small>`;
      b.onclick = () => { const cb = pendingAction.cb; pendingAction = null; renderModal(); cb(inst); };
      body.appendChild(b);
    });
  } else if (pendingAction.type === 'unit') {
    const p = activeP();
    const all = [];
    S.zones.forEach(z => z.units.concat(z.forts, z.outposts).forEach(x => { if (x.owner !== p.idx) all.push(x); }));
    all.forEach(inst => {
      const d = cardDef(inst);
      const b = document.createElement('button');
      b.className = 'zone-pick enemy';
      b.innerHTML = `<b>${d.name}</b><small>${isFort(inst) ? fortHp(inst) + ' HP' : unitHp(inst) + ' HP'}</small>`;
      b.onclick = () => { const cb = pendingAction.cb; pendingAction = null; renderModal(); cb(inst); };
      body.appendChild(b);
    });
  }
}

// wire engine prompts to UI when it's the player's turn
function bindPrompts() {
  promptZone = (title) => new Promise(res => askZone(title, res));
  promptTarget = (title) => new Promise(res => askTarget(title, res));
  promptEnemyUnit = (title) => new Promise(res => askTarget(title, res));
}

/* ------------------------------------------------------------ CARD RENDER */

/* --------------------------------------------------- procedural card art */

function sigilFor(d) {
  const f = d.faction;
  const t = d.type;
  const uid = 'g' + d.id;
  const bg = f === FACTION.NEPHITE
    ? ['#24405e', '#0f1e2e']
    : f === FACTION.LAMANITE ? ['#4a1e14', '#200b06'] : ['#463716', '#221a09'];

  let glyph = '';
  const P = f === FACTION.NEPHITE
    ? { wall: '#8fc4f0', roof: '#5f9fd0', ground: '#4a7ba8', leaf: '#9ad6a8', sun: '#ffe9a8' }
    : { wall: '#f0a080', roof: '#c9704a', ground: '#a04e30', leaf: '#e0a060', sun: '#ffcf8a' };

  if (t === 'fortification' || t === 'outpost') {
    glyph = `<g fill="${P.wall}">
      <rect x="14" y="34" width="10" height="20"/><rect x="28" y="30" width="10" height="24"/>
      <rect x="42" y="34" width="10" height="20"/><rect x="56" y="30" width="10" height="24"/>
      <rect x="70" y="34" width="10" height="20"/>
      <rect x="10" y="28" width="74" height="8" rx="2"/>
    </g><rect x="30" y="42" width="20" height="14" fill="${P.roof}"/>`;
  } else if (t === 'tactic') {
    glyph = `<g>
      <circle cx="47" cy="40" r="17" fill="none" stroke="${P.sun}" stroke-width="2.5" opacity=".9"/>
      <circle cx="47" cy="40" r="9" fill="${P.sun}" opacity=".28"/>
      <path d="M47 22 v-7 M47 65 v-7 M29 40 h-7 M72 40 h-7" stroke="${P.sun}" stroke-width="2" stroke-linecap="round"/>
    </g>`;
  } else if (t === 'outpost' || d.id === 'hiddenCamp') {
    glyph = `<g fill="${P.wall}">
      <path d="M20 54 L47 30 L74 54 Z"/>
      <rect x="26" y="52" width="42" height="8"/>
    </g>`;
  } else {
    // unit: a stylised figure + weapon
    glyph = `<g>
      <circle cx="47" cy="26" r="7" fill="${P.ground}"/>
      <path d="M47 33 L47 50 M47 38 L36 46 M47 38 L58 46 M47 50 L40 60 M47 50 L54 60"
        stroke="${P.ground}" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M62 20 L62 56" stroke="${P.leaf}" stroke-width="3" stroke-linecap="round"/>
      <path d="M62 20 L68 26 L62 32 Z" fill="${P.leaf}"/>
    </g>`;
  }

  return `<div class="art ph ${f} ${t}">
    <svg viewBox="0 0 94 66" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
      <defs><linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/>
      </linearGradient></defs>
      <rect width="94" height="66" fill="url(#${uid})"/>
      <circle cx="47" cy="40" r="26" fill="#ffffff08"/>
      ${glyph}
    </svg>
  </div>`;
}

function cardHTML(inst, opts = {}) {
  const d = cardDef(inst);
  const f = d.faction;
  const onBoard = inst.owner !== undefined && inst.owner !== null;
  const cls = ['card', f, 't-' + d.type, opts.mini ? 'mini' : '', opts.dim ? 'dim' : ''].join(' ');

  const isUnitT = d.type === 'unit' || d.type === 'hero';
  const isFortT = d.type === 'fortification' || d.type === 'outpost';
  const atk = isUnitT ? unitAtk(inst) : 0;
  const hp = (isUnitT || isFortT)
    ? (onBoard ? (isFortT ? fortHp(inst) : unitHp(inst)) : d.hp)
    : 0;

  const art = d.art ? `<img src="${d.art}" alt="">` : sigilFor(d);
  const dmgOverlay = (onBoard && inst.dmg > 0 && (isUnitT || isFortT)) ? `<div class="dmg">-${inst.dmg}</div>` : '';

  const atkTxt = isUnitT ? `⚔${atk}` : (isFortT && d.shield && onBoard ? `⛨${fortShield(inst)}` : '');
  const hpTxt = (isUnitT || isFortT) ? `♥${hp}` : '';

  return `<div class="${cls}" data-uid="${inst.uid}" style="--sub:${subColor(d)}">
    ${art}${dmgOverlay}
    <div class="topbar">
      <span class="ricon">${f === FACTION.NEPHITE ? '🕊️' : f === FACTION.LAMANITE ? '⚔️' : '✦'}</span>
      <span class="ctitle">${d.name}</span>
      <span class="fstat">${d.cost}</span>
    </div>
    <div class="divider">${d.subtype || d.type.toUpperCase()}</div>
    <div class="rules">
      ${d.ability ? `<b>${d.ability.name}.</b> ${d.ability.text}` : ''}
      ${opts.mini ? '' : (d.quote ? `<div class="quote">"${d.quote}"</div>` : '')}
    </div>
    <div class="footer">
      <span class="badge atk">${atkTxt}</span>
      <span class="badge set">${d.rarity || 'hero'}</span>
      <span class="badge hp">${hpTxt}</span>
    </div>
  </div>`;
}

function subColor(d) {
  if (d.type === 'hero') return '#f0c040';
  if (d.type === 'tactic') return '#c080ff';
  if (d.type === 'outpost') return '#ff9a3c';
  if (d.type === 'fortification') return '#7ec8ff';
  return '#ffffff22';
}

/* -------------------------------------------------------------- RENDER ALL */

function render() {
  if (!S) return;
  renderTopbar();
  renderBoard();
  renderHand();
  renderLog();
  renderHeroRow();
  renderPromptBanner();
  checkResult();
  wireTips(document);
}

function renderTopbar() {
  const me = S.players[0], foe = S.players[1];
  const mKey = me.res === 'faith' ? 'faith' : 'might';
  const fKey = foe.res === 'faith' ? 'faith' : 'might';
  $('meName').textContent = who(me) + 's';
  $('meRes').textContent = (mKey === 'faith' ? '🕊️' : '⚔️') + ' ' + me[mKey] + ' ' + mKey.toUpperCase();
  $('foeName').textContent = who(foe) + 's';
  $('foeRes').textContent = (fKey === 'faith' ? '🕊️' : '⚔️') + ' ' + foe[fKey] + ' ' + fKey.toUpperCase();
  $('meDeck').textContent = me.deck.length;
  $('meHand').textContent = me.hand.length + '/' + MAX_HAND;
  $('foeHand').textContent = foe.hand.length;
  $('foeDeck').textContent = foe.deck.length;
  $('roundNum').textContent = S.round + ' / ' + START_ROUNDS;
  $('zonesHeld').textContent = countZones(me) + ' / 3 zones';
}

function renderHeroRow() {
  const me = S.players[0], foe = S.players[1];
  $('myHeroes').innerHTML = me.boardHeroes.map(h => cardHTML(h, { mini: true })).join('')
    || '<div class="empty">Command row — no prophets yet</div>';
  const el = $('foeHeroes');
  if (el) el.innerHTML = foe.boardHeroes.map(h => cardHTML(h, { mini: true })).join('')
    || '<div class="empty">Enemy command row is empty</div>';
}

function renderBoard() {
  const board = $('zones');
  board.innerHTML = S.zones.map((z, zi) => {
    const isMyTurn = S.active === 0 && !S.over;
    const ctrl = z.control ? `<span class="ctrl ${z.control}">${who({ faction: z.control })}</span>` : '<span class="ctrl none">Neutral</span>';
    const lock = z.locked ? '<span class="lock">☮ Cease-fire</span>' : '';
    const forts = z.forts.concat(z.outposts);
    return `<div class="zone ${z.control || ''} ${z.locked ? 'locked' : ''}" data-zone="${zi}">
      <div class="zhead"><b>${z.name}</b>${ctrl}${lock}</div>
      <div class="forts">${forts.map(f => cardHTML(f, { mini: true })).join('')}</div>
      <div class="units">${z.units.map(u => renderUnit(u, zi, isMyTurn)).join('')}</div>
      ${!forts.length && !z.units.length ? '<div class="zempty">No forces — neutral ground</div>' : ''}
    </div>`;
  }).join('');

  // attach events
  board.querySelectorAll('.zone').forEach(zoneEl => {
    const zi = +zoneEl.dataset.zone;
    zoneEl.querySelectorAll('.unit-slot').forEach(sl => {
      sl.onclick = (e) => { e.stopPropagation(); onUnitClick(sl.dataset.uid, zi, sl.dataset.role); };
    });
  });
}

function renderUnit(u, zi, isMyTurn) {
  const d = cardDef(u);
  const mine = u.owner === 0;
  const sel = selectedUid === u.uid;
  const canAtk = mine && isMyTurn && !S.over;
  return `<div class="unit-slot ${mine ? 'mine' : 'foe'} ${sel ? 'sel' : ''} ${canAtk ? 'canatk' : ''}" data-uid="${u.uid}" data-role="unit">
    ${cardHTML(u, { mini: true })}
    ${canAtk ? '<div class="atkbtn">⚔</div>' : ''}
  </div>`;
}

function renderHand() {
  const me = S.players[0];
  const hand = $('hand');
  const myTurn = S.active === 0 && !S.over;
  hand.innerHTML = me.hand.map(c => {
    const d = cardDef(c);
    const playable = myTurn && canPlay(c).ok;
    return `<div class="handcard ${playable ? 'playable' : ''} ${d.faction} ${d.type}" data-uid="${c.uid}">${cardHTML(c)}</div>`;
  }).join('');
  hand.querySelectorAll('.handcard').forEach(el => {
    el.onclick = () => onHandClick(el.dataset.uid);
  });
}

function renderLog() {
  const el = $('log');
  el.innerHTML = S.log.slice(-40).reverse().map(l => `<div>${l}</div>`).join('');
}

let selectedUid = null;
let selectedHandUid = null;

function renderPromptBanner() {
  const b = $('banner');
  if (S.over) { b.classList.add('hidden'); return; }
  b.classList.remove('hidden');
  if (S.active === 0) {
    const sel = findByUid(selectedUid);
    if (sel && isUnit(sel)) b.innerHTML = `<b>${cardDef(sel).name} selected.</b> Choose a zone to attack. <button onclick="clearSel()">Cancel</button>`;
    else if (selectedHandUid) b.innerHTML = `<b>Playing a card…</b> Choose a land zone to deploy it. <button onclick="cancelPlay()">Cancel</button>`;
    else b.innerHTML = `Your turn — select a card from your hand, or click one of your units to attack.`;
  } else {
    b.innerHTML = `<b>Enemy turn…</b> ${who(S.players[1])} is moving.`;
  }
}

function findByUid(uid) {
  for (const z of S.zones) {
    const f = z.units.concat(z.forts, z.outposts).find(x => x.uid === uid);
    if (f) return f;
  }
  return S.players.flatMap(p => p.boardHeroes).find(x => x.uid === uid) || null;
}

function isUnit(inst) { return cardDef(inst).type === 'unit'; }
function isHeroOnBoard(inst) { const d = cardDef(inst); return d.type === 'hero'; }

/* ------------------------------------------------------------- INTERACTION */

function onHandClick(uid) {
  if (S.active !== 0 || S.over) return;
  const inst = S.players[0].hand.find(c => c.uid === uid);
  if (!inst) return;
  const chk = canPlay(inst);
  if (!chk.ok) { logMsg(`✖ ${chk.why}`); return; }
  const d = cardDef(inst);

  selectedUid = null;
  if (d.type === 'hero') { playCard(uid, 0); return; }
  if (d.type === 'tactic') {
    if (d.id === 'covenantPeace') {
      askZone('Choose a zone for the Covenant of Peace:', (zi) => { if (zi !== null && zi !== undefined) { inst._targetZone = zi; playCard(uid, 0); } });
      return;
    }
    if (d.id === 'wildAmbush') {
      askTarget('Choose a target for Surprise Wilderness Ambush:', (t) => { if (t) { inst._target = t; playCard(uid, 0); } });
      return;
    }
    if (d.id === 'feignedRetreat') {
      askTarget('Choose an enemy unit to lure and weaken:', (t) => { if (t) { inst._target = t; playCard(uid, 0); } });
      return;
    }
    playCard(uid, 0); return;
  }
  // zone card → select play mode
  selectedHandUid = uid;
  render();
}

function onUnitClick(uid, zi, role) {
  if (S.active !== 0 || S.over) return;
  const inst = findByUid(uid);
  if (!inst) return;
  const mine = inst.owner === 0;
  const d = cardDef(inst);

  // playing a selected card into this zone
  if (selectedHandUid) {
    playCard(selectedHandUid, zi);
    selectedHandUid = null; render(); return;
  }

  if (mine && isUnit(inst)) { selectedUid = selectedUid === uid ? null : uid; render(); }
  else if (mine && isHeroOnBoard(inst)) { selectedUid = selectedUid === uid ? null : uid; render(); }
}

function onZoneClick(zi) {
  if (S.active !== 0 || S.over) return;
  // attack mode: attack into this zone
  if (selectedUid) {
    const u = findByUid(selectedUid);
    if (u) { const fromZone = S.zones.findIndex(z => z.units.some(x => x.uid === selectedUid)); attack(u, fromZone, zi); }
    selectedUid = null; render(); return;
  }
  // deploy mode
  if (selectedHandUid) { playCard(selectedHandUid, zi); selectedHandUid = null; render(); }
}

function clearSel() { selectedUid = null; render(); }
function cancelPlay() { selectedHandUid = null; render(); }

/* ---------------------------------------------------------------- RESULT */

function checkResult() {
  if (S.over) {
    const r = $('result');
    r.classList.remove('hidden');
    const me = S.players[0];
    $('resultTitle').textContent = S.winner ? (who(S.winner) + 's Win!') : 'Draw';
    $('resultTitle').style.color = S.winner && S.winner.faction === FACTION.NEPHITE ? '#7ec8ff' : '#ff6b4a';
    $('resultSub').textContent = S.winner
      ? `The ${who(S.winner)}s prevail over ${S.zones.filter(z => z.control === me.faction).length}/3 zones.`
      : 'The battle ends.';
  }
}

/* ------------------------------------------------------------- TOOLTIP */

function showTip(e, inst) {
  const d = cardDef(inst);
  const tip = $('tip');
  tip.innerHTML = `
    <div class="tip-h ${d.faction}">${d.name} <span class="tip-cost">${d.cost} ${isP2(d.faction) ? '🕊️' : '⚔️'}</span></div>
    <div class="tip-sub">${d.subtype} · ${d.rarity ? d.rarity.toUpperCase() : 'HERO'}</div>
    ${d.type === 'unit' || d.type === 'hero' ? `<div class="tip-stats">⚔ ${d.atk} &nbsp; 🛡 ${d.hp}</div>` : ''}
    ${d.type === 'fortification' || d.type === 'outpost' ? `<div class="tip-stats">🛡 ${d.hp} &nbsp; •&nbsp; Block ${d.shield}</div>` : ''}
    <div class="tip-body"><b>${d.ability.name}.</b> ${d.ability.text}</div>
    <div class="tip-flavor">${d.flavor}</div>
    <div class="tip-quote">"${d.quote}"</div>`;
  tip.classList.remove('hidden');
  moveTip(e);
}

function isP2(f) { return f === FACTION.NEPHITE; }

function moveTip(e) {
  const tip = $('tip');
  const pad = 14;
  let x = e.clientX + pad, y = e.clientY + pad;
  const r = tip.getBoundingClientRect();
  if (x + r.width > window.innerWidth - 8) x = e.clientX - r.width - pad;
  if (y + r.height > window.innerHeight - 8) y = window.innerHeight - r.height - 8;
  tip.style.left = Math.max(8, x) + 'px';
  tip.style.top = Math.max(8, y) + 'px';
}

function hideTip() { $('tip').classList.add('hidden'); }

function wireTips(root) {
  root.querySelectorAll('[data-uid]').forEach(el => {
    if (el.classList.contains('card') && el.parentElement.classList.contains('card')) return;
    el.addEventListener('mouseenter', e => {
      const inst = findByUid(el.dataset.uid) || (S && S.players[0].hand.find(c => c.uid === el.dataset.uid));
      if (inst) showTip(e, inst);
    });
    el.addEventListener('mousemove', moveTip);
    el.addEventListener('mouseleave', hideTip);
  });
}

/* ------------------------------------------------------------------ INIT */

window.addEventListener('DOMContentLoaded', () => {
  bindPrompts();
  document.querySelectorAll('.faction-choice').forEach(el => {
    el.onclick = () => pickFaction(el.dataset.f);
  });
  $('startBtn').onclick = startMatch;
  $('endTurnBtn').onclick = () => { if (!S.over) { selectedUid = null; selectedHandUid = null; endTurn(); } };
  $('restartBtn').onclick = () => { S = null; showSetup(); };

  // click-to-attack / deploy on zone background
  document.addEventListener('click', (e) => {
    const zh = e.target.closest('.zone');
    if (zh && !e.target.closest('.unit-slot')) onZoneClick(+zh.dataset.zone);
  });

  showSetup();
});