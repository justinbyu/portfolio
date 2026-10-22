const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1050 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8000/index.html', { waitUntil: 'networkidle' });
  await page.click('.faction-choice.nephite');
  await page.click('#startBtn');
  await page.waitForTimeout(500);

  for (let i = 0; i < 12; i++) {
    if (await page.isVisible('#result')) break;
    // wait until it's our turn
    await page.waitForFunction(() => window.S && S.active === 0 && !S.over, { timeout: 30000 }).catch(() => {});
    if (await page.isVisible('#result')) break;

    // play everything affordable
    await page.evaluate(() => {
      const me = S.players[0], key = me.res;
      for (const c of [...me.hand]) {
        const d = cardDef(c);
        if (me[key] < d.cost) continue;
        if (d.type === 'tactic' && ['covenantPeace','wildAmbush','feignedRetreat'].includes(d.id)) continue;
        if (d.type === 'hero') { playCard(c.uid, 0); continue; }
        const asFort = d.type === 'fortification' || d.type === 'outpost';
        const z = S.zones.findIndex(zz => asFort ? zz.forts.length + zz.outposts.length < 3 : zz.units.length < 4);
        if (z >= 0) playCard(c.uid, z);
      }
      // attack with everything
      for (let zi = 0; zi < 3; zi++) {
        for (const u of [...S.zones[zi].units]) {
          if (u.owner !== 0) continue;
          const t = S.zones.findIndex((z, i) => i !== zi && !z.locked && z.control !== S.players[0].faction);
          if (t >= 0) attack(u, zi, t);
        }
      }
    });
    await page.click('#endTurnBtn');
    await page.waitForTimeout(400);
    const st = await page.evaluate(() => ({ r: S.round, a: S.active, over: S.over }));
    console.log(`turn ${i + 1}: round=${st.r} active=${st.a} over=${st.over} zones=${await page.evaluate(() => S.zones.map(z => z.name + ':' + (z.control || '-')).join(' '))}`);
  }

  if (await page.isVisible('#result')) {
    console.log('RESULT:', await page.textContent('#resultTitle'));
  } else {
    console.log('game still running at', await page.textContent('#roundNum'));
  }
  console.log('errors:', errors.length ? errors : 'NONE');
  await page.screenshot({ path: 'shot-final.png' });
  await browser.close();
})();