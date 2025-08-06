import { Menu } from 'lucide-react';
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
        
        <h1 className="text-lg font-semibold text-foreground" data-testid="text-page-title">
          {title}
        </h1>
        
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>
    </header>
  );
}
