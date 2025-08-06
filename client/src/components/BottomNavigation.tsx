import { Home, UserCheck, Pill, BarChart3 } from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

const navigationItems = [
  { path: '/home', icon: Home, label: 'Início', testId: 'tab-home' },
  { path: '/doctors', icon: UserCheck, label: 'Médicos', testId: 'tab-doctors' },
  { path: '/medications', icon: Pill, label: 'Medicamentos', testId: 'tab-medications' },
  { path: '/reports', icon: BarChart3, label: 'Relatórios', testId: 'tab-reports' },
];

interface BottomNavigationProps {
  onNavigate: (path: string) => void;
}

export default function BottomNavigation({ onNavigate }: BottomNavigationProps) {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex">
          {navigationItems.map(({ path, icon: Icon, label, testId }) => (
            <button
              key={path}
              onClick={() => onNavigate(path)}
              className={cn(
                "flex-1 py-3 flex flex-col items-center space-y-1 transition-colors",
                location === path
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid={testId}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
