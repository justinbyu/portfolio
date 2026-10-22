/* =========================================================================
   COVENANT & CONQUEST — Card Database
   All card keys are unique. Costs are in the faction's PRIMARY resource.
   ========================================================================= */

const FACTION = {
  NEPHITE: 'nephite',
  LAMANITE: 'lamanite',
  NEUTRAL: 'neutral',
};

// resource type each faction spends
const RES = {
  [FACTION.NEPHITE]: 'faith',
  [FACTION.LAMANITE]: 'might',
  [FACTION.NEUTRAL]: 'might',
};

const ART = {
  moroni: 'art/captain_moroni.jpg',
  helaman: 'art/helaman.jpg',
  alma: 'art/alma_younger.jpg',
  samuel: 'art/samuel_lamanite.jpg',
  zarahemnah: 'art/king_zarahemnah.jpg',
  amalickiah: 'art/amalickiah.jpg',
  coriantumr: 'art/coriantumr.jpg',
  lamoni: 'art/king_lamoni.jpg',
};

/* ---------------------------------------------------------------- HEROES */
const CARDS = {

  /* ============================ NEPHITE ============================ */

  moroni: {
    id: 'moroni', name: 'Captain Moroni', faction: FACTION.NEPHITE,
    type: 'hero', subtype: 'COMMANDER', cost: 7, atk: 5, hp: 7,
    legendary: true, art: ART.moroni,
    ability: { name: 'Title of Liberty', text: 'On deploy, give all your units +2 ATK this turn.', trigger: 'deploy' },
    quote: 'Let us arise and go up against them... and let us preserve unto God our lives and our liberty.',
    flavor: 'Morius, son of Manassah, the general of the armies of the Nephites.',
  },

  helaman: {
    id: 'helaman', name: 'Helaman', faction: FACTION.NEPHITE,
    type: 'hero', subtype: 'COMMANDER', cost: 6, atk: 4, hp: 6,
    legendary: true, art: ART.helaman,
    ability: { name: 'Faith Tested', text: 'At turn start, gain +2 Faith and your Fortifications heal 2.', trigger: 'turnStart' },
    quote: 'It is not the strength of a man, but the faith of a man that preserveth him.',
    flavor: 'Son of Alma; he preserved the Nephites in the most dangerous years of war.',
  },

  alma: {
    id: 'alma', name: 'Alma the Younger', faction: FACTION.NEPHITE,
    type: 'hero', subtype: 'PROPHET', cost: 4, atk: 3, hp: 5,
    legendary: true, art: ART.alma,
    ability: { name: 'Prayer of Faith', text: 'Turn start: heal 2 to any damaged friendly unit or fortification.', trigger: 'turnStart' },
    quote: 'O Lord, give us strength in this our day, and also let us know what to do.',
    flavor: 'He led the people of Zarahemla out of captivity by following a fleeing Lamanite king.',
  },

  samuel: {
    id: 'samuel', name: 'Samuel the Lamanite', faction: FACTION.NEPHITE,
    type: 'hero', subtype: 'PROPHET / NEUTRAL', cost: 3, atk: 2, hp: 4,
    legendary: true, art: ART.samuel, neutral: true,
    ability: { name: 'Voice of Warning', text: 'On deploy, deal 1 to ALL enemy units. Draw a card.', trigger: 'deploy' },
    quote: 'How hath the Lord reigned in the earth, how hath he delighted in the children of men!',
    flavor: 'A Lamanite by birth, converted by God, and sent to preach from the temple at Zarahemla.',
  },

  /* ============================ LAMANITE ============================ */

  zarahemnah: {
    id: 'zarahemnah', name: 'King Zarahemnah', faction: FACTION.LAMANITE,
    type: 'hero', subtype: 'WARLORD', cost: 7, atk: 6, hp: 7,
    legendary: true, art: ART.zarahemnah,
    ability: { name: 'Ruthless Ambition', text: 'On deploy, deal 2 damage to the weakest enemy Fortification.', trigger: 'deploy' },
    quote: 'We will drive the Nephites from the land of our inheritance.',
    flavor: 'The last Lamanite king to lead a siege upon Zarahemla.',
  },

  amalickiah: {
    id: 'amalickiah', name: 'Amalickiah', faction: FACTION.LAMANITE,
    type: 'hero', subtype: 'WARLORD', cost: 5, atk: 4, hp: 6,
    legendary: true, art: ART.amalickiah,
    ability: { name: 'Dissenter Rally', text: 'On deploy, draw 2 cards and gain +2 Might.', trigger: 'deploy' },
    quote: 'I will reign over this people, and I will lead them in their own might.',
    flavor: 'He fled from Zarahemla into the wilderness and built a following there.',
  },

  coriantumr: {
    id: 'coriantumr', name: 'Coriantumr', faction: FACTION.LAMANITE,
    type: 'hero', subtype: 'WARLORD', cost: 6, atk: 6, hp: 5,
    legendary: true, art: ART.coriantumr,
    ability: { name: 'Unbreakable Line', text: 'This unit cannot be targeted by abilities. Survives lethal damage once.', trigger: 'passive' },
    quote: 'They smote upon Coriantumr, and Coriantumr smote upon them.',
    flavor: 'A former chief who returned in the last days to defend his people.',
  },

  lamoni: {
    id: 'lamoni', name: 'King Lamoni', faction: FACTION.LAMANITE,
    type: 'hero', subtype: 'CHIETAIN', cost: 4, atk: 4, hp: 4,
    legendary: true, art: ART.lamoni,
    ability: { name: 'Unconverted Chieftain', text: 'On deploy, gain +1 Might and steal 1 Faith from the enemy.', trigger: 'deploy' },
    quote: 'I will run before thee, and overthrow and subdue all that withstand thee.',
    flavor: 'He later laid down his weapons and became a Christian king.',
  },

  /* ========================= NEPHITE UNITS ========================= */

  striplingWarriors: {
    id: 'striplingWarriors', name: 'Stripling Warriors', faction: FACTION.NEPHITE,
    type: 'unit', subtype: 'TROOP', cost: 2, atk: 2, hp: 4,
    rarity: 'common',
    ability: { name: 'Youth of Helaman', text: 'On deploy, give a friendly unit +1 ATK permanently.', trigger: 'deploy' },
    quote: 'They were only young men, but as mighty as the rest of the army.',
    flavor: 'The "striplings" who with sling and stone defeated a trained army.',
  },

  cityGuards: {
    id: 'cityGuards', name: 'City Guards of Zarahemla', faction: FACTION.NEPHITE,
    type: 'unit', subtype: 'GUARD', cost: 2, atk: 1, hp: 5,
    rarity: 'common',
    ability: { name: 'Stand Fast', text: 'Deploys into a Fortification slot instead of a unit slot.', trigger: 'deploy', deploysAs: 'fortification' },
    quote: 'They were upon the walls of Zarahemla, ready for battle.',
    flavor: 'The garrison that kept the city while the youth marched to battle.',
  },

  archingCorps: {
    id: 'archingCorps', name: 'Nephite Arching Corps', faction: FACTION.NEPHITE,
    type: 'unit', subtype: 'RANGED', cost: 3, atk: 3, hp: 2,
    rarity: 'rare',
    ability: { name: 'Aloft the Aether', text: 'Ranged: this unit attacks without suffering retaliation damage.', trigger: 'passive' },
    quote: 'They shot their arrows in the midst of the host.',
    flavor: 'Nephite archers took flight and fired from the air.',
  },

  lehiVanguard: {
    id: 'lehiVanguard', name: "Captain Lehi's Vanguard", faction: FACTION.NEPHITE,
    type: 'unit', subtype: 'VANGUARD', cost: 4, atk: 4, hp: 6,
    rarity: 'rare',
    ability: { name: 'Steadfast Vanguard', text: 'The first unit you deploy each turn gains +2 HP.', trigger: 'passive' },
    quote: 'Captain Lehi had brought up a company of his own soldiers.',
    flavor: 'Named for Lehi, who brought the first armies into the land.',
  },

  /* ======================= NEPHITE FORTIFICATIONS ==================== */

  ramparts: {
    id: 'ramparts', name: 'Timber & Earth Ramparts', faction: FACTION.NEPHITE,
    type: 'fortification', subtype: 'FORTIFICATION', cost: 3, atk: 0, hp: 5, shield: 5,
    rarity: 'common',
    ability: { name: 'Barricade', text: 'Blocks 5 incoming attack. Repairs 2 each turn.', trigger: 'passive' },
    quote: 'They began to build forts and ramparts.',
    flavor: 'Dirt walls strengthened with timber, ringed the cities.',
  },

  watchtowers: {
    id: 'watchtowers', name: 'Watchtowers of Bountiful', faction: FACTION.NEPHITE,
    type: 'fortification', subtype: 'FORTIFICATION', cost: 3, atk: 0, hp: 4, shield: 4,
    rarity: 'common',
    ability: { name: 'Vigil', text: 'Blocks 4 incoming attack. Reveals all enemy Ambushes.', trigger: 'passive' },
    quote: 'They built watchtowers round about.',
    flavor: 'Bountiful\'s towers caught every approach before the enemy arrived.',
  },

  cityGate: {
    id: 'cityGate', name: 'City Gate of Jershon', faction: FACTION.NEPHITE,
    type: 'fortification', subtype: 'FORTIFICATION', cost: 5, atk: 0, hp: 8, shield: 8,
    rarity: 'rare',
    ability: { name: 'Gate of Refuge', text: 'Blocks 8 incoming attack. Heals adjacent fortification 3.', trigger: 'passive' },
    quote: 'They came to the strongholds of the Nephites.',
    flavor: 'Jershon\'s gates mended the walls around them.',
  },

  /* ========================= NEPHITE TACTICS ======================== */

  titleLiberty: {
    id: 'titleLiberty', name: 'Title of Liberty', faction: FACTION.NEPHITE,
    type: 'tactic', subtype: 'TACTIC', cost: 3,
    rarity: 'common',
    ability: { name: 'Morale', text: 'Give ALL your units +2 ATK this turn.', trigger: 'immediate' },
    quote: 'In the strength of the Lord I have wrought a miracle.',
    flavor: 'Moroni raised the standard of liberty and cried to the people.',
  },

  deliverance: {
    id: 'deliverance', name: 'Miraculous Deliverance', faction: FACTION.NEPHITE,
    type: 'tactic', subtype: 'TACTIC', cost: 2,
    rarity: 'common',
    ability: { name: 'Shielding', text: 'Negate the next incoming attack against a friendly unit or fortification.', trigger: 'immediate' },
    quote: 'The Lord did come upon them, and they were delivered.',
    flavor: 'An angel of the Lord encircled the camp.',
  },

  voiceWarning: {
    id: 'voiceWarning', name: 'Voice of Warning', faction: FACTION.NEPHITE,
    type: 'tactic', subtype: 'TACTIC', cost: 2,
    rarity: 'common',
    ability: { name: 'Proclamation', text: 'Draw 2 cards and gain +3 Faith.', trigger: 'immediate' },
    quote: 'The voice of warning shall be lifted unto them.',
    flavor: 'Samuel cried from the temple and the cities shook with the sound.',
  },

  covenantPeace: {
    id: 'covenantPeace', name: 'Covenant of Peace', faction: FACTION.NEPHITE,
    type: 'tactic', subtype: 'TACTIC', cost: 4,
    rarity: 'rare',
    ability: { name: 'Cease-fire', text: 'No attacks may be made in ONE zone next turn. Both sides heal 3.', trigger: 'immediate' },
    quote: 'Behold, I am the Lord, who taketh upon me the works of this vineyard.',
    flavor: 'A bridge built between enemies.',
  },

  /* ========================= LAMANITE UNITS ======================== */

  wildernessRaiders: {
    id: 'wildernessRaiders', name: 'Wilderness Raiders', faction: FACTION.LAMANITE,
    type: 'unit', subtype: 'RAIDER', cost: 2, atk: 3, hp: 2,
    rarity: 'common',
    ability: { name: 'Hit and Run', text: 'Can attack and then retreat. Draw a card when it deals damage.', trigger: 'passive' },
    quote: 'They rose up and came upon them from the wilderness.',
    flavor: 'Born in the desert canyons, they know no roads.',
  },

  heavyVanguard: {
    id: 'heavyVanguard', name: 'Lamanite Heavy Vanguard', faction: FACTION.LAMANITE,
    type: 'unit', subtype: 'VANGUARD', cost: 4, atk: 5, hp: 5,
    rarity: 'rare',
    ability: { name: 'Breaker', text: 'Ignores the first 3 points of blocking Shield on walls.', trigger: 'passive' },
    quote: 'They came upon them with their heavy arms.',
    flavor: 'A battering line of shield and iron.',
  },

  flankingCavalry: {
    id: 'flankingCavalry', name: 'Flanking Cavalry', faction: FACTION.LAMANITE,
    type: 'unit', subtype: 'MOUNTED', cost: 3, atk: 3, hp: 3,
    rarity: 'common',
    ability: { name: 'Flank', text: 'Ignores the first fortification in the target zone.', trigger: 'passive' },
    quote: 'They came upon them in the rear of the army.',
    flavor: 'Riders striking where the wall is thinnest.',
  },

  zoramites: {
    id: 'zoramites', name: 'Zoramite Dissenters', faction: FACTION.LAMANITE,
    type: 'unit', subtype: 'RAIDER', cost: 3, atk: 4, hp: 3,
    rarity: 'rare',
    ability: { name: 'Ambush', text: 'Face-down. Costs 1 less Might. Reveals with +3 ATK.', trigger: 'deploy' },
    quote: 'They were a stiff-necked people, quick to perceive evil.',
    flavor: 'The Zoramites took their "dwellings in the wilderness".',
  },

  /* ========================= LAMANITE OUTPOSTS ====================== */

  hiddenCamp: {
    id: 'hiddenCamp', name: 'Hidden Wilderness Camp', faction: FACTION.LAMANITE,
    type: 'outpost', subtype: 'OUTPOST', cost: 2, atk: 0, hp: 3, shield: 2,
    rarity: 'common',
    ability: { name: 'Supply Line', text: 'Blocks 2 incoming attack. +1 card draw each turn.', trigger: 'passive' },
    quote: 'They pitched their tents without a camp.',
    flavor: 'A forward supply line unseen by scouts.',
  },

  siegeWorkshop: {
    id: 'siegeWorkshop', name: 'Siege Engine Workshop', faction: FACTION.LAMANITE,
    type: 'outpost', subtype: 'OUTPOST', cost: 4, atk: 0, hp: 5, shield: 4,
    rarity: 'rare',
    ability: { name: 'Siege Craft', text: 'Blocks 4 incoming attack. Your units deal +3 to Fortifications.', trigger: 'passive' },
    quote: 'They brought in an engine of war.',
    flavor: 'Iron rams and raised towers, built in the desert.',
  },

  /* ======================== LAMANITE TACTICS ======================== */

  wildAmbush: {
    id: 'wildAmbush', name: 'Surprise Wilderness Ambush', faction: FACTION.LAMANITE,
    type: 'tactic', subtype: 'TACTIC', cost: 3,
    rarity: 'common',
    ability: { name: 'Ambush', text: 'Deal 4 instant damage to ANY target (unit or fortification).', trigger: 'immediate' },
    quote: 'They fell suddenly upon them from the wilderness.',
    flavor: 'No warning, no drum.',
  },

  feignedRetreat: {
    id: 'feignedRetreat', name: 'Feigned Retreat', faction: FACTION.LAMANITE,
    type: 'tactic', subtype: 'TACTIC', cost: 2,
    rarity: 'common',
    ability: { name: 'Lure', text: 'Pull an enemy unit into an adjacent zone. It loses 1 HP.', trigger: 'immediate' },
    quote: 'They fled, that they might draw them into the ambush.',
    flavor: 'Retreat is the oldest trick in the canyon.',
  },

  nightRaid: {
    id: 'nightRaid', name: 'Night Raid', faction: FACTION.LAMANITE,
    type: 'tactic', subtype: 'TACTIC', cost: 3,
    rarity: 'rare',
    ability: { name: 'Doubt', text: 'Reduce enemy Faith by 4. Their units lose 1 ATK this turn.', trigger: 'immediate' },
    quote: 'They came upon them in the night, in disguise.',
    flavor: 'The enemy woke to smoke.',
  },

  overwhelmNumbers: {
    id: 'overwhelmNumbers', name: 'Overwhelming Numbers', faction: FACTION.LAMANITE,
    type: 'tactic', subtype: 'TACTIC', cost: 4,
    rarity: 'rare',
    ability: { name: 'Rout', text: 'Double the ATK of ALL your units this turn.', trigger: 'immediate' },
    quote: 'There were so many of them they could not withstand us.',
    flavor: 'A wall of dust and spears.',
  },
};

