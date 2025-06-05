import { useTheme } from './ThemeContext';
import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export const BackTopContext = () => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
    } else {
      // Wait for the transition to finish before hiding
      const timeout = setTimeout(() => setShow(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      style={{ pointerEvents: 'none' }}
    >
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`px-4 py-4 rounded-full font-semibold shadow transition-colors duration-200
          ${
            theme === 'dark'
              ? 'bg-[#00BFFF] text-black hover:bg-[#0099CC]'
              : 'bg-[#00BFFF] text-white hover:bg-[#0099CC]'
          }
          transition-transform duration-100 origin-bottom
          ${visible ? 'scale-x-100' : 'scale-x-0'}
        `}
        aria-label="Back to Top"
        style={{ pointerEvents: 'auto' }}
      >
        <ChevronUp />
      </button>
    </div>
  );
};
