import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Calendar, Download } from 'lucide-react';

export default function Reports() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Relatórios</h2>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl"
            data-testid="button-export-report"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Acompanhe sua evolução e compartilhe com seus médicos
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="shadow-sm border border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1" data-testid="text-pain-episodes">
              0
            </div>
            <p className="text-sm text-muted-foreground">Episódios de dor</p>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary mb-1" data-testid="text-medications-taken">
              0
            </div>
            <p className="text-sm text-muted-foreground">Medicamentos</p>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Categories */}
      <div className="space-y-4">
        <Card className="shadow-sm border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Evolução da Dor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Acompanhe a intensidade e frequência das suas dores ao longo do tempo
            </p>
            <div className="bg-muted rounded-xl p-6 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Dados insuficientes para gerar relatório
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Calendar className="h-5 w-5 mr-2 text-secondary" />
              Adesão ao Tratamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Monitore como você está seguindo o tratamento prescrito
            </p>
            <div className="bg-muted rounded-xl p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Comece registrando medicamentos para ver sua adesão
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
              Resumo Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Relatório completo das suas atividades de saúde
            </p>
            <Button
              variant="outline"
              className="w-full rounded-xl"
              data-testid="button-generate-monthly-report"
            >
              Gerar Relatório Mensal
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
