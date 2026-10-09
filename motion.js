(() => {
  'use strict';
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  // Keep the whole page usable if an animation library fails to load.
  if (!gsap || !ScrollTrigger || typeof gsap.matchMedia !== 'function') return;
  gsap.registerPlugin(ScrollTrigger);
  let media = null;

  function mount() {
    if (media) return;
    media = gsap.matchMedia();
    media.add({
      motion: '(prefers-reduced-motion: no-preference)',
      finePointer: '(hover: hover) and (pointer: fine)'
    }, (context) => {
      if (!context.conditions.motion) return;
      const cleanup = [];
      function listen(element, event, callback) {
        element.addEventListener(event, callback);
        cleanup.push(() => element.removeEventListener(event, callback));
      }

      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro
        .from('.site-header', { opacity: 0, y: -16, duration: 0.7 }, 0.1)
        .fromTo('.line-1 .word > span', { yPercent: 108 }, { yPercent: 0, duration: 0.9, stagger: 0.1 }, 0.25)
        .fromTo('.line-2 .word > span', { yPercent: 108 }, { yPercent: 0, duration: 0.9 }, 0.45)
        .fromTo('#inlineImg, #ideaPill', { scale: 0.45, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.85, stagger: 0.13, ease: 'back.out(1.5)' }, 0.5)
        .fromTo('.line-3 .word > span', { yPercent: 108 }, { yPercent: 0, duration: 0.9, stagger: 0.1 }, 0.65)
        .from('.big-image', { opacity: 0, y: 32, scale: 0.97, duration: 1 }, 0.9)
        .from('.try-pill-wrap', { opacity: 0, y: -14, duration: 0.7 }, 1.1)
        .from('.col-left > *, .col-right > *', { opacity: 0, y: 24, duration: 0.8, stagger: 0.08 }, 1.15)
        .from('.float-clue', { scale: 0.5, opacity: 0, duration: 0.65, stagger: 0.1, ease: 'back.out(1.5)' }, 1.4);

      gsap.to('#inlineImg', { y: 6, duration: 2.8, delay: 2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to('#ideaPill', { y: 5, duration: 3.2, delay: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      document.querySelectorAll('.float-clue').forEach((clue, index) => {
        gsap.to(clue, { y: 5 + index * 2, duration: 3.4 + index * 0.4, delay: 2 + index * 0.15, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });

      // Scroll, idle motion and pointer motion use separate elements.
      gsap.to('.feature-photo', {
        scale: 1.07, yPercent: 2, ease: 'none',
        scrollTrigger: { trigger: '.below', start: 'top 80%', end: 'bottom top', scrub: 0.8 }
      });
      gsap.to('.headline', {
        y: -22, opacity: 0.8, ease: 'none',
        scrollTrigger: { trigger: '.monax-hero', start: 'top top', end: 'bottom top', scrub: 0.8 }
      });

      const number = document.querySelector('.stat-block .num');
      const count = number?.querySelector('span');
      const target = Number(number?.dataset.count);
      if (count && Number.isFinite(target)) {
        const counter = { value: 0 };
        ScrollTrigger.create({
          trigger: number, start: 'top 90%', once: true,
          onEnter: () => {
            const tween = gsap.to(counter, {
              value: target, duration: 1.4, ease: 'power2.out',
              onUpdate: () => { count.textContent = String(Math.round(counter.value)); }
            });
            cleanup.push(() => tween.kill());
          }
        });
        cleanup.push(() => { count.textContent = String(target); });
      }

      if (context.conditions.finePointer) {
        const image = document.getElementById('bigImage');
        const orbits = Array.from(image.querySelectorAll('.clue-orbit')).map((element) => ({
          depth: Number(element.dataset.depth) || 8,
          x: gsap.quickTo(element, 'x', { duration: 0.8, ease: 'power3.out' }),
          y: gsap.quickTo(element, 'y', { duration: 0.8, ease: 'power3.out' })
        }));
        listen(image, 'pointermove', (event) => {
          const bounds = image.getBoundingClientRect();
          const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
          const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
          orbits.forEach((orbit) => { orbit.x(x * orbit.depth); orbit.y(y * orbit.depth); });
        });
        listen(image, 'pointerleave', () => orbits.forEach((orbit) => { orbit.x(0); orbit.y(0); }));
        ['inlineImg', 'ideaPill'].forEach((id, index) => {
          const badge = document.getElementById(id);
          const scale = gsap.quickTo(badge, 'scale', { duration: 0.4, ease: 'power2.out' });
          const rotation = gsap.quickTo(badge, 'rotation', { duration: 0.5, ease: 'power2.out' });
          listen(badge, 'pointerenter', () => { scale(1.04); rotation(index ? -2 : 2); });
          listen(badge, 'pointerleave', () => { scale(1); rotation(0); });
        });
      }

      document.querySelectorAll('.try-pill, .play-btn').forEach((button) => {
        const pulse = gsap.timeline({ paused: true })
          .fromTo(button, { scale: 1 }, { scale: 0.94, duration: 0.12, immediateRender: false, ease: 'power2.out' })
          .to(button, { scale: 1, duration: 0.2, ease: 'power2.out' });
        listen(button, 'click', () => pulse.restart());
      });
      return () => cleanup.forEach((dispose) => dispose());
    });
  }

  mount();
  window.addEventListener('pagehide', () => { media?.revert(); media = null; });
  window.addEventListener('pageshow', (event) => { if (event.persisted) mount(); });
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
})();
