import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pill, AlertCircle, CheckCircle } from 'lucide-react';

export default function Home() {
  const { currentUser } = useAuth();

  const recentActivities = [
    {
      id: 1,
      type: 'pain',
      title: 'Dor de cabeça registrada',
      time: 'Há 2 horas',
      icon: AlertCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-100',
    },
    {
      id: 2,
      type: 'medication',
      title: 'Ibuprofeno tomado',
      time: 'Há 3 horas',
      icon: CheckCircle,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/90 rounded-2xl p-6 text-primary-foreground mb-6">
        <h2 className="text-xl font-semibold mb-2" data-testid="text-welcome">
          Olá, {currentUser?.name || 'Usuário'}!
        </h2>
        <p className="text-primary-foreground/80">Como está se sentindo hoje?</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="bg-card p-4 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow h-auto flex-col space-y-3"
            data-testid="button-register-pain"
          >
            <div className="bg-secondary w-12 h-12 rounded-xl flex items-center justify-center">
              <Plus className="h-6 w-6 text-secondary-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Registrar Dor</p>
          </Button>
          
          <Button
            variant="outline"
            className="bg-card p-4 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow h-auto flex-col space-y-3"
            data-testid="button-take-medication"
          >
            <div className="bg-blue-500 w-12 h-12 rounded-xl flex items-center justify-center">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-medium text-foreground">Tomar Remédio</p>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Atividade Recente</h3>
        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <Card key={activity.id} className="shadow-sm border border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className={`${activity.bgColor} w-10 h-10 rounded-lg flex items-center justify-center mr-3`}>
                        <Icon className={`h-5 w-5 ${activity.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground" data-testid={`text-activity-${activity.id}`}>
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-time-${activity.id}`}>
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="shadow-sm border border-border">
            <CardContent className="p-6 text-center">
              <div className="text-muted-foreground mb-2">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">Nenhuma atividade recente</p>
                <p className="text-sm">Comece registrando uma dor ou medicamento</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
