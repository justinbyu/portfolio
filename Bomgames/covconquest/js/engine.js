/* =========================================================================
   COVENANT & CONQUEST — Game Engine
   Zone-based tactical card game. 3 land zones, 10 rounds, 2 resources.
   ========================================================================= */

const ZONES = ['Zarahemla', 'Jershon', 'Bountiful'];
const MAX_HAND = 7;
const MAX_UNITS_PER_ZONE = 4;
const MAX_FORTS_PER_ZONE = 3;
const START_ROUNDS = 10;
const BASE_RESOURCE = 3;
const RESOURCE_PER_ROUND = 2;   // ramps the pace up each round
const MAX_RESOURCE = 12;

const ABILITY = {}; // registry: ability key -> handler(state, ctx)

let S = null; // global game state

// expose for debugging / automated testing
if (typeof window !== 'undefined') window.S = null;
function _syncS() { if (typeof window !== 'undefined') window.S = S; }

/* ------------------------------------------------------------ STATE SETUP */

function buildDeck(list) {
  return list.map(id => ({ uid: Math.random().toString(36).slice(2, 9), id, revealed: true }));
}

function newGame(playerFaction, enemyFaction) {
  const pDeck = playerFaction === FACTION.NEPHITE ? STARTER_NEPHITE : STARTER_LAMANITE;
  const eDeck = enemyFaction === FACTION.NEPHITE ? STARTER_NEPHITE : STARTER_LAMANITE;

  S = {
    round: 1,
    turn: 0,              // 0 = player, 1 = enemy
    active: 0,
    over: false,
    winner: null,
    log: [],
    zones: ZONES.map(z => ({
      name: z,
      control: null,      // faction id controlling, or null = neutral
      units: [], forts: [], outposts: [],
      locked: false,      // cease-fire
    })),
    players: [
      {
        idx: 0, faction: playerFaction,
        res: RES[playerFaction], faith: 8, might: 8,
        deck: shuffle(buildDeck(pDeck)),
        hand: [], boardHeroes: [],
        drawn: 0, bonusDraw: 0, spent: 0, deployedThisTurn: 0,
        bonusRes: 0, negate: 0, atkBuff: 0, atkBuffTurns: 0, converted: 0,
      },
      {
        idx: 1, faction: enemyFaction,
        res: RES[enemyFaction], faith: 8, might: 8,
        deck: shuffle(buildDeck(eDeck)),
        hand: [], boardHeroes: [],
        drawn: 0, bonusDraw: 0, spent: 0, deployedThisTurn: 0,
        bonusRes: 0, negate: 0, atkBuff: 0, atkBuffTurns: 0, converted: 0,
      },
    ],
  };

  for (const p of S.players) {
    // starting hand
    for (let i = 0; i < 4; i++) draw(p);
    // player starts with control of their home zone
    const home = ZONES.indexOf(playerFaction === FACTION.NEPHITE ? 'Zarahemla' : 'Bountiful');
    S.zones[home].control = playerFaction;
  }
  // enemy takes the zone adjacent to theirs as contested start
  S.zones[2].control = enemyFaction;

  logMsg(`⚔️ Battle for the Land of Promise begins — Round 1 of ${START_ROUNDS}`);
  _syncS();
  return S;
}

function opponent(i) { return S.players[1 - i]; }
function activeP() { return S.players[S.active]; }
function isP(faction) { return activeP().faction === faction; }

/* -------------------------------------------------------------- UTILITIES */

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function draw(p, n = 1) {
  for (let i = 0; i < n; i++) {
    if (!p.deck.length) { logMsg(`${who(p)} has no cards left to draw.`); return; }
    if (p.hand.length >= MAX_HAND) { logMsg(`${who(p)}'s hand is full (${MAX_HAND}).`); return; }
    const c = p.deck.shift();
    // reveal ambush cards at draw time for the owner; opponent sees them face-down
    c.revealed = true;
    p.hand.push(c);
    p.drawn++;
  }
}

function cardDef(inst) { return CARDS[inst.id]; }

function who(p) {
  return p.faction === FACTION.NEPHITE ? 'Nephite' : 'Lamanite';
}

function logMsg(t) {
  S.log.push(t);
  if (S.log.length > 120) S.log.shift();
  if (typeof render === 'function') render();
}

function resOf(p) { return p.res; }

function gainRes(p, n) {
  const key = p.res;
  const cap = MAX_RESOURCE;
  p[key] = Math.max(0, Math.min(cap, p[key] + n));
  logMsg(`${who(p)} ${n >= 0 ? 'gains' : 'loses'} ${Math.abs(n)} ${key === 'faith' ? '🕊️' : '⚔️'} (${p[key]}).`);
}

