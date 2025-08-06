import { Menu, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-30">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          data-testid="button-menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Logo e Nome do App */}
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-primary to-primary/80 w-8 h-8 rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-primary leading-none">DorLog</span>
            <span className="text-xs text-muted-foreground leading-none">{title}</span>
          </div>
        </div>
        
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>
    </header>
  );
}
