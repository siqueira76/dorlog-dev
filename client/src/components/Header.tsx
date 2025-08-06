import { Menu, Activity, Crown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const { currentUser } = useAuth();

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
        
        {/* Status da Assinatura */}
        <div className="flex items-center">
          {currentUser?.isSubscriptionActive !== undefined && (
            currentUser.isSubscriptionActive ? (
              // Usuário Premium
              <div className="flex items-center bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg px-2 py-1">
                <Crown className="h-3 w-3 text-emerald-600 mr-1" />
                <span className="text-xs font-bold text-emerald-700">Premium</span>
              </div>
            ) : (
              // Usuário Gratuito - CTA para upgrade
              <Button
                onClick={() => window.open('https://checkout.stripe.com/pay/cs_test_premium_dorlog', '_blank')}
                size="sm"
                className="h-7 px-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-bold rounded-lg transition-all duration-300 hover:scale-105 shadow-sm"
              >
                <div className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  <span className="hidden sm:inline">Pro</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </div>
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
