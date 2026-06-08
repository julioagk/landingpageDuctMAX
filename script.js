/* =============================================
   DUCTMAX - Premium Interactive Engine
   Particles, scroll animations, tilt, scroll-spy
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================
  // PARTICLE SYSTEM
  // =========================================
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = -1000;
    let mouseY = -1000;
    const PARTICLE_COUNT = 70;
    const CONNECTION_DISTANCE = 150;
    const MOUSE_RADIUS = 200;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.pulseOffset = Math.random() * Math.PI * 2;
      }

      update(time) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Mouse repulsion
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          this.x += (dx / dist) * force * 2;
          this.y += (dy / dist) * force * 2;
        }

        // Wrap around
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        if (this.y > canvas.height + 10) this.y = -10;

        // Pulse opacity
        this.currentOpacity = this.opacity + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.15;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 155, 10, ${this.currentOpacity})`;
        ctx.fill();

        // Small glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 155, 10, ${this.currentOpacity * 0.1})`;
        ctx.fill();
      }
    }

    // Init particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 155, 10, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    let animationTime = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animationTime++;

      particles.forEach(p => {
        p.update(animationTime);
        p.draw();
      });

      drawConnections();
      requestAnimationFrame(animate);
    };

    animate();
  }

  // =========================================
  // NAVBAR SCROLL
  // =========================================
  const navbar = document.getElementById('navbar');

  const handleNavScroll = () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // =========================================
  // SCROLL ANIMATIONS (Intersection Observer)
  // =========================================
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const parent = entry.target.parentElement;
        const siblings = parent ? parent.querySelectorAll('.animate-on-scroll') : [];
        let delay = 0;

        if (siblings.length > 1) {
          const siblingIndex = Array.from(siblings).indexOf(entry.target);
          delay = siblingIndex * 150;
        }

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => observer.observe(el));

  // =========================================
  // SMOOTH SCROLL + SCROLL SPY
  // =========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const navbarHeight = navbar.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 10;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  const navLinks = document.querySelectorAll('.navbar-links a');
  const sections = document.querySelectorAll('section[id]');

  const updateActiveLink = () => {
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  // =========================================
  // PARALLAX on Hero Image
  // =========================================
  const heroImage = document.querySelector('.hero-image-wrapper');

  if (heroImage) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroImage.style.transform = `translateY(${scrolled * 0.06}px)`;
      }
    }, { passive: true });
  }

  // =========================================
  // 3D TILT on Benefit & Credibility Cards
  // =========================================
  const tiltCards = document.querySelectorAll('.benefit-card, .credibility-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `translateY(-10px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) perspective(800px) rotateX(0) rotateY(0)';
    });
  });

  // =========================================
  // MAGNETIC EFFECT on CTA Buttons
  // =========================================
  const magneticBtns = document.querySelectorAll('.btn-primary, .cta-btn');

  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.03)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0) scale(1)';
    });
  });

  // =========================================
  // BEFORE / AFTER COMPARISON SLIDER (v2)
  // Scrubber is BELOW the image, no line on image
  // =========================================
  const scrubber    = document.getElementById('cmpScrubber');
  const beforeClip  = document.getElementById('cmpBeforeClip');
  const dot         = document.getElementById('cmpDot');
  const trackFill   = document.getElementById('cmpTrackFill');

  if (scrubber && beforeClip && dot && trackFill) {
    let isDragging = false;
    let pct = 0.5; // 50% start

    const applyPosition = (p) => {
      pct = Math.max(0.01, Math.min(0.99, p));
      const pctStr = (pct * 100).toFixed(2) + '%';

      // Clip the before image: show left portion
      const rightInset = ((1 - pct) * 100).toFixed(2) + '%';
      beforeClip.style.clipPath = `inset(0 ${rightInset} 0 0)`;

      // Move dot along the track
      dot.style.left = pctStr;

      // Fill the track
      trackFill.style.width = pctStr;
    };

    // Init at 50%
    applyPosition(0.5);

    const getPct = (clientX) => {
      const rect = scrubber.getBoundingClientRect();
      return (clientX - rect.left) / rect.width;
    };

    // Mouse
    scrubber.addEventListener('mousedown', (e) => {
      isDragging = true;
      applyPosition(getPct(e.clientX));
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      applyPosition(getPct(e.clientX));
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    // Touch
    scrubber.addEventListener('touchstart', (e) => {
      isDragging = true;
      applyPosition(getPct(e.touches[0].clientX));
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      applyPosition(getPct(e.touches[0].clientX));
    }, { passive: true });

    window.addEventListener('touchend', () => { isDragging = false; });
  }

});
