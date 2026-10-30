/**
 * PORTFÓLIO — VINÍCIUS GABRIEL BRAZÃO
 * JavaScript puro, sem frameworks.
 *
 * 1. Partículas de fundo (rede tecnológica)
 * 2. Navegação suave + indicador de seção ativa
 * 3. Menu mobile responsivo
 * 4. Scroll reveal (Intersection Observer)
 * 5. Header dinâmico (glassmorphism on scroll)
 * 6. Formulário de contato com validação e cópia para clipboard
 * 7. Carregamento dinâmico de projetos do GitHub
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initNavigation();
  initMobileMenu();
  initScrollReveal();
  initHeaderScroll();
  initContactForm();
  loadGitHubProjects();
});

/* ==========================================================================
   1. PARTÍCULAS DE FUNDO — REDE TECNOLÓGICA
   ========================================================================== */
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  const particles = [];
  const maxConnectionDist = 120;
  let mouse = { x: -1000, y: -1000 };
  let animId;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    buildParticles();
  }

  function buildParticles() {
    particles.length = 0;
    // Fewer particles on mobile for performance
    const isMobile = W < 768;
    const count = isMobile ? 30 : Math.floor(Math.max(40, Math.min(80, (W * H) / 18000)));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxConnectionDist) {
          const opacity = (1 - dist / maxConnectionDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      // Mouse interaction
      const mdx = p.x - mouse.x;
      const mdy = p.y - mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 150) {
        const force = (150 - mdist) / 150 * 0.02;
        p.vx += mdx * force * 0.1;
        p.vy += mdy * force * 0.1;
      }

      // Dampen velocity
      p.vx *= 0.99;
      p.vy *= 0.99;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59, 130, 246, ${p.alpha})`;
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  // Throttle mouse events
  let mouseThrottle = false;
  document.addEventListener('mousemove', (e) => {
    if (mouseThrottle) return;
    mouseThrottle = true;
    requestAnimationFrame(() => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouseThrottle = false;
    });
  });

  document.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Handle resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 200);
  });

  resize();
  draw();
}

/* ==========================================================================
   2. NAVEGAÇÃO SUAVE + SEÇÃO ATIVA
   ========================================================================== */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link, .footer-nav a');
  const sections = document.querySelectorAll('.section');
  const header = document.getElementById('siteHeader');
  const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;

  // Smooth scroll for all internal links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const offsetTop = target.offsetTop - headerHeight;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });

      // Close mobile menu if open
      closeMobileMenu();
    });
  });

  // Active section tracking with Intersection Observer
  const observerOptions = {
    root: null,
    rootMargin: `-${headerHeight + 40}px 0px -40% 0px`,
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        updateActiveNav(sectionId);
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));

  function updateActiveNav(sectionId) {
    navLinks.forEach(link => {
      const linkSection = link.getAttribute('data-section') || link.getAttribute('href')?.replace('#', '');
      if (linkSection === sectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

/* ==========================================================================
   3. MENU MOBILE
   ========================================================================== */
let isMobileMenuOpen = false;

function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileNavDrawer');

  if (!menuBtn || !drawer) return;

  menuBtn.addEventListener('click', () => {
    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobileMenuOpen) {
      closeMobileMenu();
    }
  });
}

function openMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileNavDrawer');
  if (!menuBtn || !drawer) return;

  isMobileMenuOpen = true;
  menuBtn.classList.add('open');
  menuBtn.setAttribute('aria-expanded', 'true');
  menuBtn.setAttribute('aria-label', 'Fechar menu');
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileNavDrawer');
  if (!menuBtn || !drawer) return;

  isMobileMenuOpen = false;
  menuBtn.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.setAttribute('aria-label', 'Abrir menu');
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ==========================================================================
   4. SCROLL REVEAL — Intersection Observer
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-up');

  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   5. HEADER DINÂMICO
   ========================================================================== */
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  let lastScroll = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }

        lastScroll = scrollY;
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ==========================================================================
   6. FORMULÁRIO DE CONTATO
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');
  const newMsgBtn = document.getElementById('newMessageBtn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate
    const name = form.querySelector('#contactName');
    const email = form.querySelector('#contactEmail');
    const subject = form.querySelector('#contactSubject');
    const message = form.querySelector('#contactMessage');

    let isValid = true;

    isValid = validateField(name, 'nameError', 'Por favor, informe seu nome.', v => v.trim().length >= 2) && isValid;
    isValid = validateField(email, 'emailError', 'Informe um e-mail válido.', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) && isValid;
    isValid = validateField(subject, 'subjectError', 'Informe o assunto da mensagem.', v => v.trim().length >= 2) && isValid;
    isValid = validateField(message, 'messageError', 'Escreva sua mensagem (mínimo 10 caracteres).', v => v.trim().length >= 10) && isValid;

    if (!isValid) return;

    // Build message text
    const msgText = `Nome: ${name.value.trim()}\nE-mail: ${email.value.trim()}\nAssunto: ${subject.value.trim()}\n\nMensagem:\n${message.value.trim()}`;

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(msgText);
    } catch (err) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = msgText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    // Show feedback
    form.style.display = 'none';
    if (feedback) {
      feedback.style.display = 'block';
    }
  });

  // Reset form
  if (newMsgBtn) {
    newMsgBtn.addEventListener('click', () => {
      form.reset();
      form.style.display = 'flex';
      if (feedback) feedback.style.display = 'none';

      // Clear errors
      form.querySelectorAll('.form-input, .form-textarea').forEach(input => {
        input.classList.remove('error');
      });
      form.querySelectorAll('.field-error').forEach(el => {
        el.textContent = '';
      });
    });
  }

  // Real-time validation
  form.querySelectorAll('.form-input, .form-textarea').forEach(input => {
    input.addEventListener('blur', () => {
      if (input.value.trim()) {
        const errorId = input.id.replace('contact', '').toLowerCase() + 'Error';
        const errorEl = document.getElementById(errorId);
        if (errorEl && errorEl.textContent) {
          // Re-validate on blur
          input.classList.remove('error');
          errorEl.textContent = '';
        }
      }
    });
  });
}

function validateField(input, errorId, errorMsg, validatorFn) {
  const errorEl = document.getElementById(errorId);
  if (!input || !errorEl) return true;

  if (!validatorFn(input.value)) {
    input.classList.add('error');
    errorEl.textContent = errorMsg;
    return false;
  } else {
    input.classList.remove('error');
    errorEl.textContent = '';
    return true;
  }
}

/* ==========================================================================
   7. CARREGAMENTO DINÂMICO DE PROJETOS DO GITHUB
   ========================================================================== */
async function loadGitHubProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  const githubUsername = '37891-jpg';

  try {
    // Try fetching repos from GitHub API
    const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=6&type=public`);

    if (!response.ok) throw new Error('GitHub API returned error');

    const repos = await response.json();

    if (!repos.length) throw new Error('No repos found');

    // Render project cards
    grid.innerHTML = repos.map(repo => createProjectCard(repo)).join('');

  } catch (error) {
    // If we can't load from GitHub, show a subtle message
    grid.innerHTML = `
      <div class="project-card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
        <p style="color: var(--color-text-muted); font-size: 14px;">
          Os projetos serão carregados diretamente do GitHub quando o perfil estiver disponível.
          <br>Enquanto isso, acesse o link acima para conferir meus repositórios.
        </p>
      </div>
    `;
  }
}

