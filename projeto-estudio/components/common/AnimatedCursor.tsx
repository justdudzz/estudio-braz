import React, { useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const AnimatedCursor: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Ultra responsive spring configuration
    const springConfig = { damping: 50, stiffness: 1000, mass: 0.1 };
    const smoothX = useSpring(cursorX, springConfig);
    const smoothY = useSpring(cursorY, springConfig);

    const onMouseMove = useCallback((e: MouseEvent) => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
        if (!isVisible) setIsVisible(true);
    }, [cursorX, cursorY, isVisible]);

    useEffect(() => {
        // Detect mobile/touch devices
        const checkMobile = () => {
            setIsMobile(window.matchMedia('(max-width: 1024px)').matches || 'ontouchstart' in window);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        if (isMobile) return;

        window.addEventListener('mousemove', onMouseMove);

        // Track hover state on interactive elements
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('a, button, [role="button"], input, textarea, select, [data-cursor-hover]')) {
                setIsHovering(true);
            }
        };
        const handleMouseOut = () => setIsHovering(false);

        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', checkMobile);
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseout', handleMouseOut);
        };
    }, [onMouseMove, isMobile]);

    // Don't render on mobile
    if (isMobile) return null;

    return (
        <>
            {/* Hide default cursor globally to enforce luxury branding */}
            <style>{`
                * { cursor: none !important; }
                a, button, [role="button"] { cursor: none !important; }
            `}</style>

            {/* Outer ring — follows with spring delay */}
            <motion.div
                className="fixed top-0 left-0 z-[999999] pointer-events-none"
                style={{
                    x: smoothX,
                    y: smoothY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            >
                <motion.div
                    animate={{
                        width: isHovering ? 64 : 40,
                        height: isHovering ? 64 : 40,
                        borderColor: isHovering ? 'rgba(197, 160, 89, 1)' : 'rgba(197, 160, 89, 0.6)',
                        borderWidth: isHovering ? 3 : 2,
                    }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="rounded-full shadow-[0_0_15px_rgba(197,160,89,0.2)]"
                    style={{
                        opacity: isVisible ? 1 : 0,
                    }}
                />
            </motion.div>

            {/* Inner dot — follows cursor instantly */}
            <motion.div
                className="fixed top-0 left-0 z-[999999] pointer-events-none"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            >
                <motion.div
                    animate={{
                        width: isHovering ? 16 : 10,
                        height: isHovering ? 16 : 10,
                        backgroundColor: isHovering ? '#C5A059' : '#C5A059',
                    }}
                    transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                    className="rounded-full shadow-[0_0_10px_rgba(197,160,89,0.5)]"
                    style={{
                        opacity: isVisible ? 1 : 0,
                    }}
                />
            </motion.div>
        </>
    );
};

export default AnimatedCursor;
