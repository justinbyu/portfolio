(() => {
  const bloomBtn = document.getElementById('bloomBtn');
  const bouquetCard = document.getElementById('bouquetCard');
  const musicPlayer = document.getElementById('musicPlayer');
  const soundToggle = document.getElementById('soundToggle');
  const soundLabel = document.getElementById('soundLabel');
  const letterBody = document.getElementById('letterBody');
  const editLetterBtn = document.getElementById('editLetterBtn');
  const editHint = document.getElementById('editHint');
  const letterJump = document.getElementById('letterJump');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Show today's date on the letter.
  const date = document.getElementById('letterDate');
  date.textContent = new Intl.DateTimeFormat(undefined, {
    month: 'long', year: 'numeric'
  }).format(new Date());

  // Slowly open the bouquet, then reveal the memories button when the bloom finishes.
  const memoriesCtaWrap = document.getElementById('memoriesCtaWrap');
  const memoriesSection = document.getElementById('memoriesSection');
  let bloomTimer;

  bloomBtn.addEventListener('click', () => {
    const opening = !bouquetCard.classList.contains('is-open');
    window.clearTimeout(bloomTimer);
    bouquetCard.classList.toggle('is-open', opening);
    bloomBtn.setAttribute('aria-expanded', String(opening));

    if (opening) {
      bloomBtn.innerHTML = '<span>✧</span> Watch it bloom';
      bloomBtn.disabled = true;
      memoriesCtaWrap.hidden = true;
      memoriesSection.hidden = true;
      makePetalRain();
      bloomTimer = window.setTimeout(() => {
        bloomBtn.disabled = false;
        bloomBtn.innerHTML = '<span>✧</span> Close the bouquet';
        memoriesCtaWrap.hidden = false;
        memoriesCtaWrap.classList.add('is-visible');
      }, 4200);
    } else {
      bloomBtn.disabled = false;
      bloomBtn.innerHTML = '<span>✧</span> Let it bloom';
      memoriesCtaWrap.hidden = true;
      memoriesSection.hidden = true;
      memoriesCtaWrap.classList.remove('is-visible');
    }
  });

  // Open the six-photo story section.
  document.getElementById('memoriesBtn').addEventListener('click', () => {
    memoriesSection.hidden = false;
    memoriesSection.classList.add('is-visible');
    memoriesSection.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
  });

  // Six replaceable photo slides with arrows, dots, and touch-swipe navigation.
  const memories = [
    { src: 'assets/couple-1.svg', alt: 'A favorite memory together, photo 1 of 6', caption: 'The beginning of us' },
    { src: 'assets/couple-2.svg', alt: 'A favorite memory together, photo 2 of 6', caption: 'Your laugh is my favorite sound' },
    { src: 'assets/couple-3.svg', alt: 'A favorite memory together, photo 3 of 6', caption: 'One of our little adventures' },
    { src: 'assets/couple-4.svg', alt: 'A favorite memory together, photo 4 of 6', caption: 'A day I keep replaying' },
    { src: 'assets/couple-5.svg', alt: 'A favorite memory together, photo 5 of 6', caption: 'My favorite place is beside you' },
    { src: 'assets/couple-6.svg', alt: 'A favorite memory together, photo 6 of 6', caption: 'And all the days still to come' }
  ];
  let memoryIndex = 0;
  const memoryImage = document.getElementById('memoryImage');
  const memoryCaption = document.getElementById('memoryCaption');
  const memoryCount = document.getElementById('memoryCount');
  const memoryDots = document.getElementById('memoryDots');

  function showMemory(index) {
    memoryIndex = (index + memories.length) % memories.length;
    const memory = memories[memoryIndex];
    memoryImage.classList.add('is-changing');
    window.setTimeout(() => {
      memoryImage.src = memory.src;
      memoryImage.alt = memory.alt;
      memoryCaption.textContent = memory.caption;
      memoryCount.innerHTML = `${String(memoryIndex + 1).padStart(2, '0')} <i>/</i> 06`;
      memoryImage.classList.remove('is-changing');
      [...memoryDots.children].forEach((dot, i) => {
        dot.classList.toggle('is-active', i === memoryIndex);
        dot.setAttribute('aria-current', i === memoryIndex ? 'true' : 'false');
      });
    }, 160);
  }

  memories.forEach((memory, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `memory-dot${i === 0 ? ' is-active' : ''}`;
    dot.setAttribute('aria-label', `Show memory ${i + 1}`);
    dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => showMemory(i));
    memoryDots.appendChild(dot);
  });

  document.getElementById('prevMemory').addEventListener('click', () => showMemory(memoryIndex - 1));
  document.getElementById('nextMemory').addEventListener('click', () => showMemory(memoryIndex + 1));
  let touchStartX = 0;
  document.getElementById('memorySlide').addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
  document.getElementById('memorySlide').addEventListener('touchend', event => {
    const change = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(change) > 45) showMemory(memoryIndex + (change < 0 ? 1 : -1));
  }, { passive: true });

  function makePetalRain() {
    if (reduceMotion.matches) return;
    const symbols = ['✿', '❀', '❁', '✾', '♥'];
    // A generous shower spread across the full screen.
    for (let i = 0; i < 42; i += 1) {
      const petal = document.createElement('span');
      petal.className = 'petal-fall';
      petal.setAttribute('aria-hidden', 'true');
      petal.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      petal.style.left = `${Math.random() * 100}vw`;
      petal.style.top = `${-5 - Math.random() * 35}vh`;
      petal.style.fontSize = `${14 + Math.random() * 20}px`;
      petal.style.setProperty('--fall-time', `${5 + Math.random() * 5}s`);
      petal.style.setProperty('--sway', `${-100 + Math.random() * 200}px`);
      document.body.appendChild(petal);
      petal.addEventListener('animationend', () => petal.remove(), { once: true });
    }
  }

  // Play/pause music. A user gesture is required by modern browsers.
  soundToggle.addEventListener('click', async () => {
    if (musicPlayer.paused) {
      try {
        await musicPlayer.play();
        soundToggle.setAttribute('aria-pressed', 'true');
        soundToggle.setAttribute('aria-label', 'Pause background music');
        soundLabel.textContent = 'Pause our song';
      } catch (error) {
        soundLabel.textContent = 'Add assets/music.mp3';
        console.error('Music could not be played. Check assets/music.mp3.', error);
      }
    } else {
      musicPlayer.pause();
      soundToggle.setAttribute('aria-pressed', 'false');
      soundToggle.setAttribute('aria-label', 'Play background music');
      soundLabel.textContent = 'Play our song';
    }
  });

  musicPlayer.addEventListener('ended', () => {
    soundToggle.setAttribute('aria-pressed', 'false');
    soundToggle.setAttribute('aria-label', 'Play background music');
    soundLabel.textContent = 'Play our song';
  });

  // Letter is directly editable; edits are saved on this device.
  editLetterBtn.addEventListener('click', () => {
    const editing = letterBody.getAttribute('contenteditable') === 'true';
    letterBody.setAttribute('contenteditable', String(!editing));
    editLetterBtn.innerHTML = editing ? 'Save this letter <span>✓</span>' : 'Done editing <span>✓</span>';
    editHint.textContent = editing ? 'Your letter has been saved in this browser.' : 'Click in the letter to change its words.';
    if (editing) {
      localStorage.setItem('bouquet-love-letter', letterBody.innerHTML);
    } else {
      letterBody.focus();
    }
  });

  const savedLetter = localStorage.getItem('bouquet-love-letter');
  if (savedLetter) letterBody.innerHTML = savedLetter;

  letterJump.addEventListener('click', () => {
    document.getElementById('letterSection').scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });
})();