function randInt(n) { return Math.floor(Math.random() * n); }

function emptyZone(z) { return z.units.length + z.forts.length + z.outposts.length === 0; }

/* --------------------------------------------------------- CATEGORY HELPERS */

function allUnits(p) {
  const out = [];
  S.zones.forEach(z => z.units.forEach(u => out.push(u)));
  return out;
}

function allForts(p) {
  const out = [];
  S.zones.forEach(z => { z.forts.forEach(f => out.push(f)); z.outposts.forEach(f => out.push(f)); });
  return out;
}

function isFort(inst) {
  const d = cardDef(inst);
  return d.type === 'fortification' || d.type === 'outpost';
}

/* -------------------------------------------------------------- STAT MODIFIERS */

function unitAtk(u) {
  const d = cardDef(u);
  let a = d.atk || 0;
  if (u.tempAtk) a += u.tempAtk;
  if (u.permAtk) a += u.permAtk;
  if (u.doubled) a = a * 2;
  if (u.owner === undefined || u.owner === null) return Math.max(0, a);
  const p = S.players[u.owner];
  if (p && p.atkBuffTurns > 0) a += p.atkBuff;
  return Math.max(0, a);
}

function unitHp(u) {
  const d = cardDef(u);
  return Math.max(0, (d.hp - u.dmg) + (u.bonusHp || 0));
}

function fortHp(f) {
  const d = cardDef(f);
  return Math.max(0, (d.hp - f.dmg));
}

function fortShield(f) {
  const d = cardDef(f);
  // Shield is a consumable pool: it depletes as it absorbs damage and
  // regenerates to its full value at the start of its owner's turn.
  if (f.shieldLeft === undefined || f.shieldLeft === null) f.shieldLeft = d.shield || 0;
  if (f.shieldMod) return Math.max(0, f.shieldLeft + f.shieldMod);
  return Math.max(0, f.shieldLeft);
}

function resetShield(f) {
  const d = cardDef(f);
  f.shieldLeft = d.shield || 0;
}

/* --------------------------------------------------------------- COMBAT */

function canAttack(u, z, targetIdx) {
  const p = S.players[u.owner];
  const z2 = S.zones[targetIdx];
  if (z2.locked) return false;
  if (z === z2 && z.control === p.faction && isFortificationTarget()) return false;
  // can't attack friendly-controlled zones except forts? allow offensive only on enemy/neutral
  if (z2.control === p.faction) return false;
  return true;
}

function isFortificationTarget() { return false; }

/**
 * Attack with unit `u` in zone index `zi` at target zone index `ti`.
 * Returns true if attack resolved.
 */
function attack(u, zi, ti) {
  const d = cardDef(u);
  const p = S.players[u.owner];
  const tz = S.zones[ti];

  if (u.ambush) { u.ambush = false; u.tempAtk += 3; u.deployedTurn = S.round; logMsg(`${d.name} bursts from ambush with +3 ATK!`); }
  if (u.attacked) { logMsg(`${d.name} has already acted this round.`); return false; }
  u.attacked = true;

  let dmg = unitAtk(u);
  logMsg(`${who(p)}'s ${d.name} (${dmg} ATK) attacks ${tz.name}...`);

  // Siege workshop / breaker modifiers vs forts
  const isFortAttack = tz.forts.length + tz.outposts.length > 0;
  if (isFortAttack) {
    // find blocking fort in target zone (first non-destroyed)
    let block = tz.forts.concat(tz.outposts).find(f => fortHp(f) > 0);
    if (block) {
      let eff = dmg;
      if (d.id === 'heavyVanguard') eff = Math.max(0, eff - 0); // breaker handled below
      // Flanking Cavalry ignores first fort
      if (d.id === 'flankingCavalry') {
        // skip one fort: remove the cheapest-blocking first fort from consideration
        logMsg(`${d.name} Flank — bypasses the first fortification!`);
        block = tz.forts.concat(tz.outposts).slice(1).find(f => fortHp(f) > 0);
      }
      if (block) {
        let shield = fortShield(block);
        // Siege engine workshop: +3 damage vs fortifications if one is present
        if (tz.forts.concat(tz.outposts).some(f => cardDef(f).id === 'siegeWorkshop')) eff += 3;
        // Breaker (Lamanite Heavy Vanguard) ignores the first 3 shield
        if (d.id === 'heavyVanguard') { eff += Math.min(3, shield); shield = Math.max(0, shield - 3); }
        // consume the shield that actually absorbed damage
        const absorbed = Math.min(shield, Math.max(0, eff));
        block.shieldLeft = Math.max(0, (block.shieldLeft || 0) - absorbed);
        const through = Math.max(0, eff - absorbed);
        block.dmg += through;
        logMsg(`${cardDef(block).name} absorbs ${absorbed} shield (${block.shieldLeft} left) and takes ${through}.`);
        if (fortHp(block) <= 0) { destroy(block); }
        resolveRetaliation(u, zi, d);
        updateControl(ti, p);
        return true;
      }
    }
  }

  // no fort blocking → hit units / capture
  const def = tz.units.find(x => x.owner !== u.owner);
  if (def) {
    if (d.id === 'archingCorps') { logMsg(`${d.name} fires from the air — no retaliation.`); def.dmg += dmg; if (unitHp(def) <= 0) destroy(def); return true; }
    def.dmg += dmg;
    logMsg(`${cardDef(def).name} takes ${dmg}.`);
    if (unitHp(def) <= 0) destroy(def);
    resolveRetaliation(u, zi, d);
  } else {
    // empty zone → capture on attack if survives retaliation
    resolveRetaliation(u, zi, d);
    // attacker survived and the zone is now undefended → contest control
    if (S.zones[zi].units.some(x => x.uid === u.uid)) {
      updateControl(ti, p);
    }
  }
  updateControl(ti, p);
  return true;
}

