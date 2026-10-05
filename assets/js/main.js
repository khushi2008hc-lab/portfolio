/**
 * Main Interactive Controller
 * Handles 3D tilt, audio synthesis, typing effects, modals, filters, and theme switching
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Audio Synthesizer (Zero-latency Web Audio API)
  // --------------------------------------------------------------------------
  let sfxEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  window.playUiSound = function (type) {
    if (!sfxEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      // Audio fallback silent
    }
  };

  const sfxToggleBtn = document.getElementById('sfx-toggle');
  const sfxIcon = document.getElementById('sfx-icon');
  if (sfxToggleBtn && sfxIcon) {
    sfxToggleBtn.addEventListener('click', () => {
      sfxEnabled = !sfxEnabled;
      sfxIcon.className = sfxEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
      if (sfxEnabled) window.playUiSound('click');
    });
  }

  // --------------------------------------------------------------------------
  // 2. Typing Animation
  // --------------------------------------------------------------------------
  const typingElement = document.getElementById('typing-text');
  const phrases = [
    'Full Stack Developer',
    'Software Engineer',
    'SQL & Database Architect',
    'Creative Technologist'
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeText() {
    if (!typingElement) return;

    const currentPhrase = phrases[phraseIndex];
    if (isDeleting) {
      typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
    }

    let speed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentPhrase.length) {
      speed = 2200; // Pause at end of phrase
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      speed = 500;
    }

    setTimeout(typeText, speed);
  }
  typeText();

  // --------------------------------------------------------------------------
  // 3. Custom Cursor Glow
  // --------------------------------------------------------------------------
  const cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = `${e.clientX}px`;
      cursorGlow.style.top = `${e.clientY}px`;
    }, { passive: true });
  }

  // --------------------------------------------------------------------------
  // 4. Navbar Scroll State & Mobile Menu
  // --------------------------------------------------------------------------
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }, { passive: true });

  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      window.playUiSound('click');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 5. Theme Palette Switcher
  // --------------------------------------------------------------------------
  const paletteDots = document.querySelectorAll('.palette-dot');
  const savedTheme = localStorage.getItem('khushi_portfolio_theme') || 'cyan';
  setTheme(savedTheme);

  paletteDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const theme = dot.getAttribute('data-color');
      setTheme(theme);
      window.playUiSound('click');
    });
  });

  function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('khushi_portfolio_theme', theme);
    paletteDots.forEach(dot => {
      dot.classList.toggle('active', dot.getAttribute('data-color') === theme);
    });
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  // --------------------------------------------------------------------------
  // 6. Interactive 3D Card Tilt with Perspective
  // --------------------------------------------------------------------------
  const tiltCards = document.querySelectorAll('.tilt-card, .card-3d');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  });

  // Hero Card specific mouse parallax
  const heroCard = document.getElementById('hero-3d-card');
  if (heroCard) {
    window.addEventListener('mousemove', (e) => {
      const xPercent = (e.clientX / window.innerWidth - 0.5) * 20;
      const yPercent = (e.clientY / window.innerHeight - 0.5) * -20;
      heroCard.style.transform = `rotateY(${xPercent}deg) rotateX(${yPercent}deg)`;
    }, { passive: true });
  }

  // --------------------------------------------------------------------------
  // 7. Stats Counter Animation
  // --------------------------------------------------------------------------
  const statsElements = document.querySelectorAll('.stat-number');
  let animatedStats = false;

  function checkStatsScroll() {
    if (animatedStats || statsElements.length === 0) return;
    const firstStat = statsElements[0];
    const rect = firstStat.getBoundingClientRect();

    if (rect.top <= window.innerHeight * 0.9) {
      animatedStats = true;
      statsElements.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'), 10);
        let current = 0;
        const duration = 1500;
        const stepTime = 30;
        const increment = Math.ceil(target / (duration / stepTime));

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            stat.textContent = target;
            clearInterval(timer);
          } else {
            stat.textContent = current;
          }
        }, stepTime);
      });
    }
  }
  window.addEventListener('scroll', checkStatsScroll, { passive: true });
  checkStatsScroll();

  // --------------------------------------------------------------------------
  // 8. Skill Category Filter Tabs
  // --------------------------------------------------------------------------
  const skillTabs = document.querySelectorAll('.filter-tab');
  const skillCards = document.querySelectorAll('.skill-card');

  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      window.playUiSound('click');

      const category = tab.getAttribute('data-category');
      skillCards.forEach(card => {
        const cardCats = card.getAttribute('data-category') || '';
        if (category === 'all' || cardCats.includes(category)) {
          card.style.display = 'flex';
          card.style.animation = 'modalPop 0.3s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // 9. Interactive Project Details Modal
  // --------------------------------------------------------------------------
  const projectModal = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close');
  const modalContent = document.getElementById('modal-content');

  const projectDetails = {
    cloudsphere: {
      title: 'CloudSphere — Real-Time SQL Analytics Engine',
      category: 'Database & Distributed Telemetry',
      image: 'assets/images/cloudsphere.jpg',
      overview: 'CloudSphere is an enterprise-grade database observatory designed to capture, profile, and optimize SQL performance in real-time. It monitors connection pools, indexing efficacy, slow-query thresholds, and throughput latencies.',
      highlights: [
        'Integrated MySQL 8.4 telemetry probe extracting performance_schema metrics.',
        'Interactive latency visualization using Chart.js with dynamic sampling buffers.',
        'Automated query index advisor suggesting missing composite keys.',
        'High-concurrency Node.js REST API with zero-buffer streaming response.'
      ],
      tech: ['MySQL 8.4', 'Node.js', 'Express', 'Chart.js', 'CSS3 Modern Grid'],
      github: 'https://github.com/khushi2008hc-lab'
    },
    devconnect: {
      title: 'DevConnect — Real-Time Developer Collaboration Hub',
      category: 'Full-Stack Distributed System',
      image: 'assets/images/devconnect.jpg',
      overview: 'DevConnect is an all-in-one virtual engineering room providing real-time synchronized code drafting, threaded architecture discussions, instant PR feedback pipelines, and developer telemetry.',
      highlights: [
        'Bi-directional WebSocket engine for sub-millisecond document sync.',
        'PostgreSQL schema with transactional integrity and partitioned user rooms.',
        'FastAPI Python backend with high-speed async workers and rate limiting.',
        'Automated deployment pipelines configured for Vercel and cloud containers.'
      ],
      tech: ['Python', 'FastAPI', 'PostgreSQL', 'WebSockets', 'Vercel'],
      github: 'https://github.com/khushi2008hc-lab'
    }
  };

  document.querySelectorAll('.view-details-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const projKey = btn.getAttribute('data-project');
      const data = projectDetails[projKey];
      if (!data) return;

      modalContent.innerHTML = `
        <img src="${data.image}" alt="${data.title}" style="width: 100%; height: 260px; object-fit: cover; border-radius: 14px; margin-bottom: 1.4rem;">
        <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent); text-transform: uppercase;">${data.category}</span>
        <h2 style="font-size: 1.6rem; margin: 0.4rem 0 1rem;">${data.title}</h2>
        <p style="color: var(--text-muted); line-height: 1.7; margin-bottom: 1.4rem;">${data.overview}</p>
        
        <h4 style="font-size: 1.05rem; margin-bottom: 0.6rem; color: var(--text-main);"><i class="fa-solid fa-list-check text-accent"></i> Key Architectural Highlights</h4>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem;">
          ${data.highlights.map(h => `<li style="color: var(--text-muted); font-size: 0.9rem;"><i class="fa-solid fa-circle-check text-accent" style="margin-right: 8px;"></i>${h}</li>`).join('')}
        </ul>

        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.8rem;">
          ${data.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
        </div>

        <div style="display: flex; gap: 1rem;">
          <a href="${data.github}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
            <i class="fa-brands fa-github"></i> View GitHub Repo
          </a>
        </div>
      `;

      projectModal.classList.add('active');
      window.playUiSound('click');
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      projectModal.classList.remove('active');
    });
  }

  // --------------------------------------------------------------------------
  // 10. Resume Modal
  // --------------------------------------------------------------------------
  const resumeModalBtn = document.getElementById('resume-modal-btn');
  const resumeModal = document.getElementById('resume-modal');
  const resumeModalClose = document.getElementById('resume-modal-close');

  if (resumeModalBtn && resumeModal) {
    resumeModalBtn.addEventListener('click', () => {
      resumeModal.classList.add('active');
      window.playUiSound('click');
    });
  }
  if (resumeModalClose && resumeModal) {
    resumeModalClose.addEventListener('click', () => {
      resumeModal.classList.remove('active');
    });
  }

  // Close modals when clicking backdrop
  window.addEventListener('click', (e) => {
    if (e.target === projectModal) projectModal.classList.remove('active');
    if (e.target === resumeModal) resumeModal.classList.remove('active');
  });

  // --------------------------------------------------------------------------
  // 11. Copy Email to Clipboard
  // --------------------------------------------------------------------------
  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = 'khushi2008.hc@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        copyEmailBtn.innerHTML = '<i class="fa-solid fa-check text-accent"></i> Copied!';
        window.playUiSound('success');
        setTimeout(() => {
          copyEmailBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy to Clipboard';
        }, 2200);
      });
    });
  }

  // --------------------------------------------------------------------------
  // 12. Contact Form with Confetti Celebration
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  if (contactForm && formFeedback) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const sendBtn = document.getElementById('send-msg-btn');
      const originalText = sendBtn.innerHTML;

      sendBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Transmitting...';
      sendBtn.disabled = true;

      setTimeout(() => {
        sendBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Message Dispatched!';
        formFeedback.innerHTML = '<span style="color: #10b981; font-weight: 600;"><i class="fa-solid fa-sparkles"></i> Thank you! Your message has been received. I will respond promptly.</span>';
        window.playUiSound('success');

        // Confetti burst
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }

        contactForm.reset();

        setTimeout(() => {
          sendBtn.innerHTML = originalText;
          sendBtn.disabled = false;
        }, 4000);
      }, 1200);
    });
  }

})();
