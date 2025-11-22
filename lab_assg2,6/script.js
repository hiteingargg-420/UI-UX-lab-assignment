const packagesData = [
  { id: 1, name: "Goa Beach Escape", durationDays: 4, location: "Goa, India", basePrice: 25000, season: "peak" },
  { id: 2, name: "Himalayan Adventure", durationDays: 6, location: "Manali & Shimla", basePrice: 35000, season: "mid" },
  { id: 3, name: "Royal Rajasthan Tour", durationDays: 5, location: "Jaipur, Jodhpur, Udaipur", basePrice: 30000, season: "mid" },
  { id: 4, name: "Kerala Backwaters", durationDays: 3, location: "Alleppey, Munnar", basePrice: 28000, season: "off" },
  { id: 5, name: "Andaman Getaway", durationDays: 5, location: "Port Blair, Havelock", basePrice: 40000, season: "peak" }
];

function seasonMultiplier(season) {
  switch ((season || "").toLowerCase()) {
    case "peak": return 1.25;
    case "mid": return 1.10;
    case "off": return 0.9;
    default: return 1;
  }
}

function computeFinalPriceSample(pkg) {
  let price = pkg.durationDays * pkg.basePrice;
  price *= seasonMultiplier(pkg.season);
  if (pkg.durationDays >= 6) price += 2000;
  return Math.round(price);
}

function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
function formatINR(n) { return "₹" + Number(n).toLocaleString('en-IN'); }

