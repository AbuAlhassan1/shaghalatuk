// Preloader handler with guaranteed removal
(function () {
    'use strict';

    // Try to remove preloader as soon as possible
    function removePreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        // Add fade-out transition
        preloader.style.transition = 'opacity 0.5s ease-out';
        preloader.style.opacity = '0';

        // Remove element after fade
        setTimeout(() => preloader.remove(), 500);
    }

    // Remove preloader after a maximum of 1.5 seconds
    const maxTimeout = setTimeout(removePreloader, 1500);

    // Try to remove earlier if possible
    if (document.readyState === 'complete') {
        clearTimeout(maxTimeout);
        removePreloader();
    } else {
        window.addEventListener('load', () => {
            clearTimeout(maxTimeout);
            removePreloader();
        });
    }
})();