/**
 * Zone control rule: a faction controls a zone if it holds a Fortification/Outpost
 * there, or fields 2+ units in it. Otherwise the zone is neutral.
 */
function updateControl(ti, actor) {
  const z = S.zones[ti];
  const pieces = z.units.concat(z.forts, z.outposts);
  if (!pieces.length) {
    if (z.control) { z.control = null; logMsg(`◇ ${z.name} is abandoned and becomes neutral.`); }
    return;
  }
  // count holdings per faction
  const tally = {};
  pieces.forEach(x => {
    const f = S.players[x.owner].faction;
    const weight = isFort(x) ? 2 : 1;   // a fort counts double
    tally[f] = (tally[f] || 0) + weight;
  });
  const best = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
  const leader = best[0];
  const leaderScore = best[1];
  const rival = Object.entries(tally).filter(([f]) => f !== leader).map(([, v]) => v)[0] || 0;

  let newCtl = null;
  if (leaderScore >= 2 && leaderScore > rival) newCtl = leader;

  if (newCtl !== z.control) {
    if (newCtl) logMsg(`✦ ${z.name} falls to the ${who({ faction: newCtl })}s!`);
    z.control = newCtl;
  }
}

function resolveRetaliation(u, zi, d) {
  const tz = S.zones[zi];
  const foe = tz.units.find(x => x.owner !== u.owner);
  const ranged = d.id === 'archingCorps';
  if (foe && !ranged) {
    const fatk = unitAtk(foe);
    u.dmg += fatk;
    logMsg(`${cardDef(foe).name} retaliates for ${fatk}.`);
    if (unitHp(u) <= 0) destroy(u);
  }
}

function destroy(inst) {
  const d = cardDef(inst);
  // find & remove
  for (const z of S.zones) {
    z.units = z.units.filter(x => x.uid !== inst.uid);
    z.forts = z.forts.filter(x => x.uid !== inst.uid);
    z.outposts = z.outposts.filter(x => x.uid !== inst.uid);
  }
  const wasHero = d.type === 'hero';
  S.players.forEach(p => { p.boardHeroes = p.boardHeroes.filter(x => x.uid !== inst.uid); });
  logMsg(`💀 ${d.name} is destroyed.`);
  // "Convert 3 enemy leaders" — destroying enemy heroes counts for the Nephite side
  if (wasHero && inst.owner !== undefined) {
    const killer = S.players[1 - inst.owner];
    if (killer.faction === FACTION.NEPHITE) {
      killer.converted++;
      logMsg(`☘️ ${killer.converted}/3 enemy leaders converted.`);
    }
  }
  // zone control check
  S.zones.forEach((z, i) => updateControl(i, null));
  checkWin();
}

/* ------------------------------------------------------------ ABILITIES */

