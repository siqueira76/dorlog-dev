import { Redirect } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { ReactNode, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Star, CheckCircle } from 'lucide-react';

interface PremiumProtectedRouteProps {
  children: ReactNode;
  fallbackMode?: 'redirect' | 'modal';
  redirectTo?: string;
  showUpgradeModal?: boolean;
  onUpgradeModalClose?: () => void;
}

export default function PremiumProtectedRoute({ 
  children, 
  fallbackMode = 'redirect',
  redirectTo = '/reports',
  showUpgradeModal = false,
  onUpgradeModalClose
}: PremiumProtectedRouteProps) {
  const { currentUser, loading } = useAuth();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(showUpgradeModal);

  const handleUpgradeClick = () => {
    const checkoutUrl = import.meta.env.VITE_STRIPE_CHECKOUT_URL || 'https://checkout.stripe.com/pay/cs_test_premium_dorlog';
    window.open(checkoutUrl, '_blank');
  };

  const handleModalClose = () => {
    setIsUpgradeModalOpen(false);
    if (onUpgradeModalClose) {
      onUpgradeModalClose();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check basic authentication first
  if (!currentUser) {
    return <Redirect to="/login" replace />;
  }

  // Check premium subscription
  const hasPremiumAccess = currentUser.isSubscriptionActive === true;

  if (!hasPremiumAccess) {
    if (fallbackMode === 'modal') {
      return (
        <>
          <Dialog open={isUpgradeModalOpen} onOpenChange={handleModalClose}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  Funcionalidade Premium
                </DialogTitle>
                <DialogDescription className="space-y-4">
                  <p>
                    A geração de relatórios é uma funcionalidade exclusiva para usuários Premium.
                  </p>
                  
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Benefícios Premium
                    </h4>
                    <ul className="space-y-2 text-sm text-amber-800">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        Relatórios mensais detalhados em HTML
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        Análise NLP com insights inteligentes
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        Compartilhamento direto com médicos
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        URLs permanentes para relatórios
                      </li>
                    </ul>
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={handleModalClose}
                  className="flex-1"
                >
                  Talvez depois
                </Button>
                <Button 
                  onClick={handleUpgradeClick}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  data-testid="button-upgrade-premium"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Fazer Upgrade
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {children}
        </>
      );
    } else {
      // Redirect mode
      return <Redirect to={redirectTo} replace />;
    }
  }

  // User has premium access, render protected content
  return <>{children}</>;
}