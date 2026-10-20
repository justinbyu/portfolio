(() => {
  const bloomBtn = document.getElementById('bloomBtn');
  const bouquetCard = document.getElementById('bouquetCard');
  const letterBody = document.getElementById('letterBody');
  const editLetterBtn = document.getElementById('editLetterBtn');
  const editHint = document.getElementById('editHint');
  const letterJump = document.getElementById('letterJump');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const musicPlayer = document.getElementById('musicPlayer');
  const soundToggle = document.getElementById('soundToggle');
  const soundLabel = document.getElementById('soundLabel');
  const musicVolume = document.getElementById('musicVolume');
  const volumeValue = document.getElementById('volumeValue');
  const angelLayer = document.getElementById('angelLayer');

  // Cupid repeatedly glides from side to side with a gentle floating motion.
  function launchAngel() {
    const flight = document.createElement('div');
    const angel = new Image();
    const direction = Math.random() < 0.5 ? 'angel-fly--ltr' : 'angel-fly--rtl';
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    flight.className = `angel-flight ${direction}${isMobile ? ' angel-flight--mobile' : ''}`;
    flight.style.top = isMobile
      ? `${12 + Math.random() * 45}vh`
      : `${8 + Math.random() * 72}vh`;
    flight.style.width = isMobile
      ? `${Math.min(126, Math.max(92, window.innerWidth * 0.3))}px`
      : `${110 + Math.random() * 80}px`;
    flight.style.setProperty('--flight-duration', isMobile
      ? `${9 + Math.random() * 4}s`
      : `${11 + Math.random() * 7}s`);
    angel.src = 'assets/angel.png';
    angel.alt = '';
    angel.className = 'angel-sprite';
    angel.setAttribute('role', 'button');
    angel.setAttribute('tabindex', '0');
    angel.setAttribute('aria-label', 'Tap the angel to drop hearts; three taps makes it fall');
    let taps = 0;
    let dropped = false;

    function tapAngel(event) {
      if (dropped) return;
      if (event) event.preventDefault();
      taps += 1;
      dropHeart(angel);
      if (taps >= 3) {
        dropped = true;
        const rect = flight.getBoundingClientRect();
        flight.style.animation = 'none';
        flight.style.left = `${rect.left}px`;
        flight.style.top = `${rect.top}px`;
        flight.style.transform = 'none';
        flight.classList.add('angel-dropped');
      }
    }

    angel.addEventListener('click', tapAngel);
    angel.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') tapAngel(event);
    });
    flight.appendChild(angel);
    angelLayer.appendChild(flight);
    flight.addEventListener('animationend', (event) => {
      // Ignore the sprite's wing-bob animation; only finish on the flight/drop.
      if (event.target !== flight) return;
      flight.remove();
      window.setTimeout(launchAngel, dropped ? 900 : 700 + Math.random() * 2600);
    });
  }
  function dropHeart(fromAngel) {
    const rect = fromAngel.getBoundingClientRect();
    const heart = document.createElement('span');
    heart.className = 'touch-heart';
    heart.setAttribute('aria-hidden', 'true');
    heart.textContent = '❤️';
    heart.style.left = `${rect.left + rect.width * (.4 + Math.random() * .2)}px`;
    heart.style.top = `${rect.top + rect.height * .3}px`;
    heart.style.setProperty('--heart-size', `${38 + Math.random() * 14}px`);
    heart.style.setProperty('--heart-fall-time', `${3.2 + Math.random() * .8}s`);
    document.body.appendChild(heart);
    heart.addEventListener('animationend', () => heart.remove(), { once: true });
  }

  window.setTimeout(launchAngel, 900);

  // Web Audio gain gives the volume slider consistent control on iPhone/iPad too.
  let audioContext = null;
  let mediaSource = null;
  let gainNode = null;
  function applyMusicVolume() {
    const value = Number(musicVolume.value);
    volumeValue.value = `${Math.round(value * 100)}%`;
    if (gainNode && audioContext) {
      gainNode.gain.setTargetAtTime(value, audioContext.currentTime, 0.025);
    } else {
      // Fallback for browsers without Web Audio support.
      musicPlayer.volume = value;
    }
  }
  applyMusicVolume();
  musicVolume.addEventListener('input', applyMusicVolume);

  async function unlockAudioForMobile() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioContext) {
      audioContext = new AudioContextClass();
      mediaSource = audioContext.createMediaElementSource(musicPlayer);
      gainNode = audioContext.createGain();
      mediaSource.connect(gainNode);
      gainNode.connect(audioContext.destination);
      applyMusicVolume();
    }
    if (audioContext.state === 'suspended') await audioContext.resume();
  }

  soundToggle.addEventListener('click', async () => {
    if (musicPlayer.paused) {
      try {
        await unlockAudioForMobile();
        await musicPlayer.play();
        soundToggle.setAttribute('aria-pressed', 'true');
        soundToggle.setAttribute('aria-label', 'Pause our song');
        soundLabel.textContent = 'Pause our song';
      } catch (error) {
        soundLabel.textContent = 'Check your audio file';
        console.error('Check that assets/Love Me For What I Am.mp3 exists and is a playable audio file.', error);
      }
    } else {
      musicPlayer.pause();
      soundToggle.setAttribute('aria-pressed', 'false');
      soundToggle.setAttribute('aria-label', 'Play our song');
      soundLabel.textContent = 'Play our song';
    }
  });

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
    { src: 'assets/couple-2.jpg', alt: 'A favorite memory together, photo 1 of 6', caption: 'The beginning of us' },
    { src: 'assets/couple-3.jpg', alt: 'A favorite memory together, photo 2 of 6', caption: 'Your laugh is my favorite sound' },
    { src: 'assets/couple-4.jpg', alt: 'A favorite memory together, photo 3 of 6', caption: 'One of our little adventures' },
    { src: 'assets/couple-5.jpg', alt: 'A favorite memory together, photo 4 of 6', caption: 'A day I keep replaying' },
    { src: 'assets/couple-6.jpg', alt: 'A favorite memory together, photo 5 of 6', caption: 'My favorite place is beside you' },
    { src: 'assets/couple-1.jpg', alt: 'A favorite memory together, photo 6 of 6', caption: 'And all the days still to come' }
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
    // A bold shower of flower-shaped petals falls through the whole viewport.
    const symbols = ['🌸', '🌹', '💮', '❀', '✿'];
    for (let i = 0; i < 64; i += 1) {
      const petal = document.createElement('span');
      petal.className = 'petal-fall';
      petal.setAttribute('aria-hidden', 'true');
      petal.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      petal.style.left = `${Math.random() * 96}vw`;
      petal.style.top = '-9vh';
      petal.style.fontSize = `${22 + Math.random() * 22}px`;
      petal.style.setProperty('--fall-time', `${5 + Math.random() * 4}s`);
      petal.style.setProperty('--fall-delay', `${Math.random() * 1.6}s`);
      petal.style.setProperty('--sway', `${-90 + Math.random() * 180}px`);
      document.body.appendChild(petal);
      petal.addEventListener('animationend', () => petal.remove(), { once: true });
    }
  }

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
