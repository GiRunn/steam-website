export interface MainLayoutProps {
  children: React.ReactNode;
}

export interface HeaderProps {
  isDark: boolean;
  onThemeToggle: () => void;
  onMenuClick: () => void;
} 