let particlesEnabled = true;

async function checkAdBlock() {
  let isBlocked = false;

  const baitContainer = document.createElement('div');
  baitContainer.className = 'adsbygoogle ad-zone ad-space header-ad ad-placement sponsor-post textads banner-ads google-auto-placed';
  baitContainer.id = 'ad-container-test';
  
  baitContainer.style.cssText = `
    position: absolute !important;
    top: -9999px !important;
    left: -9999px !important;
    width: 300px !important;
    height: 250px !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  `;

  const baitInner = document.createElement('ins');
  baitInner.className = 'adsbygoogle';
  baitInner.style.cssText = 'display:block !important; width:300px !important; height:250px !important;';
  baitContainer.appendChild(baitInner);

  document.body.appendChild(baitContainer);

  await new Promise((resolve) => setTimeout(resolve, 150));

  const computedStyle = window.getComputedStyle(baitContainer);

  if (
    computedStyle.display === 'none' ||
    computedStyle.visibility === 'hidden' ||
    computedStyle.opacity === '0' ||
    baitContainer.offsetHeight === 0
  ) {
    isBlocked = true;
  }

  baitContainer.remove();

  if (isBlocked) {
    showAdBlockModal();
  } else {
    hideAdBlockModal();
  }
}

function showAdBlockModal() {
  const overlay = document.getElementById('adblock-overlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function hideAdBlockModal() {
  const overlay = document.getElementById('adblock-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function updateAdBlockUI() {
  const data = getI18nData();
  if (!data || !data.adblock) return;

  const titleEl = document.getElementById('adblock-title');
  const descEl = document.getElementById('adblock-desc');
  const btnEl = document.getElementById('adblock-btn');

  if (titleEl) titleEl.textContent = data.adblock.title;
  if (descEl) descEl.textContent = data.adblock.desc;
  if (btnEl) btnEl.textContent = data.adblock.button;
}

function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = Array.from({ length: 40 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    radius: Math.random() * 2 + 1
  }));

  function animate() {
    ctx.clearRect(0, 0, width, height);

    if (particlesEnabled) {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
    }

    requestAnimationFrame(animate);
  }

  animate();

  const toggleBtn = document.getElementById('particles-toggle');
  toggleBtn?.addEventListener('click', () => {
    particlesEnabled = !particlesEnabled;
    toggleBtn.style.opacity = particlesEnabled ? '1' : '0.4';
  });
}

function initLiveSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const sections = document.querySelectorAll('.hack-section[data-index]');

    sections.forEach((section) => {
      const title = section.querySelector('.section-title')?.textContent.toLowerCase() || '';
      const desc = section.querySelector('.section-desc')?.textContent.toLowerCase() || '';
      const fullContent = section.innerText.toLowerCase();

      if (query === '' || title.includes(query) || desc.includes(query) || fullContent.includes(query)) {
        section.style.display = 'block';
      } else {
        section.style.display = 'none';
      }
    });
  });
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function renderScripts() {
  const container = document.getElementById('scripts-container');
  if (!container) return;

  const data = getI18nData();
  if (!data || !data.scripts) return;

  container.innerHTML = data.scripts.map((script) => `
    <div class="script-card">
      <div class="script-card-header">
        <span class="script-card-title">${script.title}</span>
        <button class="copy-script-btn" onclick="copyScriptCode(this, \`${script.code}\`)">${data.siteConfig.copyText}</button>
      </div>
      <div class="script-code-block">${script.code}</div>
    </div>
  `).join('');
}

function renderFAQs() {
  const container = document.getElementById('faq-accordion');
  if (!container) return;

  const data = getI18nData();
  if (!data || !data.faqs) return;

  container.innerHTML = data.faqs.map((faq) => `
    <div class="faq-item">
      <button class="faq-question">
        <span>${faq.question}</span>
        <span class="faq-icon">▼</span>
      </button>
      <div class="faq-answer">${faq.answer}</div>
    </div>
  `).join('');

  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      item.classList.toggle('active');
    });
  });
}

function initScrollProgress() {
  const progressBar = document.getElementById("scroll-progress");
  if (!progressBar) return;

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = `${progress}%`;
  }, { passive: true });
}

function initImageLightbox() {
  return;
}