function doPackagesPage() {
  const table = document.getElementById("packagesTable") || document.querySelector("table");
  if (!table) return;

  let tbody = table.querySelector("tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    const existingRows = Array.from(table.querySelectorAll("tr"));
    const firstRow = existingRows[0];
    if (firstRow && table.querySelector("thead") === null) {
      const thead = document.createElement("thead");
      thead.appendChild(firstRow);
      table.insertBefore(thead, table.firstChild);
    }
    table.appendChild(tbody);
  } else {
    tbody.innerHTML = "";
  }

  packagesData.forEach(pkg => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${pkg.name}</td>
      <td>${pkg.durationDays} Days / ${Math.max(0, pkg.durationDays-1)} Nights</td>
      <td>${pkg.location}</td>
      <td>Hotel, Meals, Transfers</td>
      <td>${formatINR(pkg.basePrice)}</td>
      <td>${pkg.season}</td>
      <td>${formatINR(computeFinalPriceSample(pkg))}</td>
    `;
    tbody.appendChild(tr);
  });
}

function doBookingPage() {
  let form = document.querySelector('form');
  if (!form) return;

  const nameInput = form.querySelector('input[name="name"]') || form.querySelector('#name');
  const emailInput = form.querySelector('input[name="email"]') || form.querySelector('#email');
  const startInput = form.querySelector('input[name="start"]') || form.querySelector('input[type="date"][name="start"]') || form.querySelector('input[type="date"]');
  const endInput = form.querySelector('input[name="end"]') || form.querySelector('input[type="date"][name="end"]') || (form.querySelectorAll('input[type="date"]')[1] || null);
  const destinationSelect = form.querySelector('select[name="destination"]');
  const packageRadios = form.querySelectorAll('input[name="package"]');
  const submitBtn = form.querySelector('button[type="submit"], .s') || null;

  if (!startInput || !endInput || !destinationSelect) return;

  const estimatorBlock = document.createElement('div');
  estimatorBlock.className = 'estimator-block';
  estimatorBlock.innerHTML = `
    <div style="margin:14px 0; padding:12px; border-radius:8px; border:1px solid #ddd;">
      <div><strong>Live Estimate:</strong> <span id="jsLiveTotal">—</span></div>
      <div id="jsEstimatorNote" style="color:#666; font-size:0.9em; margin-top:6px;"></div>
      <div style="margin-top:10px;">
        <label style="font-size:0.9em;">Promo code: <input id="jsPromo" type="text" placeholder="EARLYBIRD"></label>
      </div>
    </div>
  `;
  if (submitBtn) form.insertBefore(estimatorBlock, submitBtn);
  else form.appendChild(estimatorBlock);

  const liveTotalEl = document.getElementById('jsLiveTotal');
  const noteEl = document.getElementById('jsEstimatorNote');
  const promoEl = document.getElementById('jsPromo');

  function parseDateLocal(v) {
    if (!v) return null;
    const d = new Date(v + "T00:00:00");
    return isNaN(d) ? null : d;
  }

  function nightsBetween(a, b) {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((b - a) / msPerDay);
  }

  function getSelectedPackageMultiplier() {
    const sel = Array.from(packageRadios).find(r => r.checked);
    if (!sel) return 1;
    return sel.value === "luxury" ? 1.4 : 1.0;
  }

  function computeBookingEstimate() {
    noteEl.textContent = "";

    const destVal = destinationSelect.value;
    let pkg = packagesData.find(p => destVal.toLowerCase().includes(p.location.split(',')[0].trim().toLowerCase()) || destVal.toLowerCase().includes(p.name.split(' ')[0].toLowerCase()));
    if (!pkg) pkg = packagesData[0];

    const inDate = parseDateLocal(startInput.value);
    const outDate = parseDateLocal(endInput.value);
    if (!inDate || !outDate) {
      liveTotalEl.textContent = "—";
      noteEl.textContent = "Select valid dates.";
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    const nights = nightsBetween(inDate, outDate);
    if (nights <= 0) {
      liveTotalEl.textContent = "—";
      noteEl.textContent = "Check-out must be after check-in.";
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    const pricePerNight = Math.round(pkg.basePrice / Math.max(1, pkg.durationDays));
    let total = pricePerNight * nights;
    total = Math.round(total * seasonMultiplier(pkg.season));

    const guestsInput = form.querySelector('input[name="guests"]');
    const guestsNum = guestsInput ? Math.max(1, Number(guestsInput.value) || 1) : 1;
    if (guestsNum > 2) total = Math.round(total * 1.2);

    total = Math.round(total * getSelectedPackageMultiplier());

    const promo = (promoEl.value || "").trim().toUpperCase();
    switch (promo) {
      case "EARLYBIRD":
        total = Math.round(total * 0.9);
        noteEl.textContent = "EARLYBIRD applied: 10% off";
        break;
      case "FESTIVE":
        total = Math.round(total * 0.85);
        noteEl.textContent = "FESTIVE applied: 15% off";
        break;
      default:
        if (promo !== "") noteEl.textContent = "Invalid promo code.";
    }

    liveTotalEl.textContent = formatINR(total);
    if (submitBtn) submitBtn.disabled = false;
  }

  [startInput, endInput, destinationSelect].forEach(el => {
    if (!el) return;
    el.addEventListener('change', computeBookingEstimate);
    el.addEventListener('input', computeBookingEstimate);
  });
  if (promoEl) promoEl.addEventListener('input', computeBookingEstimate);
  packageRadios.forEach(r => r.addEventListener('change', computeBookingEstimate));

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    computeBookingEstimate();
    if (submitBtn && submitBtn.disabled) {
      alert("Please fix errors.");
      return;
    }
    alert("Booking submitted.");
    form.reset();
    liveTotalEl.textContent = "—";
  });

  computeBookingEstimate();
}

function doGalleryPage() {
  const figures = $all('figure img');
  if (!figures.length) return;

  figures.forEach(img => {
    if (!img.classList.contains('thumb')) img.classList.add('thumb');
    if (!img.dataset.large) img.dataset.large = img.src;
  });

  if (!document.getElementById('jsGalleryModal')) {
    const modal = document.createElement('div');
    modal.id = 'jsGalleryModal';
    modal.className = 'js-modal';
    modal.innerHTML = `
      <div class="js-modal-inner" role="dialog" aria-modal="true">
        <button class="js-modal-close" aria-label="Close">&times;</button>
        <img class="js-modal-img" src="" alt="">
        <div class="js-modal-caption"></div>
      </div>
    `;
    document.body.appendChild(modal);

    const style = document.createElement('style');
    style.innerHTML = `
      .js-modal { position:fixed; inset:0; display:none; align-items:center; justify-content:center; background:rgba(0,0,0,0.6); z-index:9999; padding:20px; }
      .js-modal.open { display:flex; }
      .js-modal-inner { max-width:90%; max-height:90%; background: #fff; border-radius:8px; padding:12px; position:relative; text-align:center; }
      .js-modal-img { max-width:100%; max-height:70vh; display:block; margin:0 auto 8px; }
      .js-modal-caption { font-size:14px; color:#333; }
      .js-modal-close { position:absolute; right:10px; top:6px; border:none; background:transparent; font-size:28px; cursor:pointer; }
    `;
    document.head.appendChild(style);
  }

  const modal = document.getElementById('jsGalleryModal');
  const modalImg = modal.querySelector('.js-modal-img');
  const modalCaption = modal.querySelector('.js-modal-caption');
  const modalClose = modal.querySelector('.js-modal-close');

  $all('.thumb').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      modalImg.src = img.dataset.large || img.src;
      modalImg.alt = img.alt || img.title || '';
      modalCaption.textContent = img.title || img.alt || '';
      modal.classList.add('open');
      document.body.style.overflow = "hidden";
    });
  });

  modalClose.addEventListener('click', () => {
    modal.classList.remove('open');
    document.body.style.overflow = "";
  });

  modal.addEventListener('click', (ev) => {
    if (ev.target === modal) { modal.classList.remove('open'); document.body.style.overflow = ""; }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      modal.classList.remove('open');
      document.body.style.overflow = "";
    }
  });
}

function doNavHighlight() {
  const navLinks = $all('nav a');
  if (!navLinks.length) return;

  const path = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(a => {
    const hrefPart = a.getAttribute('href').split('/').pop();
    if (hrefPart === path) a.classList.add('active-nav');
    else a.classList.remove('active-nav');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  try { doPackagesPage(); } catch (e) {}
  try { doBookingPage(); } catch (e) {}
  try { doGalleryPage(); } catch (e) {}
  try { doNavHighlight(); } catch (e) {}
});
