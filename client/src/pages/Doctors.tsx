import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, Plus, MapPin, Phone } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Doctors() {
  const [, setLocation] = useLocation();

  const handleAddDoctor = () => {
    setLocation('/doctors/add');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Meus Médicos</h2>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground rounded-xl hover:bg-primary/90"
            data-testid="button-add-doctor"
            onClick={handleAddDoctor}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Gerencie sua equipe médica e mantenha as informações atualizadas
        </p>
      </div>

      {/* Empty State */}
      <Card className="shadow-sm border border-border">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <UserCheck className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhum médico cadastrado</h3>
            <p className="text-sm mb-6">
              Adicione seus médicos para ter acesso rápido às informações de contato e especialidades
            </p>
            <Button
              className="bg-primary text-primary-foreground rounded-xl hover:bg-primary/90"
              data-testid="button-add-first-doctor"
              onClick={handleAddDoctor}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Médico
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Future: Doctor cards will be rendered here when doctors are added */}
      {/* Example of how doctor cards would look:
      <div className="space-y-3">
        <Card className="shadow-sm border border-border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-1">Dr. João Silva</h4>
                <p className="text-sm text-muted-foreground mb-2">Cardiologista</p>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    (11) 99999-9999
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    Hospital São Paulo
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Editar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      */}
    </div>
  );
}
