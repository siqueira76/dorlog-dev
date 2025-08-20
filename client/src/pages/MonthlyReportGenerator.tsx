import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Share2, FileText, Calendar, Mail, Clock, CheckCircle, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header fixo para mobile */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/reports')}
              className="flex items-center gap-2 hover:bg-muted/50"
              data-testid="button-back-to-reports"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <h1 className="font-semibold text-foreground">
                <span className="hidden sm:inline">Gerador de </span>Relatório
              </h1>
            </div>
            
            <div className="w-12" /> {/* Spacer for balance */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Descrição inicial */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-950 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Relatório Mensal em PDF
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            Selecione o período e gere um relatório completo das suas atividades de saúde
          </p>
        </div>

        {/* Seleção de período - Card principal */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Selecionar Período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="period-select" className="text-sm font-medium text-muted-foreground">
                Escolha o mês e ano do relatório
              </Label>
              <Select 
                value={selectedPeriod} 
                onValueChange={setSelectedPeriod}
              >
                <SelectTrigger 
                  id="period-select" 
                  data-testid="select-report-period"
                  className="h-12 text-base rounded-xl border-border/50 focus:border-blue-500 focus:ring-blue-500/20"
                >
                  <SelectValue placeholder="Toque para selecionar o período" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {periodOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="text-base py-3"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview do período selecionado */}
            {selectedPeriod && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground">
                      Período Selecionado
                    </h4>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold">
                      {getSelectedPeriodName()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    Pronto
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botão principal de gerar PDF */}
        {selectedPeriod && (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <Button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                data-testid="button-generate-pdf"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-3" />
                    Gerar Relatório PDF
                  </>
                )}
              </Button>
              
              <Separator className="my-6" />
              
              {/* Botões de compartilhamento */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Ou compartilhe diretamente:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleShareWhatsApp}
                    className="h-12 rounded-xl border-green-200 hover:bg-green-50 hover:border-green-300 dark:border-green-800 dark:hover:bg-green-950 group"
                    data-testid="button-share-whatsapp"
                  >
                    <Share2 className="h-4 w-4 mr-2 text-green-600 group-hover:text-green-700" />
                    <span className="text-green-700 dark:text-green-300">WhatsApp</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleShareEmail}
                    className="h-12 rounded-xl border-blue-200 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-800 dark:hover:bg-blue-950 group"
                    data-testid="button-share-email"
                  >
                    <Mail className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                    <span className="text-blue-700 dark:text-blue-300">Email</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações sobre o conteúdo do relatório */}
        <Card className="shadow-lg border-0 bg-card/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <h4 className="text-base font-semibold text-foreground mb-4 flex items-center">
              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
              Conteúdo do Relatório
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Registros do diário matinal e noturno",
                "Episódios de crises documentados",
                "Histórico de medicamentos",
                "Evolução dos níveis de dor",
                "Análise dos pontos de dor",
                "Resumo da adesão ao tratamento"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Espaçamento inferior para mobile */}
        <div className="h-8" />
      </div>
    </div>
  );
}