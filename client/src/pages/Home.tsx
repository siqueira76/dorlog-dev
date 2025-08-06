import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Pill, AlertCircle, CheckCircle, Sunrise, Moon, BookOpen, Activity } from 'lucide-react';

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
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Ações Rápidas</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Registrar Crise - Vermelho com gradiente */}
          <Button
            variant="outline"
            className="group bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-red-200 hover:border-red-300 hover:shadow-lg transition-all duration-300 h-28 flex-col space-y-3 rounded-2xl p-5"
            data-testid="button-register-pain"
          >
            <div className="bg-gradient-to-br from-red-500 to-red-600 group-hover:from-red-600 group-hover:to-red-700 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300">
              <AlertTriangle className="h-7 w-7 text-white" />
            </div>
            <p className="text-sm font-semibold text-red-700 group-hover:text-red-800 transition-colors">Registrar Crise</p>
          </Button>
          
          {/* Tomar Remédio - Azul com gradiente */}
          <Button
            variant="outline"
            className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-28 flex-col space-y-3 rounded-2xl p-5"
            data-testid="button-take-medication"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300">
              <Pill className="h-7 w-7 text-white" />
            </div>
            <p className="text-sm font-semibold text-blue-700 group-hover:text-blue-800 transition-colors">Tomar Remédio</p>
          </Button>
          
          {/* Diário Manhã - Laranja com gradiente */}
          <Button
            variant="outline"
            className="group bg-gradient-to-br from-amber-50 to-orange-100 hover:from-amber-100 hover:to-orange-200 border-orange-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 h-28 flex-col space-y-3 rounded-2xl p-5"
            data-testid="button-diary-morning"
          >
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 group-hover:from-amber-500 group-hover:to-orange-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300">
              <Sunrise className="h-7 w-7 text-white" />
            </div>
            <p className="text-sm font-semibold text-orange-700 group-hover:text-orange-800 transition-colors">Diário Manhã</p>
          </Button>
          
          {/* Diário Noite - Índigo/Roxo com gradiente */}
          <Button
            variant="outline"
            className="group bg-gradient-to-br from-indigo-50 to-purple-100 hover:from-indigo-100 hover:to-purple-200 border-indigo-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 h-28 flex-col space-y-3 rounded-2xl p-5"
            data-testid="button-diary-night"
          >
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 group-hover:from-indigo-700 group-hover:to-purple-800 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300">
              <Moon className="h-7 w-7 text-white" />
            </div>
            <p className="text-sm font-semibold text-indigo-700 group-hover:text-indigo-800 transition-colors">Diário Noite</p>
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
