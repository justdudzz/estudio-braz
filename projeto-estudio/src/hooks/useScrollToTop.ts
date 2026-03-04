import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 📜 LUXURY SCROLL RESET (Point #13)
 * Resolve o lag de "repaint" e scroll mantido entre transições de página.
 * Garante que cada página começa do topo absoluto instantaneamente.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        // Instantâneo antes do browser pintar a nova página
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
