const fs = require('fs'), vm = require('vm');

function simulate(myFaction, runs = 200) {
  const results = { nephite: 0, lamanite: 0, draw: 0, rounds: [] };
  for (let r = 0; r < runs; r++) {
    const ctx = { Math, console, setTimeout: (f) => { try { f(); } catch (e) {} } };
    ctx.window = ctx; vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(__dirname + '/js/cards.js', 'utf8'), ctx);
    vm.runInContext(fs.readFileSync(__dirname + '/js/engine.js', 'utf8'), ctx);
    // deterministic-ish AI replacement
    vm.runInContext('runAI=function(){ S.active=0; S.round++; if(S.round>10){endByTimer();return;} startTurn(); _syncS(); };', ctx);

    const enemy = myFaction === 'nephite' ? 'lamanite' : 'nephite';
    ctx.newGame(myFaction, enemy); ctx.startTurn();

    let n = 0, guard = 0;
    while (!ctx.S.over && guard++ < 60) {
      const me = ctx.S.players[0], key = me.res;
      // greedy: play everything affordable, then attack
      for (const c of [...me.hand]) {
        const d = ctx.cardDef(c);
        if (me[key] < d.cost) continue;
        if (d.type === 'tactic' && ['covenantPeace','wildAmbush','feignedRetreat'].includes(d.id)) continue;
        if (d.type === 'hero') { ctx.playCard(c.uid, 0); continue; }
        const asFort = d.type === 'fortification' || d.type === 'outpost';
        const z = ctx.S.zones.findIndex(zz => asFort
          ? zz.forts.length + zz.outposts.length < 3
          : zz.units.length < 4);
        if (z >= 0) ctx.playCard(c.uid, z);
      }
      for (let zi = 0; zi < 3; zi++) {
        const u = ctx.S.zones[zi].units.find(x => x.owner === 0);
        if (!u) continue;
        const t = ctx.S.zones.findIndex((z, i) => i !== zi && !z.locked && z.control !== myFaction);
        if (t >= 0) ctx.attack(u, zi, t);
      }
      ctx.endTurn(); n++;
    }
    results.rounds.push(ctx.S.round);
    const w = ctx.S.winner ? ctx.S.winner.faction : null;
    results[w || 'draw']++;
  }
  return results;
}

for (const f of ['nephite', 'lamanite']) {
  const r = simulate(f, 150);
  const avg = (r.rounds.reduce((a, b) => a + b, 0) / r.rounds.length).toFixed(1);
  console.log(`Playing as ${f.toUpperCase().padEnd(9)} → Nephite ${r.nephite} | Lamanite ${r.lamanite} | Draw ${r.draw} | avg rounds ${avg}`);
}