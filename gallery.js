// Gallery state
let currentUser = null; // Simple placeholder for user context

// Sample image URLs (will be replaced by Firebase Storage)
const sampleImages = [
   
];

let currentModalIndex = 0;
// autoScrollInterval flag removed – we control scrolling via speed variable

// load saved images from localStorage if any
function loadSavedImages() {
    const stored = localStorage.getItem('galleryImages');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return [];
        }
    }
    return [];
}

function saveImages(images) {
    localStorage.setItem('galleryImages', JSON.stringify(images));
}

function removeImage(index) {
    sampleImages.splice(index, 1);
    saveImages(sampleImages);
    renderGallery();
}

// render current sampleImages array into grid (clears and re-populates)
function renderGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    galleryGrid.innerHTML = ''; // remove existing

    sampleImages.forEach((imageData, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item loading';
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('data-index', index);
        item.setAttribute('aria-label', `${imageData.alt}, click to view`);

        const img = document.createElement('img');
        img.src = imageData.url;
        img.alt = imageData.alt;
        img.loading = 'lazy';

        img.onload = () => item.classList.remove('loading');
        img.onerror = () => item.classList.remove('loading');

        item.appendChild(img);

        // add delete button overlay
        const del = document.createElement('button');
        del.className = 'delete-btn';
        del.setAttribute('aria-label', 'Delete image');
        del.innerHTML = '&times;';
        del.addEventListener('click', (e) => {
            e.stopPropagation();
            removeImage(index);
        });
        item.appendChild(del);

        galleryGrid.appendChild(item);

        // Click/keyboard handlers
        item.addEventListener('click', () => openModal(index));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(index);
            }
        });
    });
}

function initGallery() {
    const saved = loadSavedImages();
    if (saved.length) {
        sampleImages.length = 0;
        sampleImages.push(...saved);
    }

    renderGallery();
    setupAutoScroll();
}

// Lightbox functions
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
    const modal = document.getElementById('lightboxModal');
    modal.classList.remove('open');
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

// Auto-scroll setup – container scrolls itself slowly, but user may scroll manually at any time
let autoScrollSpeed = 0.15; // Global speed variable (slower scroll)

function pauseAutoScroll() {
    autoScrollSpeed = 0;
}

function resumeAutoScroll() {
    autoScrollSpeed = 0.15;
}

function setupAutoScroll() {
    const gallery = document.getElementById('galleryGrid');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        autoScrollSpeed = 0;
    }

    function step() {
        if (document.visibilityState === 'visible') {
            gallery.scrollLeft += autoScrollSpeed;
            const half = gallery.scrollWidth / 2;
            if (gallery.scrollLeft >= half) {
                gallery.scrollLeft -= half;
            }
        }
        requestAnimationFrame(step);
    }
    step();

    // pause auto‑scroll while user interacts (mouse or touch)
    ['mouseenter','focusin','touchstart','wheel','scroll'].forEach(evt => {
        gallery.addEventListener(evt, () => { autoScrollSpeed = 0; });
    });
    ['mouseleave','focusout','touchend'].forEach(evt => {
        gallery.addEventListener(evt, () => { autoScrollSpeed = 0.3; });
    });
}

// Modal controls

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalNext').addEventListener('click', nextImage);
document.getElementById('modalPrev').addEventListener('click', previousImage);

// Modal overlay click to close

document.getElementById('lightboxModal').addEventListener('click', (e) => {
    if (e.target.id === 'lightboxModal') closeModal();
});

// FAB button opens file picker

document.getElementById('fabBtn').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

// Handle file selection and convert to data URLs for local storage

document.getElementById('fileInput').addEventListener('change', (e) => {
    const files = e.target.files;
    if (!files.length) return;

    for (let file of files) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = {
                url: event.target.result,
                alt: file.name
            };
            sampleImages.push(imageData);
            saveImages(sampleImages);
            renderGallery();
            console.log("✅ Added:", file.name);
        };
        reader.readAsDataURL(file);
    }
    
    e.target.value = '';
});

// Load images from local storage on page load
function loadImagesFromStorage() {
    const saved = loadSavedImages();
    if (saved.length) {
        sampleImages.length = 0;
        sampleImages.push(...saved);
    }
    renderGallery();
}

// Initialize on page load

window.addEventListener('load', () => {
    try {
        console.log("📚 Loading images from local storage...");
        loadImagesFromStorage();
        console.log("✅ Page loaded successfully");
        setupAutoScroll();
    } catch (error) {
        console.error("❌ Error during initialization:", error);
        alert("Error loading gallery: " + error.message);
    }
});

// Respect prefers-reduced-motion

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // stop auto scroll
    // speed variable will be set to 0 after setupAutoScroll
}
