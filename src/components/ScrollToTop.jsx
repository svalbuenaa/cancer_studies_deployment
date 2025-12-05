import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // This scrolls the window to the top (0, 0) on every route change
    window.scrollTo(0, 0);
  }, [pathname]); // Re-run whenever the route changes

  return null; // This component doesn't render anything
};

export default ScrollToTop;