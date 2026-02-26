/* iris-shared.js — Transitions de page & micro-interactions */
(function() {
    'use strict';

    /* ── TRANSITION DE PAGE ─────────────────────────────────── */
    // Injecter l'overlay de transition si pas déjà présent
    function injectTransitionOverlay() {
        if (document.getElementById('iris-page-transition')) return;
        const div = document.createElement('div');
        div.id = 'iris-page-transition';
        document.body.appendChild(div);
    }

    // Fade-in à l'arrivée sur la page
    function fadeIn() {
        injectTransitionOverlay();
        const el = document.getElementById('iris-page-transition');
        el.style.opacity = '1';
        el.style.transition = 'none';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.transition = 'opacity 0.32s ease';
                el.style.opacity = '0';
            });
        });
    }

    // Intercepter les clics sur les liens internes
    function interceptLinks() {
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a[href]');
            if (!link) return;
            const href = link.getAttribute('href');
            // Seulement liens HTML locaux, pas anchors, pas external
            if (!href || href.startsWith('#') || href.startsWith('http') ||
                href.startsWith('mailto') || href.startsWith('javascript') ||
                link.target === '_blank') return;
            // Ne pas intercepter si ctrl/cmd cliqué
            if (e.ctrlKey || e.metaKey || e.shiftKey) return;

            e.preventDefault();
            injectTransitionOverlay();
            const el = document.getElementById('iris-page-transition');
            el.style.transition = 'opacity 0.22s ease';
            el.style.opacity = '1';
            setTimeout(() => { window.location.href = href; }, 230);
        });
    }

    /* ── LOGO PULSE — ajouter classe aux icônes brand inline ── */
    function patchInlineLogos() {
        // Les topbars inline ont des divs avec gradient 🔥
        // On leur ajoute un style de pulse via un attribut data
        document.querySelectorAll('[style*="border-radius:8px"]').forEach(el => {
            const s = el.getAttribute('style') || '';
            if (s.includes('667eea') && s.includes('ec4899') && el.textContent.includes('🔥')) {
                el.classList.add('iris-brand-icon-pulse');
            }
        });
    }

    /* ── BOUTONS — spinner auto sur click ──────────────────── */
    // On expose une fonction utilitaire globale
    window.irisSetLoading = function(btn, loading) {
        if (loading) {
            btn.dataset.originalText = btn.innerHTML;
            btn.classList.add('btn-loading');
        } else {
            btn.classList.remove('btn-loading');
            if (btn.dataset.originalText) btn.innerHTML = btn.dataset.originalText;
        }
    };

    /* ── INIT ───────────────────────────────────────────────── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        injectTransitionOverlay();
        fadeIn();
        interceptLinks();
        patchInlineLogos();
    }
})();