function triggerOnDeploy(inst, zi) {
  const d = cardDef(inst);
  const a = d.ability;
  if (!a) return;
  const p = S.players[inst.owner];

  switch (a.trigger) {
    case 'deploy':
      switch (d.id) {
        case 'moroni':
          S.zones[zi].units.forEach(x => { if (x.owner === inst.owner) x.tempAtk += 2; });
          logMsg(`🏴 ${d.name}: Title of Liberty — all friendly units +2 ATK this turn.`);
          break;
        case 'helaman':
          gainRes(p, 2);
          S.zones[zi].forts.forEach(f => { f.dmg = Math.max(0, f.dmg - 2); });
          logMsg(`🕊️ ${d.name}: Faith Tested — +2 Faith, fortifications repaired 2.`);
          break;
        case 'alma':
          healZone(inst.owner, zi, 2);
          logMsg(`🙏 ${d.name}: Prayer of Faith — heals 2 to a friendly piece.`);
          break;
        case 'samuel':
          S.zones.forEach(z => z.units.forEach(x => { if (x.owner !== inst.owner) { x.dmg += 1; if (unitHp(x) <= 0) destroy(x); } }));
          draw(p, 1);
          logMsg(`📢 ${d.name}: Voice of Warning — 1 damage to ALL enemy units, draw 1.`);
          break;
        case 'zarahemnah':
          // weakest enemy fort
          const enemyForts = [];
          S.zones.forEach(z => z.forts.concat(z.outposts).forEach(f => { if (S.players[f.owner].faction !== p.faction) enemyForts.push(f); }));
          if (enemyForts.length) {
            enemyForts.sort((x, y) => fortHp(x) - fortHp(y));
            enemyForts[0].dmg += 2;
            logMsg(`💀 ${d.name}: strikes ${cardDef(enemyForts[0]).name} for 2.`);
            if (fortHp(enemyForts[0]) <= 0) destroy(enemyForts[0]);
          }
          break;
        case 'amalickiah':
          gainRes(p, 2); draw(p, 2);
          logMsg(`💰 ${d.name}: Dissenter Rally — +2 Might, draw 2.`);
          break;
        case 'lamoni':
          gainRes(p, 1);
          const foe = opponent(inst.owner);
          const fkey = foe.res; // steal faith-ish
          if (foe.faith > 0) { foe.faith--; p.faith++; logMsg(`🕊️ ${d.name} steals 1 Faith.`); }
          break;
        case 'striplingWarriors':
          // give a friendly unit +1 ATK permanently
          const friendly = S.zones[zi].units.find(x => x.owner === inst.owner && x.uid !== inst.uid);
          if (friendly) { friendly.permAtk = (friendly.permAtk || 0) + 1; logMsg(`⚔️ ${d.name}: ${cardDef(friendly).name} gains +1 ATK permanently.`); }
          break;
        case 'zoramites':
          inst.ambush = true;
          logMsg(`🗡️ ${d.name} enters face-down (Ambush).`);
          break;
      }
      break;
    case 'turnStart':
      if (d.id === 'helaman') { gainRes(p, 2); }
      if (d.id === 'alma') { healZone(inst.owner, zi, 2); }
      break;
  }
}

function healZone(owner, zi, amt) {
  const z = S.zones[zi];
  const pool = z.units.concat(z.forts, z.outposts).filter(x => x.owner === owner && (unitHp(x) < cardDef(x).hp || fortHp(x) < cardDef(x).hp));
  if (pool.length) { const t = pool[0]; if (cardDef(t).type === 'unit') { t.dmg = Math.max(0, t.dmg - amt); } else { t.dmg = Math.max(0, t.dmg - amt); } logMsg(`♥ ${cardDef(t).name} heals ${amt}.`); }
}

/* ------------------------------------------------------------ PLAY A CARD */

function canPlay(inst) {
  const d = cardDef(inst);
  const p = activeP();
  const key = p.res;
  const cost = d.cost;
  if (p[key] < cost) return { ok: false, why: `Not enough ${key === 'faith' ? '🕊️ Faith' : '⚔️ Might'} (need ${cost}, have ${p[key]})` };
  if (d.type === 'tactic') {
    // Zoramite discount only for zoramites deploy; skip
    return { ok: true };
  }
  // zone/board limits
  if (d.type === 'hero' || d.subtype === 'PROPHET' || d.type === 'hero') {
    // heroes go to boardHeroes, max 3
    if (p.boardHeroes.length >= 3) return { ok: false, why: 'Hero board full (3)' };
    return { ok: true, where: 'boardHeroes' };
  }
  return { ok: true, where: 'zone' };
}