function initThemeSwitcher() {
  const themeBtn = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");

  const savedTheme = localStorage.getItem("app_theme") || "dark";
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    if (themeIcon) themeIcon.textContent = "☀️";
  }

  if (!themeBtn) return;

  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    localStorage.setItem("app_theme", isLight ? "light" : "dark");
    if (themeIcon) themeIcon.textContent = isLight ? "☀️" : "🌙";
  });
}

function initContentProtection() {
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 'a' || e.key === 'x' || e.key === 's')) || e.key === 'F12') {
      e.preventDefault();
    }
  });
  document.addEventListener('dragstart', (e) => e.preventDefault());
}

function initMouseGlow() {
  const glow = document.getElementById('mouse-glow');
  if (!glow) return;

  let mouseX = 0, mouseY = 0;
  let isTicking = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isTicking) {
      requestAnimationFrame(() => {
        glow.style.transform = `translate3d(${mouseX - 250}px, ${mouseY - 250}px, 0)`;
        glow.style.opacity = '1';
        isTicking = false;
      });
      isTicking = true;
    }
  });

  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
}

function initInteractiveButtons() {
  const buttons = document.querySelectorAll('.modern-download-btn');

  buttons.forEach((btn) => {
    let ticking = false;

    btn.addEventListener('mousemove', (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const moveX = (x - centerX) * 0.15;
          const moveY = (y - centerY) * 0.15;
          const rotateX = (centerY - y) * 0.08;
          const rotateY = (x - centerX) * 0.08;

          btn.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
          ticking = false;
        });
        ticking = true;
      }
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate3d(0px, 0px, 0) rotateX(0deg) rotateY(0deg)`;
    });
  });
}

function renderSections() {
  const container = document.getElementById("sections-container");
  if (!container) return;

  const data = getI18nData();
  if (!data || !data.sections) return;

  container.innerHTML = data.sections.map(
    (section, index) => `
    <section class="hack-section" id="${section.id}" data-index="${index}">
      <div class="section-header reveal">
        <div class="section-icon">${section.icon}</div>
        <div class="section-info">
          <h2 class="section-title">${section.title}</h2>
          <p class="section-desc">${section.description}</p>
          <div class="status-badge">
            <span class="status-dot"></span>
            <span>${data.siteConfig.statusWorking} [${section.version}]</span>
          </div>
        </div>
      </div>

      <div class="program-showcase-flow">
        ${section.features.map((feat) => `
          <div class="showcase-row reveal">
            <div class="program-media">
              <img src="${feat.image}" alt="${feat.title}" class="program-img" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='https://placehold.co/600x400/0a1020/3b82f6?text=${feat.badge}';" />
            </div>
            <div class="program-feature-info">
              <span class="feat-badge">${feat.badge}</span>
              <h3 class="feat-title">${feat.title}</h3>
              <p class="feat-desc">${feat.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="download-action-wrapper reveal">
        ${section.downloads.map(dl => `
            <a href="${dl.link}" class="modern-download-btn" onclick="handleDownloadClick(event, '${dl.link}')">
            <div class="btn-content">
              <svg class="download-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              <span class="btn-text">${dl.label}</span>
              <span class="btn-subtext">${dl.subtext}</span>
            </div>
          </a>
        `).join('')}
      </div>
    </section>
  `
  ).join("");
}

function renderNav() {
  const nav = document.getElementById("section-nav");
  if (!nav) return;

  const data = getI18nData();
  if (!data || !data.sections) return;

  nav.innerHTML = data.sections.map(
    (section) => `
    <a href="#${section.id}" class="nav-link" data-section="${section.id}">
      <span class="nav-icon">${section.icon}</span>
      <span class="nav-text">${section.title}</span>
    </a>
  `
  ).join("");
}

function applyLanguageUI() {
  const data = getI18nData();
  if (!data) return;

  const html = document.documentElement;

  if (currentLang === 'ar') {
    html.setAttribute('lang', 'ar');
    html.setAttribute('dir', 'rtl');
    const langText = document.getElementById("lang-text");
    if (langText) langText.textContent = "English";
  } else {
    html.setAttribute('lang', 'en');
    html.setAttribute('dir', 'ltr');
    const langText = document.getElementById("lang-text");
    if (langText) langText.textContent = "العربية";
  }

  const setElemText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setElemText("site-name", data.siteConfig.siteName);
  setElemText("site-name-hero", data.siteConfig.siteName);
  setElemText("hero-tagline", data.siteConfig.tagline);
  setElemText("hero-btn", data.siteConfig.heroButton);
  setElemText("hero-badge", data.siteConfig.heroBadge);
  setElemText("stat-label", data.siteConfig.statLabel);
  setElemText("footer-text", data.siteConfig.footerText);
  setElemText("script-hub-title", data.siteConfig.scriptHubTitle);
  setElemText("script-hub-desc", data.siteConfig.scriptHubDesc);
  setElemText("faq-title", data.siteConfig.faqTitle);
  setElemText("faq-desc", data.siteConfig.faqDesc);

  const secCount = document.getElementById("sections-count");
  if (secCount) secCount.dataset.target = data.sections.length;

  const firstSection = data.sections[0]?.id || "";
  const heroBtn = document.getElementById("hero-btn");
  if (heroBtn && firstSection) heroBtn.href = `#${firstSection}`;

  updateAdBlockUI();
  renderNav();
  renderSections();
  renderScripts();
  renderFAQs();
  initScrollReveal();
  initNavHighlight();
  initInteractiveButtons();
  initSmoothScroll();
}

function initLanguageSwitcher() {
  const toggleBtn = document.getElementById("lang-toggle");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    localStorage.setItem('app_lang', currentLang);
    applyLanguageUI();
  });
}

