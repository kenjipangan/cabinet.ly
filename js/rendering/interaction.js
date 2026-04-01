/**
 * Interaction Controller - handles drag-to-rotate and scroll-to-zoom
 * Single Responsibility: user input handling for 3D views
 */
export function attachInteraction(container, renderer, onRender) {
    let dragging = false, lastX = 0, lastY = 0;
    let rafId = null;

    function scheduleRender() {
        if (!rafId) {
            rafId = requestAnimationFrame(() => {
                rafId = null;
                onRender();
            });
        }
    }

    container.style.cursor = 'grab';

    container.addEventListener('mousedown', e => {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        container.style.cursor = 'grabbing';
        e.preventDefault();
    });

    container.addEventListener('touchstart', e => {
        dragging = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        container.style.cursor = 'grabbing';
        e.preventDefault();
    }, { passive: false });

    const onMove = e => {
        if (!dragging) return;
        const cx = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const cy = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        renderer.rotY += (cx - lastX) * 0.008;
        renderer.rotX = Math.max(-1.2, Math.min(1.2, renderer.rotX - (cy - lastY) * 0.008));
        lastX = cx;
        lastY = cy;
        scheduleRender();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });

    const onUp = () => {
        dragging = false;
        container.style.cursor = 'grab';
    };
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);

    container.addEventListener('wheel', e => {
        e.preventDefault();
        renderer.zoom = Math.max(0.3, Math.min(5, renderer.zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
        scheduleRender();
    }, { passive: false });
}
