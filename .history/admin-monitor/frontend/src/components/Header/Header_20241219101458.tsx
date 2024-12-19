import React from 'react';

interface HeaderProps {
  isDark: boolean;
  onThemeToggle: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDark, onThemeToggle, onMenuClick }) => {
  return (
    <header>
      <button onClick={onMenuClick}>Menu</button>
      <button onClick={onThemeToggle}>
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </button>
    </header>
  );
};

export default Header; 