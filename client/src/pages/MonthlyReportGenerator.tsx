import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Download, Share2, FileText, Calendar, Mail, Clock, CheckCircle, Loader2, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MonthlyReportGenerator() {
  const [, setLocation] = useLocation();
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
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

  // Função para alternar seleção de período
  const togglePeriodSelection = (periodValue: string) => {
    setSelectedPeriods(prev => {
      if (prev.includes(periodValue)) {
        return prev.filter(p => p !== periodValue);
      } else {
        return [...prev, periodValue];
      }
    });
  };

  // Função para remover período específico
  const removePeriod = (periodValue: string) => {
    setSelectedPeriods(prev => prev.filter(p => p !== periodValue));
  };

  // Função para limpar todas as seleções
  const clearAllSelections = () => {
    setSelectedPeriods([]);
  };

  const handleGeneratePDF = async () => {
    if (selectedPeriods.length === 0) {
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simular geração do PDF (aqui você implementaria a lógica real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aqui você implementaria a geração real do PDF
      console.log('Gerando PDF para os períodos:', selectedPeriods);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (selectedPeriods.length === 0) {
      return;
    }

    const periodsText = getSelectedPeriodsText();
    const message = `Relatório de saúde - ${periodsText}`;
    
    // URL do WhatsApp com mensagem pré-definida
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareEmail = () => {
    if (selectedPeriods.length === 0) {
      return;
    }

    const periodsText = getSelectedPeriodsText();
    const subject = `Relatório de saúde - ${periodsText}`;
    const body = `Segue em anexo o relatório de saúde referente ao(s) período(s): ${periodsText}.`;
    
    // URL do mailto
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const getSelectedPeriodsText = () => {
    if (selectedPeriods.length === 0) return '';
    
    const sortedPeriods = [...selectedPeriods].sort();
    const periodNames = sortedPeriods.map(period => {
      const [startDate] = period.split('_');
      const periodName = format(new Date(startDate), 'MMM/yyyy', { locale: ptBR });
      return periodName.charAt(0).toUpperCase() + periodName.slice(1);
    });
    
    if (periodNames.length === 1) {
      return periodNames[0];
    } else if (periodNames.length === 2) {
      return `${periodNames[0]} e ${periodNames[1]}`;
    } else {
      const lastPeriod = periodNames.pop();
      return `${periodNames.join(', ')} e ${lastPeriod}`;
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Selecionar Períodos
              </CardTitle>
              {selectedPeriods.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllSelections}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Limpar Tudo
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">
                Escolha um ou múltiplos meses para o relatório
              </Label>
              
              {/* Lista de períodos com checkboxes */}
              <div className="space-y-1 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {periodOptions.map((option) => (
                  <div 
                    key={option.value} 
                    className="flex items-center space-x-4 p-4 rounded-xl hover:bg-muted/50 active:bg-muted/70 transition-colors touch-manipulation"
                    onClick={() => togglePeriodSelection(option.value)}
                  >
                    <Checkbox
                      id={`period-${option.value}`}
                      checked={selectedPeriods.includes(option.value)}
                      onCheckedChange={() => togglePeriodSelection(option.value)}
                      data-testid={`checkbox-period-${option.value}`}
                      className="w-5 h-5"
                    />
                    <Label 
                      htmlFor={`period-${option.value}`}
                      className="flex-1 text-base sm:text-sm cursor-pointer py-2 select-none"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview dos períodos selecionados */}
            {selectedPeriods.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 p-5 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-medium text-foreground mb-3">
                      {selectedPeriods.length === 1 ? 'Período Selecionado' : `${selectedPeriods.length} Períodos Selecionados`}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPeriods.map((periodValue) => {
                        const option = periodOptions.find(opt => opt.value === periodValue);
                        return (
                          <Badge 
                            key={periodValue} 
                            variant="secondary" 
                            className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
                          >
                            <span className="truncate max-w-32 sm:max-w-none">{option?.label}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removePeriod(periodValue);
                              }}
                              className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-1 touch-manipulation"
                              data-testid={`remove-period-${periodValue}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botão principal de gerar PDF */}
        {selectedPeriods.length > 0 && (
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
                      {selectedPeriods.length === 1 ? 'Gerar Relatório PDF' : `Gerar PDF (${selectedPeriods.length} meses)`}
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