function playCard(uid, zi) {
  const p = activeP();
  const idx = p.hand.findIndex(c => c.uid === uid);
  if (idx < 0) return;
  const inst = p.hand[idx];
  const d = cardDef(inst);
  const chk = canPlay(inst);
  if (!chk.ok) { logMsg(`✖ Cannot play ${d.name}: ${chk.why}`); return; }
  const key = p.res;
  p[key] -= d.cost;
  p.hand.splice(idx, 1);
  p.spent += d.cost;
  p.deployedThisTurn++;

  if (d.type === 'tactic') { resolveTactic(inst, d); afterPlay(); return; }

  if (chk.where === 'boardHeroes') {
    inst.owner = p.idx;
    inst.dmg = 0; inst.bonusHp = 0;
    p.boardHeroes.push(inst);
    p._everHadHero = true;
    logMsg(`⭐ ${who(p)} deploys ${d.name} to the Command row!`);
    triggerOnDeploy(inst, 0);
    afterPlay();
    return;
  }

  // deploy to zone
  const z = S.zones[zi];
  const asFort = d.type === 'fortification' || d.type === 'outpost' || (d.ability?.deploysAs === 'fortification');
  if (asFort) {
    const cap = z.forts.length + z.outposts.length;
    if (cap >= MAX_FORTS_PER_ZONE) { logMsg(`✖ ${z.name} already has ${MAX_FORTS_PER_ZONE} fortifications.`); undoLast(p, inst, d); return; }
    inst.owner = p.idx; inst.dmg = 0;
    if (d.type === 'outpost') z.outposts.push(inst); else z.forts.push(inst);
    if (d.id === 'hiddenCamp') { p.bonusDraw++; logMsg(`🏕️ ${d.name}: +1 draw each turn.`); }
  } else {
    if (z.units.length >= MAX_UNITS_PER_ZONE) { logMsg(`✖ ${z.name} is full of units (${MAX_UNITS_PER_ZONE}).`); undoLast(p, inst, d); return; }
    inst.owner = p.idx; inst.dmg = 0; inst.deployedTurn = S.round;
    // Vanguard: first unit each turn +2 HP
    if (p.deployedThisTurn === 1 && p.faction === FACTION.NEPHITE && isNephiteVanguard(d)) inst.bonusHp = 2;
    // Zoramite ambush cost discount applied at play time
    z.units.push(inst);
    if (!z.control) { /* stays neutral until attack/capture */ }
  }
  logMsg(`${who(p)} plays ${d.name} in ${z.name}.`);
  updateControl(zi, p);
  triggerOnDeploy(inst, zi);
  updateControl(zi, p);
  afterPlay();
}

function isNephiteVanguard(d) { return d.id === 'lehiVanguard'; }

function undoLast(p, inst, d) {
  p.res = Math.min(MAX_RESOURCE, p.res + d.cost);
  p.hand.push(inst); p.spent -= d.cost; p.deployedThisTurn--;
}

function resolveTactic(inst, d) {
  const p = activeP();
  switch (d.id) {
    case 'titleLiberty':
      S.zones.forEach(z => z.units.forEach(u => { if (u.owner === p.idx) u.tempAtk = (u.tempAtk || 0) + 2; }));
      p.atkBuff = 0; // immediate buff via tempAtk
      logMsg(`🏴 Title of Liberty — all friendly units +2 ATK this turn!`);
      break;
    case 'deliverance':
      p.negate = 1;
      logMsg(`🛡️ Miraculous Deliverance — the next incoming attack is negated.`);
      break;
    case 'voiceWarning':
      gainRes(p, 3); draw(p, 2);
      logMsg(`📜 Voice of Warning — +3 resource, draw 2.`);
      break;
    case 'covenantPeace':
      if (inst._targetZone !== undefined && inst._targetZone !== null) {
        S.zones[inst._targetZone].locked = true;
        healAll(2);
        logMsg(`☮ Covenant of Peace — ${S.zones[inst._targetZone].name} is sealed next turn. Both sides heal 2.`);
      } else logMsg(`☮ Covenant of Peace fizzles — no zone chosen.`);
      break;
    case 'wildAmbush':
      if (inst._target) {
        applyDirect(inst._target, 4);
        logMsg(`🗡 Surprise Wilderness Ambush strikes ${cardDef(inst._target).name} for 4!`);
      } else logMsg(`🗡 Surprise Wilderness Ambush finds no target.`);
      break;
    case 'feignedRetreat':
      if (inst._target) {
        const t = inst._target;
        // pull the enemy unit into an adjacent empty-ish zone
        const fromZi = S.zones.findIndex(z => z.units.some(x => x.uid === t.uid));
        if (fromZi >= 0) {
          const adj = S.zones.map((z, i) => i).filter(i => Math.abs(i - fromZi) === 1);
          if (adj.length) {
            const to = adj[0];
            const src = S.zones[fromZi];
            src.units = src.units.filter(x => x.uid !== t.uid);
            S.zones[to].units.push(t);
            logMsg(`🏃 Feigned Retreat drags ${cardDef(t).name} into ${S.zones[to].name}!`);
          }
        }
        t.dmg += 1;
        logMsg(`${cardDef(t).name} is drawn into the open and loses 1 HP.`);
      } else logMsg(`🏃 Feigned Retreat finds no target.`);
      break;
    case 'nightRaid':
      {
        const foe = opponent(p.idx);
        gainRes(foe, -4);
        S.zones.forEach(z => z.units.forEach(u => { if (u.owner === foe.idx) u.tempAtk = (u.tempAtk || 0) - 1; }));
        logMsg(`🌙 Night Raid — enemy loses 4 Faith and 1 ATK this turn.`);
      }
      break;
    case 'overwhelmNumbers':
      S.zones.forEach(z => z.units.forEach(u => { if (u.owner === p.idx) u.doubled = true; }));
      p.atkBuff = 0; // flag on units
      logMsg(`⚡ Overwhelming Numbers — ALL friendly units DOUBLE ATK this turn!`);
      break;
  }
}

