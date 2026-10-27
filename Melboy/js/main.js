// High-Performance 60fps JS:
// 1. Profile Portrait Lightbox
// 2. Save Contact (Android + iPhone + In-App)
// 3. Our Menu: Red Ramen Shop Noren Curtain -> Tapping Chopsticks -> Black Brush "Our Menu" -> 1 Photo -> 3-Col Spread -> Continuous Up/Down/Up Marquee
// 4. Lazy Pure-Swipe 15-Slide PDF Presentation
document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. PROFILE PHOTO LIGHTBOX MODAL (Lazy High-Res)
  // ==========================================
  const photoTrigger = document.getElementById('profilePhotoTrigger');
  const photoModal = document.getElementById('photoModal');
  const profileModalImg = document.getElementById('profileModalImg');
  const closePhotoBtn = document.getElementById('closePhotoBtn');

  if (photoTrigger && photoModal && closePhotoBtn) {
    photoTrigger.addEventListener('click', () => {
      if (profileModalImg && profileModalImg.dataset.src) {
        profileModalImg.src = profileModalImg.dataset.src;
        delete profileModalImg.dataset.src;
      }
      photoModal.classList.remove('hidden');
    });
    closePhotoBtn.addEventListener('click', () => {
      photoModal.classList.add('hidden');
    });
    photoModal.addEventListener('click', (e) => {
      if (e.target === photoModal) photoModal.classList.add('hidden');
    });
  }

  // ==========================================
  // 2. SAVE CONTACT (ANDROID + IPHONE + IN-APP)
  // ==========================================
  const saveContactBtn = document.getElementById('saveContactBtn');
  const saveContactHelper = document.getElementById('saveContactHelper');
  const saveContactStatus = document.getElementById('saveContactStatus');
  const androidDirectInsertBtn = document.getElementById('androidDirectInsertBtn');
  const androidOpenChromeBtn = document.getElementById('androidOpenChromeBtn');
  const copyPhoneBtn = document.getElementById('copyPhoneBtn');
  const copyEmailBtn = document.getElementById('copyEmailBtn');

  const ua = navigator.userAgent || '';
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(ua);
  const isTopWindow = (() => {
    try { return window.self === window.top; } catch { return false; }
  })();

  function detectInAppBrowser() {
    if (/messenger/i.test(ua)) return 'Messenger';
    if (/instagram/i.test(ua)) return 'Instagram';
    if (/tiktok|musical_ly|bytedance/i.test(ua)) return 'TikTok';
    if (/fban|fbav|fb_iab/i.test(ua)) return 'Facebook';
    if (/viber/i.test(ua)) return 'Viber';
    if (/line\//i.test(ua)) return 'LINE';
    if (/micromessenger/i.test(ua)) return 'WeChat';
    if (/;\s*wv\)/i.test(ua)) return 'this app';
    return null;
  }

  const inAppName = detectInAppBrowser();

  if (androidDirectInsertBtn && isAndroid && !inAppName) {
    const vcfFallback = encodeURIComponent(new URL('Melbert-Pereda.vcf', window.location.href).href);
    androidDirectInsertBtn.href =
      'intent:#Intent;' +
      'action=android.intent.action.INSERT;' +
      'type=vnd.android.cursor.dir/contact;' +
      'S.name=' + encodeURIComponent('Melbert Pereda') + ';' +
      'S.phone=' + encodeURIComponent('+639561391538') + ';' +
      'S.email=' + encodeURIComponent('peredamelbertc@gmail.com') + ';' +
      'S.company=' + encodeURIComponent("Brother's Ramen") + ';' +
      'S.job_title=' + encodeURIComponent('Founder & CEO') + ';' +
      'S.browser_fallback_url=' + vcfFallback + ';' +
      'end';
  }

  if (androidOpenChromeBtn && isAndroid && inAppName) {
    const cleanUrl = window.location.href.replace(/^https?:\/\//i, '');
    const scheme = window.location.protocol.replace(':', '') || 'https';
    androidOpenChromeBtn.href =
      `intent://${cleanUrl}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;
  }

  if (saveContactBtn && isIOS && isTopWindow && !inAppName) {
    saveContactBtn.removeAttribute('download');
  }

  function showSaveHelper(htmlMessage) {
    if (!saveContactHelper || !saveContactStatus) return;
    saveContactStatus.innerHTML = htmlMessage;
    saveContactHelper.classList.remove('hidden');
  }

  if (saveContactBtn) {
    saveContactBtn.addEventListener('click', (e) => {
      if (inAppName && isIOS) {
        e.preventDefault();
        showSaveHelper(
          `<i class="fa-solid fa-circle-info text-red-600 mr-1"></i> <strong>Viewing inside ${inAppName}:</strong> Tap <strong>⋯</strong> at the top corner → <strong>Open in Safari</strong>, then tap <strong>Save to Phone</strong> to add directly to iPhone Contacts.`
        );
        return;
      }

      if (inAppName && isAndroid) {
        if (androidOpenChromeBtn) {
          androidOpenChromeBtn.classList.remove('hidden');
          androidOpenChromeBtn.classList.add('inline-flex');
        }
        showSaveHelper(
          `<i class="fa-solid fa-circle-check text-emerald-600 mr-1"></i> Downloading contact — tap <strong>Open</strong> on the file prompt to import into Contacts. If ${inAppName} blocks it, tap <strong>Open in Chrome</strong> below:`
        );
      } else if (isAndroid) {
        if (androidDirectInsertBtn) {
          androidDirectInsertBtn.classList.remove('hidden');
          androidDirectInsertBtn.classList.add('inline-flex');
        }
        showSaveHelper(
          `<i class="fa-solid fa-circle-check text-emerald-600 mr-1"></i> <strong>Android:</strong> Tap <strong>Open</strong> on the downloaded <code>Melbert-Pereda.vcf</code> notification to save with photo — or tap <strong>Open Contacts App Directly</strong> below:`
        );
      } else if (isIOS) {
        showSaveHelper(
          `<i class="fa-solid fa-circle-check text-emerald-600 mr-1"></i> <strong>iPhone:</strong> Tap <strong>Create New Contact</strong> or <strong>Save</strong> on the iPhone contact sheet.`
        );
      } else {
        showSaveHelper(
          `<i class="fa-solid fa-circle-check text-emerald-600 mr-1"></i> Downloaded <strong>Melbert-Pereda.vcf</strong> (includes phone, email &amp; photo). Open it on your phone or computer to save to Contacts.`
        );
      }
    });
  }

  async function copyWithFallback(text, buttonEl, successLabel, originalHtml) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    if (buttonEl) {
      buttonEl.innerHTML = `<i class="fa-solid fa-check text-emerald-600"></i><span>${successLabel}</span>`;
      setTimeout(() => {
        buttonEl.innerHTML = originalHtml;
      }, 2000);
    }
  }

  if (copyPhoneBtn) {
    const orig = copyPhoneBtn.innerHTML;
    copyPhoneBtn.addEventListener('click', () => {
      copyWithFallback('+639561391538', copyPhoneBtn, 'Copied Number!', orig);
    });
  }

  if (copyEmailBtn) {
    const orig = copyEmailBtn.innerHTML;
    copyEmailBtn.addEventListener('click', () => {
      copyWithFallback('peredamelbertc@gmail.com', copyEmailBtn, 'Copied Email!', orig);
    });
  }

  // ==========================================
  // 3. OUR MENU — NOREN CURTAIN -> TAPPING CHOPSTICKS ->
  //    THEME BLACK "Our Menu" -> 1 PHOTO -> 3-COL SPREAD -> MARQUEE
  // ==========================================
  const menuModal = document.getElementById('menuModal');
  const closeMenuModalBtn = document.getElementById('closeMenuModalBtn');
  const menuModalImg = document.getElementById('menuModalImg');
  const menuModalTitle = document.getElementById('menuModalTitle');
  const menuModalSub = document.getElementById('menuModalSub');
  const switchToFullBoardBtn = document.getElementById('switchToFullBoardBtn');

  function openMenuPreview(imgSrc, title, subtitle, isSingleItem) {
    if (!menuModal || !menuModalImg) return;
    menuModalImg.src = imgSrc;
    if (menuModalTitle) menuModalTitle.textContent = title;
    if (menuModalSub) menuModalSub.textContent = subtitle;
    if (switchToFullBoardBtn) {
      switchToFullBoardBtn.classList.toggle('hidden', !isSingleItem);
    }
    menuModal.classList.remove('hidden');
  }

  if (switchToFullBoardBtn) {
    switchToFullBoardBtn.addEventListener('click', () => {
      openMenuPreview('images/menu/menu-board.jpg', "Brother's Ramen — Full Menu", 'Authentic Japanese Menu', false);
    });
  }

  if (closeMenuModalBtn && menuModal) {
    closeMenuModalBtn.addEventListener('click', () => {
      menuModal.classList.add('hidden');
    });
    menuModal.addEventListener('click', (e) => {
      if (e.target === menuModal) menuModal.classList.add('hidden');
    });
  }

  const menuRunway = document.getElementById('menu');
  const menuStickyCard = document.getElementById('menuStickyCard');
  const norenCurtainLayer = document.getElementById('norenCurtainLayer');
  const norenWoodRod = document.getElementById('norenWoodRod');
  const norenPanels = [
    document.getElementById('norenPanel0'),
    document.getElementById('norenPanel1'),
    document.getElementById('norenPanel2'),
    document.getElementById('norenPanel3')
  ];
  const chopsticksStage = document.getElementById('chopsticksStage');
  const chopstickLeft = document.getElementById('chopstickLeft');
  const chopstickRight = document.getElementById('chopstickRight');
  const chopstickTapSparks = document.getElementById('chopstickTapSparks');
  const menuIntroTitle = document.getElementById('menuIntroTitle');
  const menuColumnsViewport = document.getElementById('menuColumnsViewport');
  const colTracks = [
    document.getElementById('menuCol0'),
    document.getElementById('menuCol1'),
    document.getElementById('menuCol2')
  ];

  if (menuRunway && menuStickyCard && menuIntroTitle && menuColumnsViewport && colTracks[0] && colTracks[1] && colTracks[2]) {
    const columnSets = [
      // Column 1 (Left — moves UP to DOWN)
      [
        { title: 'Classic Overload', sub: 'Traditional Bowl', img: 'images/menu/classic-overload.jpg' },
        { title: 'Tonkatsu', sub: 'Crispy Cutlet Bowl', img: 'images/menu/tonkatsu.jpg' },
        { title: 'Spicy Milky', sub: 'Creamy Spicy Broth', img: 'images/menu/spicy-milky.jpg' },
        { title: 'Handmade Gyoza', sub: 'Japanese Dumplings', img: 'images/menu/gyoza.jpg' }
      ],
      // Column 2 (Middle — moves DOWN to UP; index 1 in Set C is the centered Hero Photo!)
      [
        { title: 'Milky Ramen', sub: 'Rich Creamy Broth', img: 'images/menu/milky-ramen.jpg' },
        { title: 'Overload Spicy', sub: 'Signature Ramen', img: 'images/menu/overload-spicy.jpg' },
        { title: 'Curry Ramen', sub: 'Japanese Curry Bowl', img: 'images/menu/curry-ramen.jpg' },
        { title: 'Club House', sub: 'Signature Sandwich', img: 'images/menu/club-house.jpg' }
      ],
      // Column 3 (Right — moves UP to DOWN)
      [
        { title: 'Spicy Ramen', sub: 'Fiery Broth Bowl', img: 'images/menu/spicy-ramen.jpg' },
        { title: 'Handmade Gyoza', sub: 'Japanese Dumplings', img: 'images/menu/gyoza.jpg' },
        { title: 'Club House', sub: 'Signature Sandwich', img: 'images/menu/club-house.jpg' },
        { title: 'Curry Ramen', sub: 'Japanese Curry Bowl', img: 'images/menu/curry-ramen.jpg' }
      ]
    ];

    const NUM_SETS = 4;
    const HERO_SET_IDX = 2;
    const HERO_ITEM_IN_SET = 1;
    const HERO_FLAT_IDX = HERO_SET_IDX * 4 + HERO_ITEM_IN_SET;

    const allTiles = [];
    const colTiles = [[], [], []];
    let heroTile = null;

    for (let c = 0; c < 3; c++) {
      const track = colTracks[c];
      track.innerHTML = '';
      for (let s = 0; s < NUM_SETS; s++) {
        for (let i = 0; i < 4; i++) {
          const item = columnSets[c][i];
          const flatIdx = s * 4 + i;
          const isHero = (c === 1 && flatIdx === HERO_FLAT_IDX);

          const tileEl = document.createElement('div');
          tileEl.className = 'menu-spread-tile' + (isHero ? ' is-hero-tile' : '');
          tileEl.innerHTML = `
            <div class="menu-tile-photo">
              <img src="${item.img}" alt="${item.title}" decoding="async">
            </div>
            <div class="menu-tile-caption">
              <span class="menu-tile-name">${item.title}</span>
              <span class="menu-tile-dot"></span>
            </div>
          `;

          const imgEl = tileEl.querySelector('img');
          if (imgEl && imgEl.decode) {
            imgEl.decode().catch(() => {});
          }

          tileEl.addEventListener('click', () => {
            if (renderedP >= 0.50) {
              openMenuPreview(item.img, item.title, `${item.sub} — Brother's Ramen`, true);
            }
          });

          track.appendChild(tileEl);
          const state = {
            el: tileEl,
            col: c,
            flatIdx,
            isHero,
            dx: 0,
            dy: 0,
            nearViewport: false
          };
          allTiles.push(state);
          colTiles[c].push(state);
          if (isHero) heroTile = state;
        }
      }
    }

    let cycleH = 560;
    const baseY = [0, 0, 0];
    let targetP = 0;
    let renderedP = 0;
    let marqueePos = 0;
    let marqueeSpeedScale = 0;
    let tilesClearedForMarquee = false;
    let isSectionNearScreen = true;
    let menuRafId = null;
    let lastFrameTime = performance.now();

    function measureMenuGeometry() {
      for (let k = 0; k < allTiles.length; k++) {
        allTiles[k].el.style.transform = '';
      }

      const cardH = menuStickyCard.clientHeight || 440;
      const t0 = colTiles[1][0].el;
      const t4 = colTiles[1][4].el;
      const heroEl = heroTile.el;

      const measuredCycle = t4.offsetTop - t0.offsetTop;
      if (measuredCycle > 40) {
        cycleH = measuredCycle;
      }

      const tileH = heroEl.offsetHeight || 120;
      const heroCenterInTrack = heroEl.offsetTop + tileH * 0.5;

      baseY[1] = (cardH * 0.5) - heroCenterInTrack;
      baseY[0] = baseY[1] + 26;
      baseY[2] = baseY[1] - 24;

      colTracks[0].style.transform = `translate3d(0, ${baseY[0].toFixed(2)}px, 0)`;
      colTracks[1].style.transform = `translate3d(0, ${baseY[1].toFixed(2)}px, 0)`;
      colTracks[2].style.transform = `translate3d(0, ${baseY[2].toFixed(2)}px, 0)`;

      const cardRect = menuStickyCard.getBoundingClientRect();
      const cardCx = cardRect.left + cardRect.width * 0.5;
      const cardCy = cardRect.top + cardRect.height * 0.5;

      for (let k = 0; k < allTiles.length; k++) {
        const st = allTiles[k];
        const r = st.el.getBoundingClientRect();
        st.dx = cardCx - (r.left + r.width * 0.5);
        st.dy = cardCy - (r.top + r.height * 0.5);
        st.nearViewport = Math.abs(st.dy) < cardH * 1.15;
      }

      tilesClearedForMarquee = false;
    }

    function computeScrollTargetP() {
      const rect = menuRunway.getBoundingClientRect();
      const stickyTop = parseFloat(getComputedStyle(menuStickyCard).top) || 120;
      const pinDistance = Math.max(1, menuRunway.offsetHeight - menuStickyCard.offsetHeight);
      const scrolledWhilePinned = stickyTop - rect.top;
      targetP = Math.max(0, Math.min(1, scrolledWhilePinned / pinDistance));
    }

    const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const smoothstep = (v) => v * v * (3 - 2 * v);

    // Rhythmic Japanese double-tap ("clack-clack!") chopstick angle curve (returns open degrees >= 0)
    function computeChopstickTapDeg(nowMs, p) {
      const cycleSec = ((nowMs * 0.001) + p * 2.4) % 1.25;
      const restDeg = 13.5;

      // Tap 1 centered at 0.22s
      if (cycleSec >= 0.08 && cycleSec < 0.36) {
        const u = Math.abs(cycleSec - 0.22) / 0.14; // 1 -> 0 -> 1
        return restDeg * smoothstep(u) * 0.72;
      }
      // Tap 2 centered at 0.50s
      if (cycleSec >= 0.36 && cycleSec < 0.66) {
        const u = Math.abs(cycleSec - 0.50) / 0.15; // 1 -> 0 -> 1
        return restDeg * smoothstep(u);
      }
      return restDeg;
    }

    function applyMenuFrame(now) {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
      lastFrameTime = now;

      const diff = targetP - renderedP;
      if (Math.abs(diff) > 0.0003) {
        renderedP += diff * 0.14;
      } else {
        renderedP = targetP;
      }

      const p = renderedP;

      // ========================================================
      // BEAT 1: RED RAMEN SHOP NOREN CURTAIN (p: 0.00 -> 0.24)
      // ========================================================
      if (norenCurtainLayer) {
        if (p >= 0.25) {
          norenCurtainLayer.style.visibility = 'hidden';
          norenCurtainLayer.style.opacity = '0';
        } else {
          norenCurtainLayer.style.visibility = 'visible';
          const cRaw = clamp01((p - 0.02) / 0.20);
          const cEase = smoothstep(cRaw);
          const curtainFadeOut = 1 - smoothstep(clamp01((p - 0.16) / 0.08));
          norenCurtainLayer.style.opacity = curtainFadeOut.toFixed(3);
          const breeze = (1 - cEase);

          // Gentle idle fabric breeze when hanging closed + sweeping doorway split on scroll
          const s0 = Math.sin(now * 0.0021) * 1.1 * breeze;
          const s1 = Math.sin(now * 0.0021 + 0.8) * 1.3 * breeze;
          const s2 = Math.sin(now * 0.0021 + 1.6) * 1.3 * breeze;
          const s3 = Math.sin(now * 0.0021 + 2.4) * 1.1 * breeze;

          if (norenPanels[0]) {
            norenPanels[0].style.transform = `translate3d(-${(cEase * 128).toFixed(1)}%, -${(cEase * 5).toFixed(1)}%, 0) rotate(${(s0 + cEase * 6).toFixed(2)}deg)`;
          }
          if (norenPanels[1]) {
            norenPanels[1].style.transform = `translate3d(-${(cEase * 232).toFixed(1)}%, -${(cEase * 10).toFixed(1)}%, 0) rotate(${(s1 + cEase * 11).toFixed(2)}deg)`;
          }
          if (norenPanels[2]) {
            norenPanels[2].style.transform = `translate3d(${(cEase * 232).toFixed(1)}%, -${(cEase * 10).toFixed(1)}%, 0) rotate(${(s2 - cEase * 11).toFixed(2)}deg)`;
          }
          if (norenPanels[3]) {
            norenPanels[3].style.transform = `translate3d(${(cEase * 128).toFixed(1)}%, -${(cEase * 5).toFixed(1)}%, 0) rotate(${(s3 - cEase * 6).toFixed(2)}deg)`;
          }

          if (norenWoodRod) {
            const rodLift = smoothstep(clamp01((p - 0.14) / 0.09));
            norenWoodRod.style.transform = `translate3d(0, -${(rodLift * 140).toFixed(1)}%, 0)`;
            norenWoodRod.style.opacity = (1 - rodLift).toFixed(3);
          }
        }
      }

      // ========================================================
      // BEAT 2: LIGHT-BROWN CHOPSTICKS TAPPING (p: 0.08 -> 0.35)
      // ========================================================
      if (chopsticksStage && chopstickLeft && chopstickRight) {
        if (p < 0.07 || p >= 0.36) {
          chopsticksStage.style.visibility = 'hidden';
          chopsticksStage.style.opacity = '0';
        } else {
          chopsticksStage.style.visibility = 'visible';
          const fadeIn = smoothstep(clamp01((p - 0.08) / 0.06));
          const partOut = smoothstep(clamp01((p - 0.28) / 0.07));
          const chopOpacity = fadeIn * (1 - partOut);

          const tapOpenDeg = computeChopstickTapDeg(now, p);
          const finalDeg = tapOpenDeg + partOut * 22;
          const slideApartPx = partOut * 28;

          chopsticksStage.style.opacity = chopOpacity.toFixed(3);
          chopstickLeft.style.transform = `translate3d(-${slideApartPx.toFixed(1)}px, 0, 0) rotate(${finalDeg.toFixed(2)}deg)`;
          chopstickRight.style.transform = `translate3d(${slideApartPx.toFixed(1)}px, 0, 0) rotate(-${finalDeg.toFixed(2)}deg)`;

          if (chopstickTapSparks) {
            // Crisp ink impact pop right when wooden tips tap (< 2.4 deg)
            const sparkAmt = partOut < 0.15 ? clamp01(1 - tapOpenDeg / 2.6) : 0;
            const sparkScale = 0.78 + 0.34 * sparkAmt;
            chopstickTapSparks.style.opacity = sparkAmt.toFixed(3);
            chopstickTapSparks.style.transform = `scale(${sparkScale.toFixed(3)})`;
          }
        }
      }

      // ========================================================
      // BEAT 3: "Our Menu" IN THEME BRUSH BLACK FONT (p: 0.30 -> 0.52)
      // ========================================================
      if (p < 0.29 || p >= 0.53) {
        menuIntroTitle.style.opacity = '0';
      } else {
        const titleIn = smoothstep(clamp01((p - 0.30) / 0.07));
        const titleOut = smoothstep(clamp01((p - 0.45) / 0.07));
        const titleOpacity = titleIn * (1 - titleOut);
        const titleScale = (0.88 + 0.12 * titleIn) * (1 - 0.06 * titleOut);
        menuIntroTitle.style.opacity = titleOpacity.toFixed(3);
        menuIntroTitle.style.transform = `scale(${titleScale.toFixed(3)})`;
      }

      // ========================================================
      // BEAT 4 & 5: 1 PHOTO (0.49..0.66) -> 3-COL SPREAD (0.66..0.88) ->
      //             CONTINUOUS UP/DOWN/UP COLUMNS (>= 0.88)
      // ========================================================
      if (p < 0.48) {
        menuColumnsViewport.style.opacity = '0';
        menuColumnsViewport.style.pointerEvents = 'none';
      } else {
        menuColumnsViewport.style.opacity = '1';
        menuColumnsViewport.style.pointerEvents = 'auto';
      }

      const isMarqueePhase = p >= 0.88;

      if (isMarqueePhase) {
        if (!tilesClearedForMarquee) {
          for (let k = 0; k < allTiles.length; k++) {
            const el = allTiles[k].el;
            el.style.transform = '';
            el.style.opacity = '1';
          }
          tilesClearedForMarquee = true;
        }

        marqueeSpeedScale += (1 - marqueeSpeedScale) * 0.08;
        const pxPerSec = 42;
        marqueePos = (marqueePos + pxPerSec * marqueeSpeedScale * dt) % cycleH;

        const y0 = baseY[0] + marqueePos; // 1st Column: UP -> DOWN
        const y1 = baseY[1] - marqueePos; // 2nd Column: DOWN -> UP
        const y2 = baseY[2] + marqueePos; // 3rd Column: UP -> DOWN

        colTracks[0].style.transform = `translate3d(0, ${y0.toFixed(2)}px, 0)`;
        colTracks[1].style.transform = `translate3d(0, ${y1.toFixed(2)}px, 0)`;
        colTracks[2].style.transform = `translate3d(0, ${y2.toFixed(2)}px, 0)`;
      } else {
        tilesClearedForMarquee = false;
        marqueeSpeedScale = 0;

        if (marqueePos > 0.35) {
          if (marqueePos < cycleH * 0.5) {
            marqueePos *= 0.80;
            if (marqueePos < 0.35) marqueePos = 0;
          } else {
            marqueePos += (cycleH - marqueePos) * 0.20;
            if (cycleH - marqueePos < 0.35) marqueePos = 0;
          }
        } else {
          marqueePos = 0;
        }

        colTracks[0].style.transform = `translate3d(0, ${(baseY[0] + marqueePos).toFixed(2)}px, 0)`;
        colTracks[1].style.transform = `translate3d(0, ${(baseY[1] - marqueePos).toFixed(2)}px, 0)`;
        colTracks[2].style.transform = `translate3d(0, ${(baseY[2] + marqueePos).toFixed(2)}px, 0)`;

        if (p >= 0.48) {
          const heroIn = clamp01((p - 0.49) / 0.09);
          const heroEase = 1 - Math.pow(1 - heroIn, 3);

          const rawSpread = clamp01((p - 0.66) / 0.22);
          const spreadEase = 1 - Math.pow(1 - rawSpread, 3);
          const othersOpacity = clamp01((rawSpread - 0.04) / 0.56);

          for (let k = 0; k < allTiles.length; k++) {
            const st = allTiles[k];
            const el = st.el;

            if (st.isHero) {
              const startScale = 0.86 + 0.72 * heroEase;
              const curScale = startScale + (1.0 - startScale) * spreadEase;
              const tx = st.dx * (1 - spreadEase);
              const ty = st.dy * (1 - spreadEase);
              el.style.opacity = heroEase.toFixed(3);
              el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${curScale.toFixed(3)})`;
            } else if (st.nearViewport) {
              if (rawSpread <= 0.002) {
                el.style.opacity = '0';
              } else {
                const tx = st.dx * (1 - spreadEase);
                const ty = st.dy * (1 - spreadEase);
                const sc = 0.72 + 0.28 * spreadEase;
                el.style.opacity = othersOpacity.toFixed(3);
                el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;
              }
            } else {
              el.style.opacity = rawSpread > 0.9 ? '1' : '0';
            }
          }
        }
      }
    }

    function startMenuLoop() {
      if (menuRafId !== null) return;
      lastFrameTime = performance.now();
      const loop = (now) => {
        if (!isSectionNearScreen || document.hidden) {
          menuRafId = null;
          return;
        }
        applyMenuFrame(now);
        menuRafId = requestAnimationFrame(loop);
      };
      menuRafId = requestAnimationFrame(loop);
    }

    measureMenuGeometry();
    computeScrollTargetP();
    renderedP = targetP;
    applyMenuFrame(performance.now());
    startMenuLoop();

    window.addEventListener('scroll', computeScrollTargetP, { passive: true });
    window.addEventListener('resize', () => {
      measureMenuGeometry();
      computeScrollTargetP();
      applyMenuFrame(performance.now());
    });
    window.addEventListener('load', () => {
      measureMenuGeometry();
      computeScrollTargetP();
      applyMenuFrame(performance.now());
    });

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => {
        measureMenuGeometry();
        computeScrollTargetP();
        applyMenuFrame(performance.now());
      });
      ro.observe(menuStickyCard);
    }

    if ('IntersectionObserver' in window) {
      const menuObs = new IntersectionObserver((entries) => {
        isSectionNearScreen = entries[0].isIntersecting;
        if (isSectionNearScreen) {
          computeScrollTargetP();
          startMenuLoop();
        }
      }, { rootMargin: '250px' });
      menuObs.observe(menuRunway);
    }

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && isSectionNearScreen) {
        startMenuLoop();
      }
    });
  }

  // ==========================================
  // 4. NON-BLOCKING PURE HORIZONTAL SWIPE PDF
  // ==========================================
  const PDF_URL = 'BROTHERS-RAMEN.pdf?v=2';
  const portfolioSection = document.getElementById('portfolio');
  const swipeLoading = document.getElementById('pdfSwipeLoading');
  const swipeTrack = document.getElementById('pdfSwipeTrack');
  const swipeCounterBadge = document.getElementById('swipeCounterBadge');
  const swipeProgressBar = document.getElementById('swipeProgressBar');

  const openFullscreenBtn = document.getElementById('openFullscreenSwipe');
  const deckModal = document.getElementById('deckModal');
  const closeDeckBtn = document.getElementById('closeDeckBtn');
  const modalSwipeTrack = document.getElementById('modalSwipeTrack');
  const modalSwipeBadge = document.getElementById('modalSwipeBadge');
  const modalProgressBar = document.getElementById('modalProgressBar');

  let pdfDoc = null;
  let pdfStartedLoading = false;
  let currentInlineSlide = 1;
  let modalSlidesBuilt = false;

  function attachSwipePhysics(trackEl, getTotalSlides, onActiveChange) {
    if (!trackEl) return;

    let isMouseDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let startSlideIndex = 0;
    let snapRestoreTimer = null;

    trackEl.addEventListener('scroll', () => {
      const w = trackEl.clientWidth || 1;
      const total = getTotalSlides();
      const idx = Math.max(1, Math.min(total, Math.round(trackEl.scrollLeft / w) + 1));
      onActiveChange(idx, total);
    }, { passive: true });

    trackEl.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isMouseDown = true;
      clearTimeout(snapRestoreTimer);
      trackEl.classList.add('is-dragging');
      startX = e.clientX;
      startScrollLeft = trackEl.scrollLeft;
      const w = trackEl.clientWidth || 1;
      startSlideIndex = Math.round(startScrollLeft / w);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      e.preventDefault();
      const dx = e.clientX - startX;
      trackEl.scrollLeft = startScrollLeft - dx;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isMouseDown) return;
      isMouseDown = false;

      const w = trackEl.clientWidth || 1;
      const total = getTotalSlides();
      const dragDelta = startX - e.clientX;

      let targetIdx = startSlideIndex;
      if (Math.abs(dragDelta) > w * 0.55) {
        targetIdx = Math.round(trackEl.scrollLeft / w);
      } else if (dragDelta > 40) {
        targetIdx = startSlideIndex + 1;
      } else if (dragDelta < -40) {
        targetIdx = startSlideIndex - 1;
      }

      targetIdx = Math.max(0, Math.min(total - 1, targetIdx));
      trackEl.scrollTo({ left: targetIdx * w, behavior: 'smooth' });

      snapRestoreTimer = setTimeout(() => {
        trackEl.classList.remove('is-dragging');
      }, 320);
    });
  }

  const yieldToMain = () => new Promise((resolve) => setTimeout(resolve, 24));

  async function populateSwipeTrack(trackEl, targetPixelWidth) {
    if (!pdfDoc || !trackEl) return;
    trackEl.innerHTML = '';

    const totalPages = pdfDoc.numPages;
    const slides = [];

    for (let p = 1; p <= totalPages; p++) {
      const slideWrap = document.createElement('div');
      slideWrap.className = 'pdf-swipe-slide aspect-video bg-neutral-50 flex items-center justify-center relative overflow-hidden';

      const canvas = document.createElement('canvas');
      canvas.className = 'w-full h-full object-contain pointer-events-none block';

      slideWrap.appendChild(canvas);
      trackEl.appendChild(slideWrap);
      slides.push({ pageNum: p, canvas });
    }

    for (const item of slides) {
      try {
        const page = await pdfDoc.getPage(item.pageNum);
        const unscaled = page.getViewport({ scale: 1 });
        const scale = targetPixelWidth / unscaled.width;
        const viewport = page.getViewport({ scale });

        item.canvas.width = viewport.width;
        item.canvas.height = viewport.height;

        const ctx = item.canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        if (item.pageNum === 1 && trackEl === swipeTrack) {
          if (swipeLoading) swipeLoading.classList.add('hidden');
          swipeTrack.classList.remove('hidden');
        }

        if (item.pageNum >= 2) {
          await yieldToMain();
        }
      } catch {
        // Ignore if cancelled
      }
    }
  }

  attachSwipePhysics(
    swipeTrack,
    () => (pdfDoc ? pdfDoc.numPages : 15),
    (activePage, total) => {
      currentInlineSlide = activePage;
      if (swipeCounterBadge) swipeCounterBadge.textContent = `${activePage} / ${total}`;
      if (swipeProgressBar) swipeProgressBar.style.width = `${(activePage / total) * 100}%`;
    }
  );

  attachSwipePhysics(
    modalSwipeTrack,
    () => (pdfDoc ? pdfDoc.numPages : 15),
    (activePage, total) => {
      if (modalSwipeBadge) modalSwipeBadge.textContent = `${activePage} / ${total}`;
      if (modalProgressBar) modalProgressBar.style.width = `${(activePage / total) * 100}%`;
    }
  );

  function initPdfCarousel() {
    if (pdfStartedLoading || !swipeTrack) return;
    if (!window.pdfjsLib) {
      setTimeout(initPdfCarousel, 80);
      return;
    }
    pdfStartedLoading = true;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    pdfjsLib.getDocument(PDF_URL).promise.then((pdf) => {
      pdfDoc = pdf;
      if (swipeCounterBadge) swipeCounterBadge.textContent = `1 / ${pdf.numPages}`;
      if (swipeProgressBar) swipeProgressBar.style.width = `${(1 / pdf.numPages) * 100}%`;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const inlineRenderWidth = Math.max(760, Math.round(420 * dpr));
      populateSwipeTrack(swipeTrack, inlineRenderWidth);
    }).catch(() => {
      if (swipeLoading) {
        swipeLoading.innerHTML = `<div class="text-red-600 font-bold text-center px-4">Presentation file not found</div>`;
      }
    });
  }

  if ('IntersectionObserver' in window && portfolioSection) {
    const pdfLazyObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        pdfLazyObserver.disconnect();
        initPdfCarousel();
      }
    }, { rootMargin: '280px' });
    pdfLazyObserver.observe(portfolioSection);
  } else {
    setTimeout(initPdfCarousel, 400);
  }

  if (openFullscreenBtn && deckModal && modalSwipeTrack) {
    openFullscreenBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      deckModal.classList.remove('hidden');

      if (pdfDoc && !modalSlidesBuilt) {
        modalSlidesBuilt = true;
        await populateSwipeTrack(modalSwipeTrack, 1440);
      }

      if (pdfDoc) {
        requestAnimationFrame(() => {
          const w = modalSwipeTrack.clientWidth || 1;
          modalSwipeTrack.scrollTo({ left: (currentInlineSlide - 1) * w, behavior: 'instant' });
          if (modalSwipeBadge) modalSwipeBadge.textContent = `${currentInlineSlide} / ${pdfDoc.numPages}`;
          if (modalProgressBar) modalProgressBar.style.width = `${(currentInlineSlide / pdfDoc.numPages) * 100}%`;
        });
      }
    });
  }

  if (closeDeckBtn && deckModal) {
    closeDeckBtn.addEventListener('click', () => {
      deckModal.classList.add('hidden');
    });
    deckModal.addEventListener('click', (e) => {
      if (e.target === deckModal) deckModal.classList.add('hidden');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (photoModal && !photoModal.classList.contains('hidden')) photoModal.classList.add('hidden');
      if (menuModal && !menuModal.classList.contains('hidden')) menuModal.classList.add('hidden');
      if (deckModal && !deckModal.classList.contains('hidden')) deckModal.classList.add('hidden');
    } else if (deckModal && !deckModal.classList.contains('hidden') && modalSwipeTrack && pdfDoc) {
      const w = modalSwipeTrack.clientWidth || 1;
      const cur = Math.round(modalSwipeTrack.scrollLeft / w);
      if (e.key === 'ArrowRight') {
        modalSwipeTrack.scrollTo({ left: Math.min(pdfDoc.numPages - 1, cur + 1) * w, behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft') {
        modalSwipeTrack.scrollTo({ left: Math.max(0, cur - 1) * w, behavior: 'smooth' });
      }
    }
  });
});