/* ---------------------------------------------------------- DECK BUILDERS */

const STARTER_NEPHITE = [
  'moroni', 'helaman', 'alma', 'samuel',
  'striplingWarriors', 'striplingWarriors', 'striplingWarriors',
  'cityGuards', 'cityGuards',
  'archingCorps', 'archingCorps',
  'lehiVanguard', 'lehiVanguard',
  'ramparts', 'ramparts',
  'watchtowers', 'watchtowers',
  'cityGate', 'cityGate',
  'titleLiberty', 'titleLiberty', 'titleLiberty',
  'deliverance', 'deliverance', 'deliverance',
  'voiceWarning', 'voiceWarning', 'voiceWarning',
  'covenantPeace', 'covenantPeace',
];

const STARTER_LAMANITE = [
  'zarahemnah', 'amalickiah', 'coriantumr', 'lamoni',
  'wildernessRaiders', 'wildernessRaiders', 'wildernessRaiders', 'wildernessRaiders',
  'heavyVanguard', 'heavyVanguard', 'heavyVanguard',
  'flankingCavalry', 'flankingCavalry', 'flankingCavalry',
  'zoramites', 'zoramites',
  'hiddenCamp', 'hiddenCamp',
  'siegeWorkshop', 'siegeWorkshop',
  'wildAmbush', 'wildAmbush', 'wildAmbush',
  'feignedRetreat', 'feignedRetreat', 'feignedRetreat',
  'nightRaid', 'nightRaid',
  'overwhelmNumbers', 'overwhelmNumbers',
];