function healAll(n) {
  S.zones.forEach(z => {
    z.units.concat(z.forts, z.outposts).forEach(x => { x.dmg = Math.max(0, x.dmg - n); });
  });
}

function applyDirect(t, dmg) {
  t.dmg += dmg;
  if (isFort(t) ? fortHp(t) <= 0 : unitHp(t) <= 0) destroy(t);
}

/* ------------------------------------------------- PROMPT HELPERS (overridden by UI) */

let promptZone = () => null;
let promptTarget = () => null;
let promptEnemyUnit = () => null;

/* ------------------------------------------------------------ TURN FLOW */

function startTurn() {
  const p = activeP();
  const key = p.res;
  // per-turn reset
  p.deployedThisTurn = 0;
  p.atkBuffTurns = 0;
  S.zones.forEach(z => {
    z.units.forEach(u => { if (u.owner === p.idx) { u.tempAtk = 0; u.doubled = false; u.attacked = false; } });
    // repair fortifications + restore shields
    z.forts.concat(z.outposts).forEach(f => {
      if (f.owner !== p.idx) return;
      resetShield(f);
      if (cardDef(f).id === 'ramparts') f.dmg = Math.max(0, f.dmg - 2);
      if (cardDef(f).id === 'watchtowers') f.dmg = Math.max(0, f.dmg - 1);
    });
    z.units.concat(z.forts, z.outposts).forEach(x => { if (x.owner === p.idx && (x.negateTurn)) x.negateTurn = false; });
  });

  // resource income ramps: +2 base, +1 more from round 6 onward
  const income = RESOURCE_PER_ROUND + (S.round >= 6 ? 1 : 0);
  gainRes(p, income);
  const drawAmt = 1 + p.bonusDraw;
  draw(p, drawAmt);

  // turn-start hero triggers
  p.boardHeroes.forEach(h => triggerOnDeploy(h, findHeroZone(h)));

  // unlock cease-fire from last turn
  if (p.idx === 1) { S.zones.forEach(z => { if (z.locked) z.locked = false; }); }

  logMsg(`— ${who(p)}'s turn (Round ${S.round}) —`);
  _syncS();
  checkWin();
}

function findHeroZone(h) {
  const z = S.zones.findIndex(z => z.units.some(u => u.uid === h.uid));
  return z < 0 ? 0 : z;
}

function afterPlay() { _syncS(); checkWin(); if (typeof render === 'function') render(); }

function endTurn() {
  if (S.over) return;
  // clear any lingering cease-fire seal at the start of each new turn
  S.zones.forEach(z => { if (z.locked) z.locked = false; });

  if (S.active === 0) {
    S.active = 1;
    startTurn();
    runAI();
  } else {
    S.round++;
    if (S.round > START_ROUNDS) { endByTimer(); return; }
    S.active = 0;
    startTurn();
  }
  _syncS();
  checkWin();
}

/* ------------------------------------------------------------ WIN CHECK */

function countZones(p) {
  return S.zones.filter(z => z.control === p.faction).length;
}

function checkWin() {
  if (S.over) return;
  const p0 = S.players[0], p1 = S.players[1];

  const n0 = p0.faction === FACTION.NEPHITE ? p0 : p1;
  const lam = p0.faction === FACTION.LAMANITE ? p0 : p1;

  // --- Lamanite victory: hold all three zones
  if (countZones(lam) === 3) { endGame(lam); return; }

  // --- Lamanite victory: enemy Faith broken AND their High Priests struck down
  //     (only counts once the enemy has actually fielded a prophet)
  const priestsFielded = n0._everHadHero;
  if (n0.res === 'faith' && n0.faith <= 0 && priestsFielded && n0.boardHeroes.length === 0) {
    endGame(lam); return;
  }

  // --- Nephite victory: convert three enemy leaders
  if (n0.converted >= 3) { endGame(n0); return; }

  // --- Deck-out / total defeat
  for (const p of S.players) {
    const hasRes = p[p.res] > 0;
    if (!p.deck.length && !p.hand.length && !p.boardHeroes.length && !hasRes) {
      endGame(S.players[1 - p.idx]); return;
    }
  }
}

