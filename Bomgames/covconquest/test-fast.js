const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const fac = process.argv[2] || 'nephite';
  const page = await browser.newPage({ viewport: { width: 1400, height: 1050 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message + '\n' + (e.stack || '').split('\n')[1]));
  page.on('console', m => { if (m.type() === 'error') errors.push('C:' + m.text()); });

  // speed up the AI for testing
  await page.addInitScript(() => { window.AI_SPEED_TEST = true; });

  await page.goto('http://localhost:8000/index.html', { waitUntil: 'networkidle' });
  await page.click(`.faction-choice.${fac}`);
  await page.click('#startBtn');
  await page.waitForTimeout(500);

  console.log(`=== FULL GAME AS ${fac.toUpperCase()} ===`);
  let guard = 0, lastRound = 0;
  while (guard++ < 400) {
    const st = await page.evaluate(() => ({ over: S.over, active: S.active, round: S.round }));
    if (st.over) break;
    if (st.round !== lastRound) { console.log(`  -- Round ${st.round} --`); lastRound = st.round; }

    if (st.active === 0) {
      await page.evaluate(() => {
        const me = S.players[0];
        // play cards
        for (const c of [...me.hand]) {
          const chk = canPlay(c); if (!chk.ok) continue;
          const d = cardDef(c);
          if (d.type === 'tactic' && ['covenantPeace','wildAmbush','feignedRetreat'].includes(d.id)) continue;
          if (d.type === 'hero') { playCard(c.uid, 0); continue; }
          const z = S.zones.findIndex(zz => zz.units.length < 4);
          playCard(c.uid, z >= 0 ? z : 0);
        }
        // attack
        for (let zi = 0; zi < S.zones.length; zi++) {
          for (const u of [...S.zones[zi].units]) {
            if (u.owner !== 0) continue;
            const tgt = S.zones.findIndex((z, i) => i !== zi && !z.locked && z.control !== S.players[0].faction);
            if (tgt >= 0) attack(u, zi, tgt);
          }
        }
        endTurn();
      });
    }
    await page.waitForTimeout(120);
  }

  const res = await page.evaluate(() => ({
    title: document.getElementById('resultTitle').textContent,
    sub: document.getElementById('resultSub').textContent,
    over: S.over, round: S.round,
    winner: S.winner ? S.winner.faction : null,
    zones: S.zones.map(z => `${z.name}:${z.control || 'neutral'}`),
  }));
  console.log('  RESULT:', res.title, '|', res.sub);
  console.log('  winner:', res.winner, '| final round:', res.round);
  console.log('  zones:', res.zones.join(', '));
  console.log('  errors:', errors.length ? errors.slice(0, 6) : 'NONE');
  await page.screenshot({ path: `shot-${fac}.png` });
  await browser.close();
})();