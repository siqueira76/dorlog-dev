import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, Plus, Clock, Calendar } from 'lucide-react';

export default function Medications() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Medicamentos</h2>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground rounded-xl hover:bg-primary/90"
            data-testid="button-add-medication"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Controle seus medicamentos e nunca esqueça de tomar na hora certa
        </p>
      </div>

      {/* Empty State */}
      <Card className="shadow-sm border border-border">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <Pill className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhum medicamento cadastrado</h3>
            <p className="text-sm mb-6">
              Adicione seus medicamentos para receber lembretes e acompanhar seu tratamento
            </p>
            <Button
              className="bg-primary text-primary-foreground rounded-xl hover:bg-primary/90"
              data-testid="button-add-first-medication"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Medicamento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Future: Medication cards will be rendered here when medications are added */}
      {/* Example of how medication cards would look:
      <div className="space-y-3">
        <Card className="shadow-sm border border-border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-1">Ibuprofeno 600mg</h4>
                <p className="text-sm text-muted-foreground mb-2">Para dor e inflamação</p>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    8h, 14h, 20h
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Durante 7 dias
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Button variant="outline" size="sm">
                  Tomei
                </Button>
                <Button variant="ghost" size="sm">
                  Editar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      */}
    </div>
  );
}
