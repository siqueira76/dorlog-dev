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
  const { currentUser, firebaseUser, logout } = useAuth();

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
        <div className="bg-gradient-to-br from-primary via-primary to-primary/90 px-6 py-8">
          {/* Close Button */}
          <div className="flex justify-end mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-105"
              data-testid="button-close-drawer"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* User Profile Section */}
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative w-16 h-16 mb-4">
              {firebaseUser?.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt="Foto do perfil"
                  className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-white/30"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`bg-white/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${firebaseUser?.photoURL ? 'hidden' : ''}`}>
                <User className="h-8 w-8 text-white" />
              </div>
            </div>
            
            {/* User Info */}
            <div className="space-y-1">
              <h3 className="text-white font-semibold text-lg leading-tight" data-testid="text-user-name">
                {currentUser?.name || 'Usuário'}
              </h3>
              <p className="text-primary-foreground/70 text-sm font-medium" data-testid="text-user-email">
                {currentUser?.email || 'email@exemplo.com'}
              </p>
              
              {/* Subscription Status Badge */}
              {currentUser?.isSubscriptionActive !== undefined && (
                <div className="pt-3">
                  {currentUser.isSubscriptionActive ? (
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100/90 text-green-800 border border-green-200/50">
                      ✓ Premium Ativo
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-orange-100/90 text-orange-800 border border-orange-200/50">
                        Plano Gratuito
                      </div>
                      <Button
                        onClick={() => window.open('https://checkout.stripe.com/pay/cs_test_example', '_blank')}
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-xs font-medium rounded-full px-4 py-2 transition-all duration-200 transform hover:scale-105 shadow-md"
                      >
                        Fazer Upgrade ↗
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
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
