import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, Share2, FileText, Calendar, Mail } from 'lucide-react';
import { useLocation } from 'wouter';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MonthlyReportGenerator() {
  const [, setLocation] = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Gerar opções de períodos (últimos 12 meses)
  const generatePeriodOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = subMonths(currentDate, i);
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);
      
      const value = `${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}`;
      const label = format(date, 'MMMM yyyy', { locale: ptBR });
      
      options.push({
        value,
        label: label.charAt(0).toUpperCase() + label.slice(1)
      });
    }
    
    return options;
  };

  const periodOptions = generatePeriodOptions();

  const handleGeneratePDF = async () => {
    if (!selectedPeriod) {
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simular geração do PDF (aqui você implementaria a lógica real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aqui você implementaria a geração real do PDF
      console.log('Gerando PDF para o período:', selectedPeriod);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!selectedPeriod) {
      return;
    }

    const [startDate, endDate] = selectedPeriod.split('_');
    const periodName = format(new Date(startDate), 'MMMM yyyy', { locale: ptBR });
    const message = `Relatório mensal de saúde - ${periodName.charAt(0).toUpperCase() + periodName.slice(1)}`;
    
    // URL do WhatsApp com mensagem pré-definida
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareEmail = () => {
    if (!selectedPeriod) {
      return;
    }

    const [startDate, endDate] = selectedPeriod.split('_');
    const periodName = format(new Date(startDate), 'MMMM yyyy', { locale: ptBR });
    const subject = `Relatório mensal de saúde - ${periodName.charAt(0).toUpperCase() + periodName.slice(1)}`;
    const body = `Segue em anexo o relatório mensal de saúde referente ao período de ${periodName}.`;
    
    // URL do mailto
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const getSelectedPeriodName = () => {
    if (!selectedPeriod) return '';
    
    const [startDate] = selectedPeriod.split('_');
    const periodName = format(new Date(startDate), 'MMMM yyyy', { locale: ptBR });
    return periodName.charAt(0).toUpperCase() + periodName.slice(1);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation('/reports')}
          className="flex items-center gap-2"
          data-testid="button-back-to-reports"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Relatórios
        </Button>
      </div>

      {/* Título principal */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Gerador de Relatório Mensal
        </h1>
        <p className="text-muted-foreground">
          Selecione o período desejado para gerar seu relatório em PDF
        </p>
      </div>

      {/* Card principal */}
      <Card className="shadow-sm border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <FileText className="h-6 w-6 mr-3 text-blue-500" />
            Configurar Relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de período */}
          <div className="space-y-3">
            <Label htmlFor="period-select" className="text-sm font-medium">
              <Calendar className="h-4 w-4 inline mr-2" />
              Período do Relatório
            </Label>
            <Select 
              value={selectedPeriod} 
              onValueChange={setSelectedPeriod}
            >
              <SelectTrigger id="period-select" data-testid="select-report-period">
                <SelectValue placeholder="Selecione o mês e ano" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview do período selecionado */}
          {selectedPeriod && (
            <div className="bg-muted/50 p-4 rounded-lg border">
              <h4 className="text-sm font-medium text-foreground mb-1">
                Período Selecionado:
              </h4>
              <p className="text-sm text-muted-foreground">
                {getSelectedPeriodName()}
              </p>
            </div>
          )}

          {/* Botões de ação */}
          <div className="space-y-4 pt-4 border-t">
            <Button
              onClick={handleGeneratePDF}
              disabled={!selectedPeriod || isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12"
              data-testid="button-generate-pdf"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Gerando PDF...' : 'Gerar PDF'}
            </Button>

            {selectedPeriod && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleShareWhatsApp}
                  className="flex items-center gap-2 rounded-xl"
                  data-testid="button-share-whatsapp"
                >
                  <Share2 className="h-4 w-4" />
                  Compartilhar no WhatsApp
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleShareEmail}
                  className="flex items-center gap-2 rounded-xl"
                  data-testid="button-share-email"
                >
                  <Mail className="h-4 w-4" />
                  Compartilhar por Email
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações adicionais */}
      <Card className="mt-6 shadow-sm border border-border">
        <CardContent className="pt-6">
          <h4 className="text-sm font-medium text-foreground mb-3">
            📋 O que será incluído no relatório:
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Registros do diário da manhã e noite</li>
            <li>• Episódios de crises registrados</li>
            <li>• Medicamentos tomados e horários</li>
            <li>• Evolução dos níveis de dor</li>
            <li>• Pontos de dor mais frequentes</li>
            <li>• Resumo da adesão ao tratamento</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}