function endByTimer() {
  const n0 = S.players.find(p => p.faction === FACTION.NEPHITE);
  const lam = S.players.find(p => p.faction === FACTION.LAMANITE);
  const fortCount = n0.boardHeroes.length > 0 || S.zones.some(z => z.forts.length + z.outposts.length > 0);
  if (fortCount && n0.faith > 0) {
    endGame(n0);
    logMsg(`⏳ Ten rounds elapsed — the ${who(n0)}s hold the land.`);
  } else {
    endGame(lam);
    logMsg(`⏳ Ten rounds elapsed — the Nephites could not hold.`);
  }
}

function endGame(winner) {
  S.over = true;
  S.winner = winner;
  _syncS();
  logMsg(winner ? `🏆 The ${who(winner)}s prevail!` : `🤝 The battle ends in a draw.`);
  if (typeof render === 'function') render();
}

/* --------------------------------------------------------------- AI */

/* --------------------------------------------------------------- AI LOGIC */

const AI_SPEED = 300;   // ms between AI actions (keeps play watchable)

function aiPlayableCards(p) {
  return p.hand.filter(c => {
    const d = cardDef(c);
    if (p[p.res] < d.cost) return false;
    if (d.type === 'hero' && p.boardHeroes.length >= 3) return false;
    return true;
  });
}

// score a candidate zone to deploy into
function aiBestZone(p, d) {
  const owned = S.zones.map((z, i) => ({ z, i })).filter(x => x.z.control === p.faction);
  const empty = S.zones.map((z, i) => ({ z, i })).filter(x => x.z.control === null);
  const foe = S.zones.map((z, i) => ({ z, i })).filter(x => x.z.control && x.z.control !== p.faction);
  const asFort = d.type === 'fortification' || d.type === 'outpost';
  const fits = x => asFort ? (x.z.forts.length + x.z.outposts.length < MAX_FORTS_PER_ZONE)
                          : (x.z.units.length < MAX_UNITS_PER_ZONE);

  // prefer consolidating into a zone we already hold
  if (owned.filter(fits).length) return owned.filter(fits)[0].i;
  if (empty.filter(fits).length) return empty.filter(fits)[0].i;
  if (foe.filter(fits).length) return foe.filter(fits)[0].i;
  return owned.length ? owned[0].i : 0;
}

function aiCardScore(d, p) {
  let s = 0;
  if (d.type === 'hero') s += 6;
  if (d.type === 'fortification' || d.type === 'outpost') s += 4;
  if (d.type === 'unit') s += 5;
  if (d.type === 'tactic') s += 3;
  // cheap cards first when resource-tight
  s -= d.cost * 0.15;
  // hold someMight back
  if (p[p.res] - d.cost < 1) s -= 3;
  return s;
}

// choose a tactic target intelligently
function aiTacticTarget(p, d) {
  const foe = S.players[1 - p.idx];
  const all = [];
  S.zones.forEach(z => z.units.concat(z.forts, z.outposts).forEach(x => { if (x.owner === foe.idx) all.push(x); }));

  if (d.id === 'wildAmbush') {
    // hit the biggest threat (highest atk, or a hero, or the biggest fort)
    const scored = all.map(x => {
      const cd = cardDef(x);
      let v = cd.type === 'hero' ? 30 : isFort(x) ? fortHp(x) * 1.5 : unitAtk(x) * 2 + unitHp(x);
      return { x, v };
    }).sort((a, b) => b.v - a.v);
    return scored.length ? scored[0].x : null;
  }
  if (d.id === 'feignedRetreat') {
    const units = all.filter(x => !isFort(x));
    return units.length ? units[randInt(units.length)] : null;
  }
  return null;
}

function aiZoneTarget(p, d) {
  if (d.id === 'covenantPeace') {
    // seal the zone that matters most: prefer a zone we hold with a big enemy push
    const cand = S.zones.map((z, i) => ({ z, i }));
    const held = cand.filter(x => x.z.control === p.faction);
    return (held.length ? held : cand)[0].i;
  }
  return 0;
}