function createProjectCard(repo) {
  const languageColors = {
    'JavaScript': '#f7df1e',
    'TypeScript': '#3178c6',
    'HTML': '#e34c26',
    'CSS': '#1572B6',
    'Java': '#b07219',
    'Python': '#3572A5',
    'C': '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Shell': '#89e051',
  };

  const techs = [];
  if (repo.language) techs.push(repo.language);
  if (repo.topics && repo.topics.length) {
    repo.topics.slice(0, 3).forEach(t => techs.push(t));
  }

  return `
    <article class="project-card">
      <div class="project-card-header">
        <div class="project-card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 3h7l2 2h9v14H3V3z"/>
          </svg>
        </div>
        <div class="project-card-links">
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" title="Ver no GitHub" aria-label="Repositório ${repo.name} no GitHub">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
          ${repo.homepage ? `
          <a href="${repo.homepage}" target="_blank" rel="noopener noreferrer" title="Ver projeto online" aria-label="Versão online de ${repo.name}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3"/></svg>
          </a>` : ''}
        </div>
      </div>
      <h3 class="project-card-title">${escapeHTML(repo.name)}</h3>
      <p class="project-card-desc">${escapeHTML(repo.description || 'Projeto sem descrição disponível.')}</p>
      ${techs.length ? `
      <div class="project-card-techs">
        ${techs.map(t => `<span class="tech-tag">${escapeHTML(t)}</span>`).join('')}
      </div>` : ''}
    </article>
  `;
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
