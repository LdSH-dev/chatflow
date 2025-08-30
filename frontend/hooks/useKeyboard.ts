import { useState, useEffect } from 'react';

export function useKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      
      // If height decreased significantly, keyboard is likely open
      if (windowHeight > 0 && currentHeight < windowHeight - 150) {
        setIsKeyboardOpen(true);
      } else if (currentHeight >= windowHeight) {
        setIsKeyboardOpen(false);
      }
      
      setWindowHeight(currentHeight);
    };

    // Set initial height
    setWindowHeight(window.innerHeight);

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Listen for visual viewport changes (more reliable for keyboard detection)
    if (window.visualViewport) {
      const handleViewportChange = () => {
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const heightDifference = window.innerHeight - viewportHeight;
        
        // If viewport height is significantly smaller than window height, keyboard is open
        if (heightDifference > 150) {
          setIsKeyboardOpen(true);
        } else {
          setIsKeyboardOpen(false);
        }
      };

      window.visualViewport.addEventListener('resize', handleViewportChange);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
      };
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [windowHeight]);

  return { isKeyboardOpen, windowHeight };
} 