let revealObserver = null;

function initScrollReveal() {
  if (revealObserver) revealObserver.disconnect();

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.05 });

  document.querySelectorAll(".reveal").forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom >= 0) el.classList.add("visible");
    revealObserver.observe(el);
  });
}

let navObserver = null;

function initNavHighlight() {
  if (navObserver) navObserver.disconnect();

  const sections = document.querySelectorAll(".hack-section");
  const navLinks = document.querySelectorAll(".nav-link");

  navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => link.classList.remove("active"));
        const active = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
        if (active) active.classList.add("active");
      }
    });
  }, { threshold: 0.2, rootMargin: "-10% 0px -50% 0px" });

  sections.forEach((section) => navObserver.observe(section));
}

function initMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  if (!toggle || !sidebar) return;

  const closeSidebar = () => {
    sidebar.classList.remove("open");
    overlay?.classList.remove("visible");
    toggle.classList.remove("active");
  };

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay?.classList.toggle("visible");
    toggle.classList.toggle("active");
  });

  overlay?.addEventListener("click", closeSidebar);
  document.addEventListener("click", (e) => {
    if (e.target.closest(".nav-link")) closeSidebar();
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.onclick = (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    };
  });
}

function initCounterAnimation() {
  const stats = document.querySelectorAll(".stat-number");
  stats.forEach((stat) => {
    const target = parseInt(stat.dataset.target, 10);
    if (isNaN(target)) return;
    
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const duration = 1000;
        const start = performance.now();
        function update(now) {
          const progress = Math.min((now - start) / duration, 1);
          stat.textContent = Math.round(progress * target);
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(stat);
  });
}

function handleDownloadClick(event, url) {
  event.preventDefault();
  
  const overlay = document.getElementById('redirect-overlay');
  const titleEl = document.getElementById('redirect-title');
  const descEl = document.getElementById('redirect-desc');
  const isAr = currentLang === 'ar';

  if (titleEl && descEl) {
    titleEl.textContent = isAr ? 'جاري التوجيه إلى رابط التحميل...' : 'Redirecting to Download Link...';
    descEl.textContent = isAr ? 'يرجى الانتظار جاري فتح الرابط الآن...' : 'Please wait opening the link now...';
  }

  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  setTimeout(() => {
    window.open(url, '_blank');

    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }, 2000);
}

document.addEventListener("DOMContentLoaded", () => {
  applyLanguageUI();
  initLanguageSwitcher();
  initThemeSwitcher();
  initMobileMenu();
  initCounterAnimation();
  initContentProtection(); 
  initMouseGlow();
  initScrollProgress();
  initImageLightbox();
  initParticleCanvas();
  initLiveSearch();
  initBackToTop();
  checkAdBlock();
});