function runAI() {
  const p = S.players[1];

  const step = () => {
    if (S.over) return;
    const playable = aiPlayableCards(p);
    if (playable.length) {
      playable.sort((a, b) => aiCardScore(cardDef(b), p) - aiCardScore(cardDef(a), p));
      const pick = playable[0];
      const d = cardDef(pick);
      let zi = 0;
      let ok = true;

      if (d.type === 'tactic') {
        if (d.id === 'wildAmbush' || d.id === 'feignedRetreat') {
          const t = aiTacticTarget(p, d);
          if (!t) { // no valid target — play something else instead
            const alt = p.hand.find(c => { const cd = cardDef(c); return cd.type !== 'tactic' && p[p.res] >= cd.cost; });
            if (!alt) { setTimeout(aiAttack, AI_SPEED); return; }
            playCard(alt.uid, aiBestZone(p, cardDef(alt)));
            setTimeout(step, AI_SPEED); return;
          }
          pick._target = t;
        } else if (d.id === 'covenantPeace') {
          pick._targetZone = aiZoneTarget(p, d);
        } else if (d.id === 'nightRaid') {
          // only worth it if enemy has Faith to burn
          const foe = S.players[1 - p.idx];
          if (foe.faith <= 1) {
            const alt = p.hand.find(c => cardDef(c).type !== 'tactic' && p[p.res] >= cardDef(c).cost);
            if (!alt) { setTimeout(aiAttack, AI_SPEED); return; }
            playCard(alt.uid, aiBestZone(p, cardDef(alt)));
            setTimeout(step, AI_SPEED); return;
          }
        }
      } else {
        zi = aiBestZone(p, d);
      }

      // snapshot hand size so we can detect a rejected play
      const before = p.hand.length;
      playCard(pick.uid, zi);
      if (p.hand.length === before) {
        // play was rejected (zone full) — try once more with a different zone
        const alt = S.zones.map((z, i) => i).find(i => {
          const dd = d;
          const asFort = dd.type === 'fortification' || dd.type === 'outpost';
          const z2 = S.zones[i];
          return asFort ? z2.forts.length + z2.outposts.length < MAX_FORTS_PER_ZONE : z2.units.length < MAX_UNITS_PER_ZONE;
        });
        if (alt !== undefined) playCard(pick.uid, alt);
      }
      setTimeout(step, AI_SPEED);
      return;
    }
    aiAttack();
  };

  const aiAttack = () => {
    if (S.over) { endTurn(); return; }
    const mine = [];
    S.zones.forEach((z, zi) => z.units.forEach(u => { if (u.owner === p.idx) mine.push({ u, zi }); }));

    // score each (unit, targetZone) pair
    const moves = [];
    mine.forEach(({ u, zi }) => {
      if (u.attacked) return;
      S.zones.forEach((tz, ti) => {
        if (ti === zi) return;
        if (tz.locked) return;
        if (tz.control === p.faction) return;
        const d = cardDef(u);
        const hasFort = tz.forts.length + tz.outposts.length > 0;
        const hasFoeUnit = tz.units.some(x => x.owner !== p.idx);
        let v = 0;
        if (!hasFort && !hasFoeUnit) v += 60;                       // capture empty zone
        if (hasFoeUnit) v += 30 + tz.units.filter(x => x.owner !== p.idx).reduce((s, x) => s + unitHp(x), 0);
        if (hasFort) v += 12;
        if (tz.control === null) v += 10;
        // avoid feeding a fort if we can't break it
        if (hasFort) {
          const fort = tz.forts.concat(tz.outposts)[0];
          const eff = Math.max(0, unitAtk(u) - (d.id === 'heavyVanguard' ? Math.max(0, fortShield(fort) - 3) : fortShield(fort)));
          if (eff === 0 && fortHp(fort) > unitAtk(u)) v -= 25;
        }
        if (unitHp(u) < unitAtk(u)) v -= 18;                         // don't trade badly
        moves.push({ u, zi, ti, v });
      });
    });

    moves.sort((a, b) => b.v - a.v);
    const best = moves.find(m => m.v > 0);
    if (best) {
      // don't endlessly re-attack a zone we already own, or a walled zone we can't crack
      const alreadyHeld = S.zones[best.ti].control === p.faction;
      const walledOff = S.zones[best.ti].forts.length + S.zones[best.ti].outposts.length > 0
        && S.zones[best.ti].units.every(x => x.owner === p.idx);
      if (alreadyHeld || walledOff) { setTimeout(endTurn, AI_SPEED); return; }
      attack(best.u, best.zi, best.ti);
      if (!S.over) setTimeout(aiAttack, AI_SPEED);
      else endTurn();
    } else {
      setTimeout(endTurn, AI_SPEED);
    }
  };

  setTimeout(step, AI_SPEED);
}
