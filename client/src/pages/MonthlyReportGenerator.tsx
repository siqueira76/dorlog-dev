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
import { useAuth } from '@/hooks/useAuth';
import { PDFReportService } from '@/services/pdfReportService';
import { useToast } from '@/hooks/use-toast';

type SelectionMode = 'single' | 'range';

export default function MonthlyReportGenerator() {
  const [, setLocation] = useLocation();
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
      console.log('🔄 Gerando relatório HTML para Firebase Hosting:', periods);
      
      // Get the first and last periods to determine the report month
      const firstPeriod = periods[0];
      const lastPeriod = periods[periods.length - 1];
      
      // Parse dates to create a meaningful report month identifier
      const firstDate = new Date(firstPeriod.split('_')[0]);
      const lastDate = new Date(lastPeriod.split('_')[1]);
      
      let reportMonth;
      if (periods.length === 1) {
        // Single month
        reportMonth = format(firstDate, 'MMMM_yyyy', { locale: ptBR });
      } else {
        // Multiple months - use range
        const startMonth = format(firstDate, 'MMM_yyyy', { locale: ptBR });
        const endMonth = format(lastDate, 'MMM_yyyy', { locale: ptBR });
        reportMonth = `${startMonth}_ate_${endMonth}`;
      }
      
      // Sanitize report month for filename
      reportMonth = reportMonth
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_|_$/g, '');
      
      // Prepare report data for the API
      const reportData = {
        periods: periods,
        selectionMode: selectionMode,
        periodsText: getSelectedPeriodsText(),
        totalMonths: periods.length,
        generatedAt: new Date().toISOString(),
        userEmail: currentUser.email
      };
      
      // Call the Firebase Hosting report generation API
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.email,
          reportMonth: reportMonth,
          reportData: reportData
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Store the generated report URL for sharing
        if (result.reportUrl) {
          setGeneratedPdfUrl(result.reportUrl);
          
          // Open the report in a new tab
          window.open(result.reportUrl, '_blank');
        }
        
        toast({
          title: "Sucesso!",
          description: result.reportUrl 
            ? "Relatório HTML gerado e hospedado no Firebase!" 
            : "Sistema de relatórios configurado com sucesso!",
          duration: 5000,
        });
        
        console.log('✅ Relatório gerado:', result);
        
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
      
      // Get the first and last periods to determine the report month
      const firstPeriod = periods[0];
      const lastPeriod = periods[periods.length - 1];
      
      // Parse dates to create a meaningful report month identifier
      const firstDate = new Date(firstPeriod.split('_')[0]);
      const lastDate = new Date(lastPeriod.split('_')[1]);
      
      let reportMonth;
      if (periods.length === 1) {
        reportMonth = format(firstDate, 'MMMM_yyyy', { locale: ptBR });
      } else {
        const startMonth = format(firstDate, 'MMM_yyyy', { locale: ptBR });
        const endMonth = format(lastDate, 'MMM_yyyy', { locale: ptBR });
        reportMonth = `${startMonth}_ate_${endMonth}`;
      }
      
      // Sanitize report month for filename
      reportMonth = reportMonth
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_|_$/g, '');
      
      // Prepare report data for the API
      const reportData = {
        periods: periods,
        selectionMode: selectionMode,
        periodsText: getSelectedPeriodsText(),
        totalMonths: periods.length,
        generatedAt: new Date().toISOString(),
        userEmail: currentUser.email
      };
      
      // Generate the Firebase report
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.email,
          reportMonth: reportMonth,
          reportData: reportData
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido na geração do relatório');
      }
      
      const periodsText = getSelectedPeriodsText();
      const reportUrl = result.reportUrl;
      
      const message = reportUrl 
        ? `🏥 *DorLog - Relatório de Saúde*\n\n📅 Período: ${periodsText}\n👤 Usuário: ${currentUser.email}\n\n📊 Acesse o relatório completo:\n${reportUrl}\n\n_Relatório gerado automaticamente pelo DorLog_`
        : `🏥 *DorLog - Relatório de Saúde*\n\n📅 Período: ${periodsText}\n👤 Usuário: ${currentUser.email}\n📊 Relatório completo com dados de saúde, medicamentos e evolução da dor.\n\n_Sistema de relatórios DorLog configurado_`;
      
      // Store the generated report URL
      setGeneratedPdfUrl(reportUrl);
      
      // Use native Web Share API (shows the system share dialog like in the image)
      if (navigator.share && navigator.canShare) {
        const shareData: ShareData = {
          title: 'DorLog - Relatório de Saúde',
          text: message
        };
        
        // Check if we can share with URL
        if (reportUrl && navigator.canShare({ ...shareData, url: reportUrl })) {
          shareData.url = reportUrl;
        }
        
        try {
          await navigator.share(shareData);
          
          toast({
            title: "Compartilhamento concluído",
            description: "Relatório enviado com sucesso!",
          });
          return;
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Erro no compartilhamento nativo:', error);
          } else {
            // User cancelled, no need to show error
            return;
          }
        }
      }
      
      // Fallback for devices without Web Share API
      try {
        await navigator.clipboard.writeText(message);
        toast({
          title: "Link copiado!",
          description: "O link do relatório foi copiado. Cole no WhatsApp ou outro app.",
          duration: 5000,
        });
      } catch (clipboardError) {
        // Manual selection fallback
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = message;
        tempTextArea.style.position = 'fixed';
        tempTextArea.style.left = '-999999px';
        tempTextArea.style.top = '-999999px';
        document.body.appendChild(tempTextArea);
        tempTextArea.focus();
        tempTextArea.select();
        
        try {
          document.execCommand('copy');
          toast({
            title: "Texto copiado",
            description: "Cole no WhatsApp ou outro app para compartilhar.",
            duration: 5000,
          });
        } catch (err) {
          toast({
            title: "Compartilhamento manual",
            description: "Copie manualmente o texto que apareceu na tela.",
            duration: 7000,
          });
        } finally {
          document.body.removeChild(tempTextArea);
        }
      }
      
    } catch (error) {
      console.error('Erro ao gerar e compartilhar relatório:', error);
      toast({
        title: "Erro",
        description: `Falha ao gerar relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
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
      
      // Get the first and last periods to determine the report month
      const firstPeriod = periods[0];
      const lastPeriod = periods[periods.length - 1];
      
      // Parse dates to create a meaningful report month identifier
      const firstDate = new Date(firstPeriod.split('_')[0]);
      const lastDate = new Date(lastPeriod.split('_')[1]);
      
      let reportMonth;
      if (periods.length === 1) {
        reportMonth = format(firstDate, 'MMMM_yyyy', { locale: ptBR });
      } else {
        const startMonth = format(firstDate, 'MMM_yyyy', { locale: ptBR });
        const endMonth = format(lastDate, 'MMM_yyyy', { locale: ptBR });
        reportMonth = `${startMonth}_ate_${endMonth}`;
      }
      
      // Sanitize report month for filename
      reportMonth = reportMonth
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_|_$/g, '');
      
      // Prepare report data for the API
      const reportData = {
        periods: periods,
        selectionMode: selectionMode,
        periodsText: getSelectedPeriodsText(),
        totalMonths: periods.length,
        generatedAt: new Date().toISOString(),
        userEmail: currentUser.email
      };
      
      // Generate the Firebase report
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.email,
          reportMonth: reportMonth,
          reportData: reportData
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido na geração do relatório');
      }
      
      const periodsText = getSelectedPeriodsText();
      const reportUrl = result.reportUrl;
      
      // Store the generated report URL
      setGeneratedPdfUrl(reportUrl);
      
      const subject = `DorLog - Relatório de Saúde (${periodsText})`;
      const body = reportUrl 
        ? `Olá,

Segue o link para acesso ao relatório de saúde gerado pelo aplicativo DorLog:

🔗 ${reportUrl}

📅 Período: ${periodsText}
👤 Usuário: ${currentUser.email}
🕐 Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}

📊 O relatório inclui:
• Resumo executivo do período
• Registro de episódios de crise
• Evolução da intensidade da dor
• Lista de medicamentos prescritos
• Informações da equipe médica
• Pontos de dor mais frequentes

O relatório está hospedado de forma segura no Firebase e pode ser acessado diretamente pelo link acima.

Atenciosamente,
Sistema DorLog`
        : `Olá,

Segue informação sobre o relatório de saúde gerado pelo aplicativo DorLog.

📅 Período: ${periodsText}
👤 Usuário: ${currentUser.email}
🕐 Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}

📊 O relatório inclui:
• Resumo executivo do período
• Registro de episódios de crise
• Evolução da intensidade da dor
• Lista de medicamentos prescritos
• Informações da equipe médica
• Pontos de dor mais frequentes

Sistema de relatórios DorLog configurado.

Atenciosamente,
Sistema DorLog`;
      
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
      
      toast({
        title: "Email aberto",
        description: reportUrl ? "Email preparado com link do relatório" : "Continue no seu cliente de email",
      });
      
    } catch (error) {
      console.error('Erro ao gerar e compartilhar relatório via email:', error);
      toast({
        title: "Erro",
        description: `Falha ao gerar relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
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

      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-2xl">
        {/* Descrição inicial - compacta para mobile */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 dark:bg-blue-950 rounded-full mb-4 sm:mb-6">
              <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
            Relatório Mensal
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Selecione um ou múltiplos períodos e gere um relatório completo das suas atividades de saúde
          </p>
        </div>

        {/* Seleção de períodos - Card principal com destaque mobile */}
        <Card className="shadow-lg border-2 border-blue-200 dark:border-blue-800 bg-card backdrop-blur-sm mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center text-lg sm:text-xl font-semibold">
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
                          .filter(option => {
                            if (!fromPeriod) return true;
                            const fromOption = periodOptions.find(opt => opt.value === fromPeriod);
                            return fromOption ? option.date >= fromOption.date : true;
                          })
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

        {/* Botões de compartilhamento - agora como única ação */}
        {hasValidSelection() && (
          <div className="space-y-4 mb-6">
            <Card className="shadow-lg border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="text-center mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    Gerar e Compartilhar Relatório
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    O relatório será gerado automaticamente e enviado diretamente para médicos ou familiares
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    onClick={handleShareWhatsApp}
                    disabled={isGenerating}
                    className="h-12 sm:h-14 rounded-xl border-green-300 hover:bg-green-100 hover:border-green-400 active:bg-green-200 dark:border-green-700 dark:hover:bg-green-900 dark:active:bg-green-800 group transition-all duration-200 touch-manipulation disabled:opacity-50"
                    data-testid="button-share-whatsapp"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600 animate-spin" />
                    ) : (
                      <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600 group-hover:text-green-700" />
                    )}
                    <span className="text-green-700 dark:text-green-300 text-sm sm:text-base font-medium">
                      {isGenerating ? 'Gerando...' : 'WhatsApp'}
                    </span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleShareEmail}
                    disabled={isGenerating}
                    className="h-12 sm:h-14 rounded-xl border-blue-300 hover:bg-blue-100 hover:border-blue-400 active:bg-blue-200 dark:border-blue-700 dark:hover:bg-blue-900 dark:active:bg-blue-800 group transition-all duration-200 touch-manipulation disabled:opacity-50"
                    data-testid="button-share-email"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600 group-hover:text-blue-700" />
                    )}
                    <span className="text-blue-700 dark:text-blue-300 text-sm sm:text-base font-medium">
                      {isGenerating ? 'Gerando...' : 'Email'}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Informações sobre o conteúdo do relatório - compacta para mobile */}
        <Card className="shadow-lg border-0 bg-card/30 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            <h4 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6 flex items-center">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-muted-foreground" />
              Conteúdo do Relatório
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              {[
                "Registros do diário matinal e noturno",
                "Episódios de crises documentados",
                "Histórico de medicamentos",
                "Evolução dos níveis de dor",
                "Análise dos pontos de dor",
                "Resumo da adesão ao tratamento"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/40 transition-colors">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full mt-2 sm:mt-1.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Espaçamento inferior para mobile */}
        <div className="h-16 sm:h-8" />
      </div>
    </div>
  );
}