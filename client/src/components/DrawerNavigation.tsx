import { User, BarChart3, Settings, LogOut, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DrawerNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export default function DrawerNavigation({ isOpen, onClose, onNavigate }: DrawerNavigationProps) {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigate = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 drawer-overlay z-40 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        data-testid="drawer-overlay"
      />
      
      {/* Drawer */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-card shadow-xl z-50 transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        data-testid="drawer-navigation"
      >
        {/* Drawer Header */}
        <div className="bg-primary p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mr-3">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium" data-testid="text-user-name">
                  {currentUser?.name || 'Usuário'}
                </h3>
                <p className="text-primary-foreground/80 text-sm" data-testid="text-user-email">
                  {currentUser?.email || 'email@exemplo.com'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
              data-testid="button-close-drawer"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Drawer Menu */}
        <div className="py-4">
          <button
            onClick={() => handleNavigate('/profile')}
            className="flex items-center w-full px-6 py-3 text-foreground hover:bg-accent transition-colors"
            data-testid="link-profile"
          >
            <User className="h-5 w-5 mr-4 text-muted-foreground" />
            Meu Perfil
          </button>
          
          <button
            onClick={() => handleNavigate('/reports')}
            className="flex items-center w-full px-6 py-3 text-foreground hover:bg-accent transition-colors"
            data-testid="link-reports"
          >
            <BarChart3 className="h-5 w-5 mr-4 text-muted-foreground" />
            Relatórios
          </button>
          
          <button
            onClick={() => handleNavigate('/settings')}
            className="flex items-center w-full px-6 py-3 text-foreground hover:bg-accent transition-colors"
            data-testid="link-settings"
          >
            <Settings className="h-5 w-5 mr-4 text-muted-foreground" />
            Configurações
          </button>
          
          <div className="border-t border-border mt-2 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-6 py-3 text-destructive hover:bg-destructive/10 transition-colors"
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5 mr-4" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
