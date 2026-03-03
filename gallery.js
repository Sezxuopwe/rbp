let sampleImages = [];
let currentModalIndex = 0;
let autoScrollSpeed = 0.15;

async function loadImagesFromStorage() {
  try {
    const res = await fetch('/.netlify/functions/getImages');
    const data = await res.json();
    sampleImages = Array.isArray(data) ? data : [];
    renderGallery();
  } catch (err) {
    console.error('โหลดรูปไม่ได้:', err);
    sampleImages = [];
    renderGallery();
  }
}

function removeImage(index) {
  sampleImages.splice(index, 1);
  renderGallery();
}

function renderGallery() {
  const galleryGrid = document.getElementById('galleryGrid');
  galleryGrid.innerHTML = '';

  sampleImages.forEach((imageData, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item loading';
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('data-index', index);

    const img = document.createElement('img');
    img.src = imageData.url;
    img.alt = imageData.alt;
    img.loading = 'lazy';
    img.onload = () => item.classList.remove('loading');
    img.onerror = () => item.classList.remove('loading');
    item.appendChild(img);

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.innerHTML = '&times;';
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      removeImage(index);
    });
    item.appendChild(del);

    item.addEventListener('click', () => openModal(index));
    galleryGrid.appendChild(item);
  });
}

document.getElementById('fileInput').addEventListener('change', async (e) => {
  const files = e.target.files;
  if (!files.length) return;

  for (let file of files) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const res = await fetch('/.netlify/functions/upload', {
          method: 'POST',
          body: JSON.stringify({ image: event.target.result, filename: file.name }),
        });
        const data = await res.json();
        sampleImages.push({ url: data.url, alt: file.name });
        renderGallery();
        console.log('อัพโหลดสำเร็จ:', file.name);
      } catch (err) {
        console.error(' อัพโหลดไม่ได้:', err);
      }
    };
    reader.readAsDataURL(file);
  }
  e.target.value = '';
});

function openModal(index) {
  currentModalIndex = index;
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('modalImage');
  img.src = sampleImages[index].url;
  img.alt = sampleImages[index].alt;
  modal.classList.add('open');
  pauseAutoScroll();
  document.addEventListener('keydown', handleModalKeyboard);
}

function closeModal() {
  document.getElementById('lightboxModal').classList.remove('open');
  resumeAutoScroll();
  document.removeEventListener('keydown', handleModalKeyboard);
}

function handleModalKeyboard(e) {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowLeft') previousImage();
  if (e.key === 'ArrowRight') nextImage();
}

function nextImage() {
  currentModalIndex = (currentModalIndex + 1) % sampleImages.length;
  const img = document.getElementById('modalImage');
  img.src = sampleImages[currentModalIndex].url;
  img.alt = sampleImages[currentModalIndex].alt;
}

function previousImage() {
  currentModalIndex = (currentModalIndex - 1 + sampleImages.length) % sampleImages.length;
  const img = document.getElementById('modalImage');
  img.src = sampleImages[currentModalIndex].url;
  img.alt = sampleImages[currentModalIndex].alt;
}

function pauseAutoScroll() { autoScrollSpeed = 0; }
function resumeAutoScroll() { autoScrollSpeed = 0.15; }

function setupAutoScroll() {
  const gallery = document.getElementById('galleryGrid');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    autoScrollSpeed = 0;
  }
  function step() {
    if (document.visibilityState === 'visible') {
      gallery.scrollLeft += autoScrollSpeed;
      const half = gallery.scrollWidth / 2;
      if (gallery.scrollLeft >= half) gallery.scrollLeft -= half;
    }
    requestAnimationFrame(step);
  }
  step();

  ['mouseenter','focusin','touchstart','wheel','scroll'].forEach(evt => {
    gallery.addEventListener(evt, () => { autoScrollSpeed = 0; });
  });
  ['mouseleave','focusout','touchend'].forEach(evt => {
    gallery.addEventListener(evt, () => { autoScrollSpeed = 0.3; });
  });
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalNext').addEventListener('click', nextImage);
document.getElementById('modalPrev').addEventListener('click', previousImage);
document.getElementById('lightboxModal').addEventListener('click', (e) => {
  if (e.target.id === 'lightboxModal') closeModal();
});
document.getElementById('fabBtn').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

window.addEventListener('load', () => {
  loadImagesFromStorage();
  setupAutoScroll();
});


