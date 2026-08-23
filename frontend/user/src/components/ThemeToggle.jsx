import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = ({ isDark, setIsDark, className = '' }) => {
  const toggleTheme = () => {
    if (setIsDark) {
      setIsDark(!isDark);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light and dark mode"
      className={`flex items-center gap-2 cursor-pointer select-none border-none bg-transparent p-1 focus:outline-none ${className}`}
    >
      <Sun className={`w-4 h-4 transition-colors ${!isDark ? 'text-(--color-off-black-ink)' : 'text-(--color-ash-dark)'}`} />
      <span className="text-(length:--text-caption) font-medium text-(--color-off-black-ink) dark:text-(--color-cloud)">
        Light
      </span>
      
      <div className="w-9 h-5 bg-(--color-electric-lime) dark:bg-(--color-iris-gleam) rounded-(--radius-full) p-0.5 relative transition-colors duration-200">
        <motion.div 
          animate={{ x: isDark ? 16 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="w-4 h-4 bg-(--color-off-black-ink) dark:bg-white rounded-(--radius-full)"
        />
      </div>

      <span className="text-(length:--text-caption) font-medium text-(--color-off-black-ink) dark:text-(--color-cloud)">
        Dark
      </span>
      <Moon className={`w-4 h-4 transition-colors ${isDark ? 'text-(--color-cloud)' : 'text-(--color-graphite)'}`} />
    </button>
  );
};

export default ThemeToggle;
