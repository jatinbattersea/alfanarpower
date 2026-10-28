/* alfanar Power — homepage interactions (UI only) */
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Sticky header + back-to-top progress ---------- */
  const header = $('#header');
  const toTop = $('#toTop');
  const RING = 138.2;

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-sticky', y > 60);
    toTop.classList.toggle('is-visible', y > 600);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    toTop.style.setProperty('--off', RING - (RING * y) / (max || 1));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Mobile off-canvas ---------- */
  const offcanvas = $('#offcanvas');
  const menuToggle = $('#menuToggle');
  function setMenu(open) {
    offcanvas.classList.toggle('is-open', open);
    offcanvas.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuToggle.addEventListener('click', () => setMenu(true));
  $('#menuClose').addEventListener('click', () => setMenu(false));
  offcanvas.addEventListener('click', (e) => {
    if (e.target === offcanvas || e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Full-page search overlay ---------- */
  const searchOverlay = $('#searchOverlay');
  const searchToggle = $('#searchToggle');
  const searchInput = $('#searchInput');

  function setSearch(open) {
    searchOverlay.classList.toggle('is-open', open);
    searchOverlay.setAttribute('aria-hidden', String(!open));
    searchToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) setTimeout(() => searchInput.focus(), 150);
    else searchToggle.focus();
  }
  searchToggle.addEventListener('click', (e) => { e.stopPropagation(); setSearch(true); });
  $('#searchClose').addEventListener('click', () => setSearch(false));
  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay || e.target.closest('.search-overlay__popular a')) setSearch(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay.classList.contains('is-open')) setSearch(false);
  });

  /* ---------- Desktop dropdown + mega menu (click to open) ---------- */
  const menus = $$('[data-menu]');
  const backdrop = $('#navBackdrop');

  function closeMenus() {
    menus.forEach((m) => {
      m.classList.remove('is-open');
      $('.nav__toggle', m).setAttribute('aria-expanded', 'false');
    });
    backdrop.classList.remove('is-visible');
  }
  menus.forEach((menu) => {
    const toggle = $('.nav__toggle', menu);
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !menu.classList.contains('is-open');
      closeMenus();
      if (!willOpen) return;
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      if (menu.classList.contains('has-mega')) backdrop.classList.add('is-visible');
    });
    $$('a', menu).forEach((a) => a.addEventListener('click', closeMenus));
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('[data-menu]')) closeMenus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenus(); });

  // Mega menu: preview follows the hovered/focused service
  const megaImg = $('#megaImg');
  const megaTag = $('#megaTag');
  const megaTitle = $('#megaTitle');
  const megaText = $('#megaText');
  const megaLinks = $$('.mega__link');
  function preview(link) {
    if (link.classList.contains('is-current')) return;
    megaLinks.forEach((l) => l.classList.toggle('is-current', l === link));
    megaImg.classList.add('is-swapping');
    setTimeout(() => {
      megaImg.src = link.dataset.img;
      megaImg.classList.remove('is-swapping');
    }, 200);
    megaTag.textContent = link.dataset.tag;
    megaTitle.textContent = $('strong', link).textContent;
    megaText.textContent = link.dataset.text;
  }
  megaLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => preview(link));
    link.addEventListener('focus', () => preview(link));
  });

  /* ---------- Mobile sub-menus ---------- */
  $$('.offcanvas__toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const open = !item.classList.contains('is-open');
      $$('.offcanvas__sub').forEach((s) => {
        s.classList.remove('is-open');
        $('.offcanvas__toggle', s).setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- Hero slider ---------- */
  const slides = $$('.hero__slide');
  const ring = $('#heroRing');
  const nextImg = $('#heroNextImg');
  const nextTitle = $('#heroNextTitle');
  const nextNo = $('#heroNextNo');
  const DELAY = 6500;
  let index = 0;
  let timer;

  function updatePreview() {
    const n = (index + 1) % slides.length;
    const next = slides[n];
    nextImg.classList.add('is-swapping');
    setTimeout(() => {
      nextImg.src = next.dataset.thumb;
      nextImg.classList.remove('is-swapping');
    }, 250);
    nextTitle.textContent = next.dataset.title;
    nextNo.textContent = String(n + 1).padStart(2, '0');
    ring.classList.remove('is-running');
    void ring.getBoundingClientRect(); // restart progress animation
    ring.classList.add('is-running');
  }
  function goTo(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
    updatePreview();
    restart();
  }
  function restart() {
    clearTimeout(timer);
    timer = setTimeout(() => goTo(index + 1), DELAY);
  }
  $('#heroNext').addEventListener('click', () => goTo(index + 1));
  ring.classList.add('is-running');
  restart();

  /* ---------- Project filter ---------- */
  const filterBtns = $$('#filters button');
  const projects = $$('#projectGrid .project');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      const f = btn.dataset.filter;
      projects.forEach((p) => p.classList.toggle('is-hidden', f !== 'all' && p.dataset.cat !== f));
    });
  });

  /* ---------- Accordion ---------- */
  $$('.acc-item__head').forEach((head) => {
    head.addEventListener('click', () => {
      const item = head.parentElement;
      const open = item.classList.contains('is-open');
      $$('.acc-item').forEach((i) => i.classList.remove('is-open'));
      if (!open) item.classList.add('is-open');
    });
  });

  /* ---------- Counters ---------- */
  function countUp(el) {
    const to = parseFloat(el.dataset.to);
    const dec = parseInt(el.dataset.dec || '0', 10);
    const dur = 1800;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = to * eased;
      el.textContent = dec ? val.toFixed(dec) : Math.round(val).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Reveal on scroll ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        $$('.count', entry.target).forEach(countUp);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal, [data-line]').forEach((el) => io.observe(el));
  } else {
    $$('.reveal, [data-line]').forEach((el) => el.classList.add('is-in'));
    $$('.count').forEach(countUp);
  }

  $('#year').textContent = new Date().getFullYear();
})();
