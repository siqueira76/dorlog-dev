import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, Share2, FileText, Calendar, Mail, Clock, CheckCircle, Loader2, X, CalendarDays } from 'lucide-react';
import { useLocation } from 'wouter';
import { format, subMonths, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type SelectionMode = 'single' | 'range';

export default function MonthlyReportGenerator() {
  const [, setLocation] = useLocation();
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('single');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [fromPeriod, setFromPeriod] = useState<string>('');
  const [toPeriod, setToPeriod] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Gerar opções de períodos (últimos 12 meses + próximos 3 meses)
  const generatePeriodOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Últimos 12 meses (incluindo o atual)
    for (let i = 12; i >= 0; i--) {
      const date = subMonths(currentDate, i);
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);
      
      const value = `${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}`;
      const label = format(date, 'MMMM yyyy', { locale: ptBR });
      
      options.push({
        value,
        label: label.charAt(0).toUpperCase() + label.slice(1),
        date: date
      });
    }
    
    // Próximos 3 meses
    for (let i = 1; i <= 3; i++) {
      const date = addMonths(currentDate, i);
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);
      
      const value = `${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}`;
      const label = format(date, 'MMMM yyyy', { locale: ptBR });
      
      options.push({
        value,
        label: label.charAt(0).toUpperCase() + label.slice(1),
        date: date
      });
    }
    
    return options;
  };

  const periodOptions = generatePeriodOptions();

  // Definir o mês atual como padrão
  useEffect(() => {
    const currentDate = new Date();
    const currentMonthOption = periodOptions.find(option => {
      const optionDate = option.date;
      return optionDate.getMonth() === currentDate.getMonth() && 
             optionDate.getFullYear() === currentDate.getFullYear();
    });
    
    if (currentMonthOption && !selectedPeriod) {
      setSelectedPeriod(currentMonthOption.value);
    }
  }, []);

  // Função para validar se existe seleção válida
  const hasValidSelection = () => {
    if (selectionMode === 'single') {
      return selectedPeriod !== '';
    } else {
      return fromPeriod !== '' && toPeriod !== '';
    }
  };

  // Função para obter os períodos selecionados
  const getSelectedPeriods = () => {
    if (selectionMode === 'single') {
      return selectedPeriod ? [selectedPeriod] : [];
    } else {
      if (!fromPeriod || !toPeriod) return [];
      
      const fromOption = periodOptions.find(opt => opt.value === fromPeriod);
      const toOption = periodOptions.find(opt => opt.value === toPeriod);
      
      if (!fromOption || !toOption) return [];
      
      const periods = [];
      const fromDate = fromOption.date;
      const toDate = toOption.date;
      
      // Gerar todos os meses entre fromDate e toDate
      let currentDate = new Date(fromDate);
      while (currentDate <= toDate) {
        const startDate = startOfMonth(currentDate);
        const endDate = endOfMonth(currentDate);
        const value = `${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}`;
        periods.push(value);
        currentDate = addMonths(currentDate, 1);
      }
      
      return periods;
    }
  };

  const handleGeneratePDF = async () => {
    if (!hasValidSelection()) {
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simular geração do PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const periods = getSelectedPeriods();
      console.log('Gerando PDF para os períodos:', periods);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!hasValidSelection()) {
      return;
    }

    const periodsText = getSelectedPeriodsText();
    const message = `Relatório de saúde - ${periodsText}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareEmail = () => {
    if (!hasValidSelection()) {
      return;
    }

    const periodsText = getSelectedPeriodsText();
    const subject = `Relatório de saúde - ${periodsText}`;
    const body = `Segue em anexo o relatório de saúde referente ao(s) período(s): ${periodsText}.`;
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const getSelectedPeriodsText = () => {
    if (selectionMode === 'single') {
      if (!selectedPeriod) return '';
      const option = periodOptions.find(opt => opt.value === selectedPeriod);
      return option ? option.label : '';
    } else {
      if (!fromPeriod || !toPeriod) return '';
      const fromOption = periodOptions.find(opt => opt.value === fromPeriod);
      const toOption = periodOptions.find(opt => opt.value === toPeriod);
      
      if (!fromOption || !toOption) return '';
      
      if (fromPeriod === toPeriod) {
        return fromOption.label;
      } else {
        return `${fromOption.label} até ${toOption.label}`;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header fixo para mobile */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setLocation('/reports')}
              className="flex items-center gap-2 hover:bg-muted/50 touch-manipulation h-12 px-3"
              data-testid="button-back-to-reports"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline font-medium">Voltar</span>
            </Button>
            
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-500" />
              <h1 className="font-bold text-foreground text-lg">
                <span className="hidden sm:inline">Gerador de </span>Relatório
              </h1>
            </div>
            
            <div className="w-16" /> {/* Spacer for balance */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Descrição inicial */}
        <div className="text-center mb-10">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 dark:bg-blue-950 rounded-full mb-6">
              <Calendar className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
            Relatório Mensal em PDF
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            Selecione um ou múltiplos períodos e gere um relatório completo das suas atividades de saúde
          </p>
        </div>

        {/* Seleção de períodos - Card principal */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Selecionar Período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Modo de seleção */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-muted-foreground">
                Escolha como selecionar o período do relatório
              </Label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant={selectionMode === 'single' ? 'default' : 'outline'}
                  onClick={() => setSelectionMode('single')}
                  className="h-12 rounded-xl flex items-center gap-3 touch-manipulation"
                  data-testid="button-single-mode"
                >
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">Mês Único</span>
                </Button>
                
                <Button
                  variant={selectionMode === 'range' ? 'default' : 'outline'}
                  onClick={() => setSelectionMode('range')}
                  className="h-12 rounded-xl flex items-center gap-3 touch-manipulation"
                  data-testid="button-range-mode"
                >
                  <CalendarDays className="h-5 w-5" />
                  <span className="font-medium">Intervalo</span>
                </Button>
              </div>
            </div>

            {/* Seleção de período único */}
            {selectionMode === 'single' && (
              <div className="space-y-4">
                <Label className="text-sm font-medium text-muted-foreground">
                  Selecione o mês do relatório
                </Label>
                <Select 
                  value={selectedPeriod} 
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger 
                    className="h-12 text-base rounded-xl border-border/50 focus:border-blue-500 focus:ring-blue-500/20"
                    data-testid="select-single-period"
                  >
                    <SelectValue placeholder="Escolha o mês e ano" />
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
            )}

            {/* Seleção de intervalo */}
            {selectionMode === 'range' && (
              <div className="space-y-6">
                <Label className="text-sm font-medium text-muted-foreground">
                  Selecione o intervalo de meses para o relatório
                </Label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">De:</Label>
                    <Select 
                      value={fromPeriod} 
                      onValueChange={setFromPeriod}
                    >
                      <SelectTrigger 
                        className="h-12 text-base rounded-xl border-border/50 focus:border-blue-500 focus:ring-blue-500/20"
                        data-testid="select-from-period"
                      >
                        <SelectValue placeholder="Mês inicial" />
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
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Até:</Label>
                    <Select 
                      value={toPeriod} 
                      onValueChange={setToPeriod}
                    >
                      <SelectTrigger 
                        className="h-12 text-base rounded-xl border-border/50 focus:border-blue-500 focus:ring-blue-500/20"
                        data-testid="select-to-period"
                      >
                        <SelectValue placeholder="Mês final" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {periodOptions
                          .filter(option => !fromPeriod || option.date >= periodOptions.find(opt => opt.value === fromPeriod)?.date)
                          .map((option) => (
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
                </div>
              </div>
            )}

            {/* Preview do período selecionado */}
            {hasValidSelection() && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 p-5 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-medium text-foreground mb-2">
                      Período Selecionado
                    </h4>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                      {getSelectedPeriodsText()}
                    </p>
                    {selectionMode === 'range' && fromPeriod !== toPeriod && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {getSelectedPeriods().length} {getSelectedPeriods().length === 1 ? 'mês' : 'meses'} selecionados
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botão principal de gerar PDF */}
        {hasValidSelection() && (
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <Button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 text-white rounded-xl h-16 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                data-testid="button-generate-pdf"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                    <span className="text-base sm:text-lg">Gerando PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-6 w-6 mr-3" />
                    <span className="text-base sm:text-lg">
                      {getSelectedPeriods().length === 1 ? 'Gerar Relatório PDF' : `Gerar PDF (${getSelectedPeriods().length} meses)`}
                    </span>
                  </>
                )}
              </Button>
              
              <Separator className="my-8" />
              
              {/* Botões de compartilhamento */}
              <div className="space-y-4">
                <p className="text-base text-muted-foreground text-center mb-6">
                  Ou compartilhe diretamente:
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <Button
                    variant="outline"
                    onClick={handleShareWhatsApp}
                    className="h-14 rounded-xl border-green-200 hover:bg-green-50 hover:border-green-300 active:bg-green-100 dark:border-green-800 dark:hover:bg-green-950 dark:active:bg-green-900 group transition-all duration-200 touch-manipulation"
                    data-testid="button-share-whatsapp"
                  >
                    <Share2 className="h-5 w-5 mr-3 text-green-600 group-hover:text-green-700" />
                    <span className="text-green-700 dark:text-green-300 text-base font-medium">Compartilhar no WhatsApp</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleShareEmail}
                    className="h-14 rounded-xl border-blue-200 hover:bg-blue-50 hover:border-blue-300 active:bg-blue-100 dark:border-blue-800 dark:hover:bg-blue-950 dark:active:bg-blue-900 group transition-all duration-200 touch-manipulation"
                    data-testid="button-share-email"
                  >
                    <Mail className="h-5 w-5 mr-3 text-blue-600 group-hover:text-blue-700" />
                    <span className="text-blue-700 dark:text-blue-300 text-base font-medium">Compartilhar por Email</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações sobre o conteúdo do relatório */}
        <Card className="shadow-lg border-0 bg-card/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-foreground mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
              Conteúdo do Relatório
            </h4>
            <div className="space-y-4">
              {[
                "Registros do diário matinal e noturno",
                "Episódios de crises documentados",
                "Histórico de medicamentos",
                "Evolução dos níveis de dor",
                "Análise dos pontos de dor",
                "Resumo da adesão ao tratamento"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/40 transition-colors">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span className="text-base text-muted-foreground leading-relaxed font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Espaçamento inferior para mobile */}
        <div className="h-12 sm:h-8" />
      </div>
    </div>
  );
}