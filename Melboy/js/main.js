// JavaScript handling 3D Orbit animation, drag controls, and PDF.js Canvas Renderer
document.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('orbitStage');
  const container = document.getElementById('orbitContainer');

  const products = [
    { title: 'Overload Spicy', sub: 'Signature Ramen', icon: 'fa-pepper-hot', color: 'text-red-500' },
    { title: 'Milky Tonkotsu', sub: 'Rich Creamy Broth', icon: 'fa-bowl-food', color: 'text-amber-600' },
    { title: 'Curry Ramen', sub: 'Japanese Curry', icon: 'fa-spoon', color: 'text-amber-700' },
    { title: 'Crispy Karaage', sub: 'Side Dish', icon: 'fa-drumstick-bite', color: 'text-orange-600' },
    { title: 'Handmade Gyoza', sub: 'Japanese Dumpling', icon: 'fa-box', color: 'text-emerald-600' },
    { title: 'Classic Overload', sub: 'Traditional Flavor', icon: 'fa-utensils', color: 'text-stone-800' }
  ];

  const total = products.length;
  const radius = 140;
  let angleDeg = 0;
  let isDragging = false;
  let startX = 0;

  // Render 3D Orbit items
  products.forEach((prod, i) => {
    const card = document.createElement('div');
    card.className = 'orbit-card-item flex flex-col items-center justify-center p-3 text-center';
    card.setAttribute('data-index', i);
    card.innerHTML = `
      <div class="w-12 h-12 rounded-2xl bg-stone-900/5 flex items-center justify-center mb-2 shadow-inner">
        <i class="fa-solid ${prod.icon} text-2xl ${prod.color}"></i>
      </div>
      <div class="text-xs font-bold text-stone-900 leading-tight">${prod.title}</div>
      <div class="text-[9px] text-stone-500 mt-1">${prod.sub}</div>
      <div class="mt-2 text-[8px] font-bold text-amber-800 bg-amber-500/10 px-2 py-0.5 rounded-full">
        Brother's Ramen
      </div>
    `;
    stage.appendChild(card);
  });

  const cards = stage.querySelectorAll('.orbit-card-item');

  function updateOrbit() {
    cards.forEach((card, i) => {
      const cardAngleRad = ((i / total) * 360 + angleDeg) * (Math.PI / 180);
      const x = Math.sin(cardAngleRad) * radius;
      const z = Math.cos(cardAngleRad) * radius;
      const scale = (z + radius) / (2 * radius) * 0.4 + 0.6;
      const opacity = (z + radius) / (2 * radius) * 0.6 + 0.4;

      card.style.transform = `translate3d(${x}px, 0px, ${z}px) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = Math.round(z + radius);
    });
  }

  // Continuous smooth auto-rotation
  function animate() {
    if (!isDragging) {
      angleDeg += 0.4;
      updateOrbit();
    }
    requestAnimationFrame(animate);
  }
  animate();

  // Mouse & Touch Drag Controls
  const startDrag = (x) => {
    isDragging = true;
    startX = x;
  };

  const moveDrag = (x) => {
    if (!isDragging) return;
    const dx = x - startX;
    angleDeg += dx * 0.3;
    startX = x;
    updateOrbit();
  };

  const endDrag = () => {
    isDragging = false;
  };

  container.addEventListener('mousedown', (e) => startDrag(e.clientX));
  window.addEventListener('mousemove', (e) => moveDrag(e.clientX));
  window.addEventListener('mouseup', endDrag);

  container.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX));
  window.addEventListener('touchmove', (e) => moveDrag(e.touches[0].clientX));
  window.addEventListener('touchend', endDrag);

  // PDF.JS RENDERING ENGINE (Bypasses iframe blocked & reload errors)
  if (window['pdfjs-dist/build/pdf']) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  let pdfDoc = null;
  let pageNum = 1;
  let pageRendering = false;
  let pageNumPending = null;

  const canvas = document.getElementById('pdfCanvas');
  const ctx = canvas.getContext('2d');
  const loading = document.getElementById('pdfLoading');
  const pageCounter = document.getElementById('pageCounter');

  function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then((page) => {
      const viewport = page.getViewport({ scale: 1.2 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      const renderTask = page.render(renderContext);

      renderTask.promise.then(() => {
        pageRendering = false;
        if (pageNumPending !== null) {
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    });

    pageCounter.textContent = `Page ${num} of ${pdfDoc.numPages}`;
  }

  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  function loadPDF(source) {
    loading.classList.remove('hidden');
    canvas.classList.add('hidden');

    pdfjsLib.getDocument(source).promise.then((pdf) => {
      pdfDoc = pdf;
      pageNum = 1;
      loading.classList.add('hidden');
      canvas.classList.remove('hidden');
      renderPage(pageNum);
    }).catch((err) => {
      loading.innerHTML = `
        <div class="text-rose-400 font-bold mb-1"><i class="fa-solid fa-triangle-exclamation mr-1"></i> File BROTHERS-RAMEN.pdf not found in root directory</div>
        <div class="text-[11px] text-stone-400 max-w-xs text-center">Please use the <strong>"Open Local File"</strong> button in the top bar to select your PDF file directly.</div>
      `;
    });
  }

  document.getElementById('prevPage').addEventListener('click', () => {
    if (pdfDoc && pageNum > 1) {
      pageNum--;
      queueRenderPage(pageNum);
    }
  });

  document.getElementById('nextPage').addEventListener('click', () => {
    if (pdfDoc && pageNum < pdfDoc.numPages) {
      pageNum++;
      queueRenderPage(pageNum);
    }
  });

  document.getElementById('pdfFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const fileReader = new FileReader();
      fileReader.onload = function() {
        const typedarray = new Uint8Array(this.result);
        loadPDF(typedarray);
      };
      fileReader.readAsArrayBuffer(file);
    }
  });

  // Modal Controls
  const deckModal = document.getElementById('deckModal');
  const portfolioTriggerCard = document.getElementById('portfolioTriggerCard');
  const closeDeckBtn = document.getElementById('closeDeckBtn');

  if (portfolioTriggerCard && deckModal && closeDeckBtn) {
    portfolioTriggerCard.addEventListener('click', () => {
      deckModal.classList.remove('hidden');
      if (!pdfDoc) {
        loadPDF('BROTHERS-RAMEN.pdf');
      }
    });
    closeDeckBtn.addEventListener('click', () => {
      deckModal.classList.add('hidden');
    });
    deckModal.addEventListener('click', (e) => {
      if (e.target === deckModal) deckModal.classList.add('hidden');
    });
  }
});
