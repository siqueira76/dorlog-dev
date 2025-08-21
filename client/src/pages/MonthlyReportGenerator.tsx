import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, Share2, FileText, Calendar, Mail, Clock, CheckCircle, Loader2, X, CalendarDays } from 'lucide-react';
import { useLocation } from 'wouter';
import { createNavigate } from '@/lib/navigation';
import { format, subMonths, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type SelectionMode = 'single' | 'range';

export default function MonthlyReportGenerator(): JSX.Element {
  const [, routerNavigate] = useLocation();
  const navigate = createNavigate(routerNavigate);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('single');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [fromPeriod, setFromPeriod] = useState<string>('');
  const [toPeriod, setToPeriod] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);

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
  }, [periodOptions, selectedPeriod]);

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

  // Função para obter o texto dos períodos selecionados
  const getSelectedPeriodsText = () => {
    if (selectionMode === 'single') {
      const option = periodOptions.find(opt => opt.value === selectedPeriod);
      return option ? option.label : '';
    } else {
      const fromOption = periodOptions.find(opt => opt.value === fromPeriod);
      const toOption = periodOptions.find(opt => opt.value === toPeriod);
      
      if (fromOption && toOption) {
        if (fromOption.value === toOption.value) {
          return fromOption.label;
        }
        return `${fromOption.label} até ${toOption.label}`;
      }
      return '';
    }
  };

  const handleShareWhatsApp = async () => {
    if (!hasValidSelection() || !currentUser?.email) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado ou período não selecionado",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const periods = getSelectedPeriods();
      console.log('🔄 Gerando relatório HTML para compartilhamento WhatsApp:', periods);
      
      // Generate report by calling API (will be intercepted by GitHub Pages patch)
      const response = await fetch('/api/generate-monthly-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.email,
          periods: periods,
          periodsText: getSelectedPeriodsText()
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.reportUrl) {
        setGeneratedPdfUrl(result.reportUrl);
        
        // Create WhatsApp message
        const periodsText = getSelectedPeriodsText();
        const message = `🩺 *DorLog - Relatório de Saúde*

📅 Período: ${periodsText}

Aqui está meu relatório de saúde gerado pelo DorLog. O relatório contém informações detalhadas sobre medicamentos, episódios de dor e estatísticas de saúde.

🔗 Visualizar relatório: ${result.reportUrl}

_Este relatório foi gerado automaticamente pelo aplicativo DorLog._`;

        // Try to share using Web Share API first
        if (navigator.share) {
          try {
            await navigator.share({
              title: '🩺 DorLog - Relatório de Saúde',
              text: message,
            });
            
            toast({
              title: "Relatório compartilhado!",
              description: "O relatório foi compartilhado com sucesso.",
              duration: 5000,
            });
            return;
          } catch (shareError) {
            console.log('Web Share API não disponível, tentando alternativas...');
          }
        }

        // Try WhatsApp protocol
        const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
        
        try {
          window.open(whatsappUrl, '_blank');
          
          toast({
            title: "Abrindo WhatsApp...",
            description: "Se o WhatsApp não abrir automaticamente, copie o link manualmente.",
            duration: 6000,
          });
          
          // Fallback: copy to clipboard after a delay
          setTimeout(async () => {
            try {
              await navigator.clipboard.writeText(message);
            } catch (clipboardError) {
              console.log('Clipboard API não disponível');
            }
          }, 3000);
          
        } catch (error) {
          // Final fallback: WhatsApp Web
          const whatsappWebUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
          window.open(whatsappWebUrl, '_blank');
          
          toast({
            title: "Abrindo WhatsApp Web",
            description: "O relatório será compartilhado via WhatsApp Web.",
            duration: 5000,
          });
        }
        
      } else {
        throw new Error(result.error || 'Erro desconhecido na geração do relatório');
      }
      
    } catch (error) {
      console.error('❌ Erro ao gerar relatório HTML:', error);
      toast({
        title: "Erro",
        description: `Falha ao gerar o relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareEmail = async () => {
    if (!hasValidSelection() || !currentUser?.email) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado ou período não selecionado",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const periods = getSelectedPeriods();
      console.log('🔄 Gerando relatório HTML para compartilhamento Email:', periods);
      
      // Generate report by calling API (will be intercepted by GitHub Pages patch)
      const response = await fetch('/api/generate-monthly-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.email,
          periods: periods,
          periodsText: getSelectedPeriodsText()
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.reportUrl) {
        setGeneratedPdfUrl(result.reportUrl);
        
        // Create email content
        const periodsText = getSelectedPeriodsText();
        const subject = `DorLog - Relatório de Saúde - ${periodsText}`;
        const body = `Olá,

Segue em anexo meu relatório de saúde gerado pelo DorLog para o período: ${periodsText}

O relatório contém informações detalhadas sobre:
- Medicamentos e aderência ao tratamento
- Episódios de dor e evolução
- Estatísticas de saúde e pontos de dor

Link para visualizar o relatório: ${result.reportUrl}

Atenciosamente,
${currentUser.email}

---
Este relatório foi gerado automaticamente pelo aplicativo DorLog.`;

        // Open email client
        const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoUrl);
        
        toast({
          title: "Email preparado!",
          description: "O cliente de email foi aberto com o relatório anexado.",
          duration: 5000,
        });
        
      } else {
        throw new Error(result.error || 'Erro desconhecido na geração do relatório');
      }
      
    } catch (error) {
      console.error('❌ Erro ao gerar relatório para email:', error);
      toast({
        title: "Erro",
        description: `Falha ao gerar o relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gerador de Relatório Mensal</h1>
            <p className="text-muted-foreground">Gere e compartilhe relatórios detalhados de saúde</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configurações */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Seleção de Período
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mode Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Modo de Seleção</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={selectionMode === 'single' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectionMode('single')}
                      className="flex-1"
                    >
                      Mês Único
                    </Button>
                    <Button
                      variant={selectionMode === 'range' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectionMode('range')}
                      className="flex-1"
                    >
                      Intervalo
                    </Button>
                  </div>
                </div>

                {/* Single Period Selection */}
                {selectionMode === 'single' && (
                  <div className="space-y-3">
                    <Label htmlFor="period" className="text-sm font-medium">
                      Selecionar Mês
                    </Label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um mês" />
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
                )}

                {/* Range Selection */}
                {selectionMode === 'range' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="from-period" className="text-sm font-medium">
                        De
                      </Label>
                      <Select value={fromPeriod} onValueChange={setFromPeriod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Mês inicial" />
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
                    
                    <div className="space-y-3">
                      <Label htmlFor="to-period" className="text-sm font-medium">
                        Até
                      </Label>
                      <Select 
                        value={toPeriod} 
                        onValueChange={setToPeriod}
                        disabled={!fromPeriod}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Mês final" />
                        </SelectTrigger>
                        <SelectContent>
                          {periodOptions
                            .filter(option => {
                              if (!fromPeriod) return false;
                              const fromOption = periodOptions.find(opt => opt.value === fromPeriod);
                              return fromOption ? option.date >= fromOption.date : false;
                            })
                            .map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview e Ações */}
          <div className="space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Período Selecionado</Label>
                    <p className="text-sm font-medium">
                      {hasValidSelection() 
                        ? getSelectedPeriodsText()
                        : 'Nenhum período selecionado'
                      }
                    </p>
                  </div>
                  
                  {hasValidSelection() && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Total de Meses</Label>
                      <p className="text-sm font-medium">
                        {getSelectedPeriods().length} mês{getSelectedPeriods().length !== 1 ? 'es' : ''}
                      </p>
                    </div>
                  )}

                  {hasValidSelection() && (
                    <div className="pt-2">
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Pronto para gerar
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Compartilhar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleShareWhatsApp}
                  disabled={!hasValidSelection() || isGenerating}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 mr-2" />
                      Via WhatsApp
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleShareEmail}
                  disabled={!hasValidSelection() || isGenerating}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Via Email
                    </>
                  )}
                </Button>

                {!hasValidSelection() && (
                  <p className="text-xs text-muted-foreground text-center">
                    Selecione um período para habilitar o compartilhamento
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}