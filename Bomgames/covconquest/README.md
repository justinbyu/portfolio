# ⚔️ Covenant & Conquest
### A Book of Mormon Digital Card Game

A playable web prototype of a two-faction tactical card game set in the Book of Mormon's
"land of promise." Two commanders, three land zones, ten rounds.

**Play it:** the live preview at the top of this conversation, or serve the folder:
```bash
cd covenant && python3 -m http.server 8000
# then open http://localhost:8000
```

---

## 🎯 The Design

Two armies contest three cities in the Book of Mormon:

| | Nephite Alliance 🕊️ | Lamanite Forces ⚔️ |
|---|---|---|
| **Resource** | Faith 🕊️ | Might ⚔️ |
| **Identity** | Defensive turtling, city walls, prophet buffs, high-morale counter-attacks | Aggressive raids, face-down Ambush, mobility, wall-breaching |
| **Win by** | Surviving 10 rounds with a fortified city — **or** destroying 3 enemy leaders | Holding all 3 zones — **or** draining enemy Faith to 0 while their High Priests are gone |

The asymmetry is the point. The Nephites want to *survive*; the Lamanites want to
*converge*. That single difference reshapes every decision on the board.

---

## 📜 Core Rules

**The Land.** Three zones — **Zarahemla**, **Jershon**, **Bountiful**.
You control a zone by holding a **Fortification** there, or by fielding **two or more
units** in it. Destroy everything in a zone and it reverts to neutral. Zones are worth
holding, not worth hiding in.

**Resources.** You gain **+2** of your resource each turn, **+3** from round 6 onward,
capped at **12**. You draw **1 card** per turn into a hand of up to **7**.

**Playing a card.** Click a card in your hand, then click the zone to deploy it. Heroes
go to your **Command row** instead (max 3).

**Combat.** Click one of your units, then click an enemy or neutral zone to attack.
- A Fortification in the target zone **must be broken first** — its shield absorbs damage
  before its health does.
- Shield is a **consumable pool**. It depletes as it absorbs and refills at the start of
  your turn, so chip damage matters.
- If the attacker survives and no defenders remain, the zone **changes hands**.
- Each unit may attack **once per round**.

**Deckbuilding.** 30 cards. Max 3 copies of a standard card, 1 copy of each Legendary
hero. 60% minimum main faction, up to 40% neutral.

---

## 🃏 The Cards (29 implemented)

**Nephite Heroes** — Captain Moroni · Helaman · Alma the Younger · Samuel the Lamanite *(neutral)*
**Lamanite Heroes** — King Zarahemnah · Amalickiah · Coriantumr · King Lamoni

| Nephite | | Lamanite | |
|---|---|---|---|
| Stripling Warriors | 2/4 | Wilderness Raiders | 3/2 |
| City Guards of Zarahemla | 1/5 | Lamanite Heavy Vanguard | 5/5 |
| Nephite Arching Corps | 3/2 | Flanking Cavalry | 3/3 |
| Captain Lehi's Vanguard | 4/6 | Zoramite Dissenters | 4/3 |

**Signature mechanics**
- 🏴 **Title of Liberty** (Moroni) — every friendly unit gets +2 ATK this turn
- 🗡 **Breaker** (Heavy Vanguard) — ignores the first 3 shield on walls
- 🐎 **Flank** (Flanking Cavalry) — bypasses the first fortification in a zone
- 🕊 **Miraculous Deliverance** — negates the next incoming attack entirely
- 🗡 **Zoramite Ambush** — enters face-down, discounts cost, reveals with +3 ATK
- 🕊 **Vigil** (Watchtowers) — reveals enemy Ambushes

All 8 heroes carry **AI-generated original artwork**. The remaining 21 cards use
**procedurally-drawn SVG sigils** — wall, unit, tactic and outpost glyphs coloured by
faction.

---

## 📁 Structure

```
covenant/
├── index.html          # setup screen, game board, modals
├── css/style.css       # all styling (no external assets)
├── js/
│   ├── cards.js        # card database + starter decks
│   ├── engine.js       # rules, combat, abilities, win conditions, AI
│   └── ui.js           # rendering, tooltips, input handling
├── art/                # 8 hero illustrations (JPEG, ~235 KB total)
├── sim.js              # balance simulator (300 automated games)
└── test-play.js        # Playwright end-to-end test
```

**Testing:**
```bash
node sim.js         # runs 300 games, reports win rates
node test-play.js  # plays a full browser game, checks for errors
```

---

## 🗺 Roadmap

**Working now:** 1v1 play vs AI, both factions, 29 cards, full win conditions, hover tooltips.

**Next up, in rough priority order:**
1. **Neutral factions** — the design calls for Secret Combinations (steal, disrupt, assassinate),
   People of Ammon (pacifism, damage redirection, passive Faith), and Jaredite Ancients
   (deck-ordering foresight, cost-heavy behemoths). None are implemented yet.
2. **Mode support** — 2v2 Co-op Alliance and 1–4 Player Social, which need a shared board model
   (four players across three zones is a real design problem, not just a UI one).
3. **Solo PVE campaign** — a ladder of scripted Lamanite warbands from the Book of Mormon narrative:
   Amalickiah's dissenter horde → the siege of Zarahemla → the final Lamanite kings.
4. **Ranked matchmaking** — needs an Elo model and a server.
5. **Production art pass** — all 29 cards at the 300 DPI CMYK poker spec.

---

## 📖 A note on the source material

Quotations on every card are drawn from the Book of Mormon itself. Character portrayals
follow the text's descriptions — Samuel the Lamanite as the prophet who warned from the
tower at Zarahemla, Amalickiah as the vain king who fled into the wilderness, King Lamoni
as the chieftain who ultimately laid down his weapons.

Scripture quotations and the names of individuals and groups belong to the Church of
Jesus Christ of Latter-day Saints and are used here under fair-use for a non-commercial
game project. Original artwork and game design are the author's own.