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
        
        {/* Status da Assinatura - Design melhorado */}
        <div className="flex items-center">
          {currentUser?.isSubscriptionActive !== undefined && (
            currentUser.isSubscriptionActive ? (
              // Usuário Premium - Badge elegante
              <div className="flex items-center bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border border-emerald-200/60 rounded-xl px-3 py-1.5 shadow-sm">
                <Crown className="h-3.5 w-3.5 text-emerald-600 mr-1.5" />
                <span className="text-xs font-bold text-emerald-700 tracking-wide">Premium</span>
              </div>
            ) : (
              // Usuário Gratuito - CTA limpo
              <Button
                onClick={() => window.open('https://checkout.stripe.com/pay/cs_test_premium_dorlog', '_blank')}
                size="sm"
                className="h-8 px-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-600 hover:via-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl transition-colors duration-200 shadow-lg"
              >
                <div className="flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline font-bold tracking-wide">Pro</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
