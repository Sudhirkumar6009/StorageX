import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

const ScrollProgressBar = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animationFrame = 0;
    let ticking = false;

    const updateProgress = () => {
      const totalHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const currentProgress =
        totalHeight > 0
          ? Math.min((window.scrollY / totalHeight) * 100, 100)
          : 0;

      setProgress(currentProgress);
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      animationFrame = window.requestAnimationFrame(updateProgress);
    };

    const handleResize = () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      updateProgress();
    };

    updateProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [location.pathname, location.search]);

  const containerBackground =
    theme === 'dark' ? 'rgba(0, 191, 255, 0.05)' : 'rgba(0, 191, 255, 0.08)';

  const fillGradient =
    theme === 'dark'
      ? 'linear-gradient(90deg, #00BFFF 0%, #00e1ff 50%, #00BFFF 100%)'
      : 'linear-gradient(90deg, #00BFFF 0%, #0099CC 50%, #00BFFF 100%)';

  const fillShadow =
    theme === 'dark'
      ? '0 0 10px rgba(0, 191, 255, 0.8), 0 0 20px rgba(0, 191, 255, 0.4)'
      : '0 0 8px rgba(0, 191, 255, 0.6)';

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-[60] scroll-progress-bar-container pointer-events-none"
      style={{ background: containerBackground }}
    >
      <div
        className="h-full scroll-progress-bar-fill"
        style={{
          width: `${progress}%`,
          background: fillGradient,
          boxShadow: fillShadow,
          transition: 'width 0.05s linear',
        }}
      />
    </div>
  );
};

export default ScrollProgressBar;
