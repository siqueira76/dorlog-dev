import { Menu, Activity, Crown, ExternalLink, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-background via-background/95 to-background backdrop-blur-xl border-b border-border/60 sticky top-0 z-30 shadow-lg">
      <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
        {/* Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-xl transition-colors duration-200"
          data-testid="button-menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Logo e Nome do App - Legibilidade otimizada */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary via-primary to-primary/90 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col space-y-0.5">
            <span className="text-base font-bold text-primary leading-none tracking-tight">DorLog</span>
            <span className="text-xs text-muted-foreground/80 font-medium leading-none">{title}</span>
          </div>
        </div>
        
        {/* Status da Assinatura e Logout - Design melhorado */}
        <div className="flex items-center gap-2">
          {/* Botão de Logout temporário para debug */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
          
          {currentUser?.isSubscriptionActive !== undefined && (
            currentUser.isSubscriptionActive ? (
              // Usuário Premium - Badge elegante
              <div className="flex items-center bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border border-emerald-200/60 rounded-xl px-3 py-1.5 shadow-sm">
                <Crown className="h-3.5 w-3.5 text-emerald-600 mr-1.5" />
                <span className="text-xs font-bold text-emerald-700 tracking-wide">Premium</span>
              </div>
            ) : (
              // Usuário Gratuito - CTA elegante e informativo
              <Button
                onClick={() => window.open('https://checkout.stripe.com/pay/cs_test_premium_dorlog', '_blank')}
                variant="outline"
                size="sm"
                className="group relative h-9 px-3 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 hover:from-orange-100 hover:via-amber-100 hover:to-yellow-100 border border-orange-200/60 hover:border-orange-300 text-orange-800 hover:text-orange-900 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold tracking-tight">Gratuito</span>
                  </div>
                  <div className="w-px h-4 bg-orange-300"></div>
                  <div className="flex items-center gap-1">
                    <Crown className="h-3.5 w-3.5 text-amber-600 group-hover:text-amber-700 transition-colors" />
                    <span className="text-xs font-bold tracking-wide">Upgrade</span>
                  </div>
                </div>
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
