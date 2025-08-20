import jsPDF from 'jspdf';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface QuizResponse {
  tipo: 'matinal' | 'noturno' | 'emergencial';
  respostas: Record<string, any>;
  timestamp: any;
}

interface ReportData {
  userEmail: string;
  periodStart: Date;
  periodEnd: Date;
  dailyReports: Array<{
    date: Date;
    quizzes: QuizResponse[];
    medications: any[];
  }>;
  doctors: any[];
  medications: any[];
}

interface PainPoint {
  point: string;
  count: number;
}

export class PDFReportService {
  private doc: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private currentY: number;
  private margin: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.currentY = 20;
    this.margin = 20;
  }

  private addFont() {
    // Use built-in fonts for better compatibility
    this.doc.setFont('helvetica');
  }

  private checkPageBreak(additionalHeight: number = 20) {
    if (this.currentY + additionalHeight > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private addTitle(title: string, fontSize: number = 16) {
    this.checkPageBreak(40);
    
    // Add section background
    const titleHeight = 25;
    this.doc.setFillColor(59, 130, 246, 0.05); // Light blue background
    this.doc.roundedRect(this.margin, this.currentY - 5, this.pageWidth - 2 * this.margin, titleHeight, 2, 2, 'F');
    
    // Add left accent line
    this.doc.setFillColor(59, 130, 246);
    this.doc.rect(this.margin, this.currentY - 5, 3, titleHeight, 'F');
    
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 64, 175); // Blue-800
    this.doc.text(title, this.margin + 10, this.currentY + 8);
    this.currentY += titleHeight + 5;
  }

  private addSubtitle(subtitle: string, fontSize: number = 12) {
    this.checkPageBreak(20);
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(51, 65, 85); // Gray-700
    this.doc.text(subtitle, this.margin, this.currentY);
    this.currentY += fontSize + 3;
  }

  private addText(text: string, fontSize: number = 10, indent: number = 0, color: number[] = [51, 65, 85]) {
    this.checkPageBreak(15);
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(color[0], color[1], color[2]); // Gray-700 default
    
    const maxWidth = this.pageWidth - 2 * this.margin - indent;
    const lines = this.doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      this.checkPageBreak();
      this.doc.text(line, this.margin + indent, this.currentY);
      this.currentY += fontSize + 2;
    });
  }

  private addSeparator() {
    this.checkPageBreak(15);
    
    // Styled separator with gradient effect
    const separatorY = this.currentY + 5;
    
    // Main separator line
    this.doc.setDrawColor(226, 232, 240); // Gray-200
    this.doc.setLineWidth(1);
    this.doc.line(this.margin + 20, separatorY, this.pageWidth - this.margin - 20, separatorY);
    
    // Center decorative element
    const centerX = this.pageWidth / 2;
    this.doc.setFillColor(59, 130, 246); // Blue-600
    this.doc.circle(centerX, separatorY, 2, 'F');
    
    this.currentY += 15;
  }

  private async fetchReportData(userEmail: string, periodValues: string[]): Promise<ReportData> {
    const reportData: ReportData = {
      userEmail,
      periodStart: new Date(),
      periodEnd: new Date(),
      dailyReports: [],
      doctors: [],
      medications: []
    };

    // Parse period dates
    const allDates = periodValues.map(period => {
      const [startStr, endStr] = period.split('_');
      return { start: new Date(startStr), end: new Date(endStr) };
    });
    
    reportData.periodStart = new Date(Math.min(...allDates.map(d => d.start.getTime())));
    reportData.periodEnd = new Date(Math.max(...allDates.map(d => d.end.getTime())));

    try {
      // Fetch daily reports
      const reportDiarioRef = collection(db, 'report_diario');
      const reportQuery = query(reportDiarioRef);
      const reportSnapshot = await getDocs(reportQuery);

      const startTimestamp = Timestamp.fromDate(reportData.periodStart);
      const endTimestamp = Timestamp.fromDate(reportData.periodEnd);

      reportSnapshot.forEach((doc) => {
        const docId = doc.id;
        const data = doc.data();
        
        if (docId.startsWith(`${userEmail}_`) || data.usuarioId === userEmail || data.email === userEmail) {
          const docData = data.data;
          if (docData && typeof docData.toDate === 'function') {
            const docDate = docData.toDate();
            if (docDate >= reportData.periodStart && docDate <= reportData.periodEnd) {
              reportData.dailyReports.push({
                date: docDate,
                quizzes: data.quizzes || [],
                medications: data.medicamentos || []
              });
            }
          }
        }
      });

      // Fetch doctors
      const medicosRef = collection(db, 'medicos');
      const medicosQuery = query(medicosRef, where('usuarioId', '==', userEmail));
      const medicosSnapshot = await getDocs(medicosQuery);
      
      medicosSnapshot.forEach((doc) => {
        reportData.doctors.push({ id: doc.id, ...doc.data() });
      });

      // Fetch medications
      const medicamentosRef = collection(db, 'medicamentos');
      const medicamentosQuery = query(medicamentosRef, where('usuarioId', '==', userEmail));
      const medicamentosSnapshot = await getDocs(medicamentosQuery);
      
      medicamentosSnapshot.forEach((doc) => {
        const medData = doc.data();
        const doctorName = reportData.doctors.find(d => d.id === medData.medicoId)?.nome || 'Médico não encontrado';
        reportData.medications.push({ 
          id: doc.id, 
          ...medData,
          doctorName 
        });
      });

      // Sort daily reports by date
      reportData.dailyReports.sort((a, b) => a.date.getTime() - b.date.getTime());

    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error);
    }

    return reportData;
  }

  private generateHeader(reportData: ReportData) {
    // Main header background with gradient effect (approximated with multiple rects)
    const headerHeight = 45;
    const startColor = [59, 130, 246]; // Blue-600
    const endColor = [37, 99, 235]; // Blue-700
    
    // Create gradient effect with multiple overlapping rectangles
    for (let i = 0; i < 10; i++) {
      const ratio = i / 9;
      const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * ratio);
      const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * ratio);
      const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * ratio);
      
      this.doc.setFillColor(r, g, b);
      const rectY = 10 + (headerHeight * i / 10);
      const rectHeight = headerHeight / 8;
      this.doc.rect(this.margin, rectY, this.pageWidth - 2 * this.margin, rectHeight, 'F');
    }
    
    // Logo area - create a rounded rectangle effect for logo background
    const logoSize = 28;
    const logoX = this.margin + 15;
    const logoY = 17;
    
    // Logo background (white circle)
    this.doc.setFillColor(255, 255, 255);
    this.doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 'F');
    
    // Logo shadow effect
    this.doc.setFillColor(0, 0, 0, 0.1);
    this.doc.circle(logoX + logoSize/2 + 1, logoY + logoSize/2 + 1, logoSize/2, 'F');
    this.doc.setFillColor(255, 255, 255);
    this.doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 'F');
    
    // Activity icon representation (simplified pulse/heartbeat)
    this.doc.setDrawColor(59, 130, 246);
    this.doc.setLineWidth(2);
    const iconCenterX = logoX + logoSize/2;
    const iconCenterY = logoY + logoSize/2;
    
    // Draw a simple activity/pulse line
    this.doc.line(iconCenterX - 8, iconCenterY, iconCenterX - 4, iconCenterY);
    this.doc.line(iconCenterX - 4, iconCenterY, iconCenterX - 2, iconCenterY - 6);
    this.doc.line(iconCenterX - 2, iconCenterY - 6, iconCenterX, iconCenterY + 6);
    this.doc.line(iconCenterX, iconCenterY + 6, iconCenterX + 2, iconCenterY - 4);
    this.doc.line(iconCenterX + 2, iconCenterY - 4, iconCenterX + 4, iconCenterY);
    this.doc.line(iconCenterX + 4, iconCenterY, iconCenterX + 8, iconCenterY);
    
    // App name and tagline
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(22);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('DorLog', logoX + logoSize + 15, 28);
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Gestão Inteligente da Sua Saúde', logoX + logoSize + 15, 40);
    
    // Report type badge
    const badgeText = 'RELATÓRIO DE SAÚDE';
    const badgeWidth = 50;
    const badgeHeight = 12;
    const badgeX = this.pageWidth - this.margin - badgeWidth - 10;
    const badgeY = 20;
    
    // Badge background
    this.doc.setFillColor(34, 197, 94); // Green-500
    this.doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 2, 2, 'F');
    
    // Badge text
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    const badgeTextWidth = this.doc.getTextWidth(badgeText);
    this.doc.text(badgeText, badgeX + (badgeWidth - badgeTextWidth) / 2, badgeY + 7);
    
    this.currentY = 65;
    
    // Report information card
    this.doc.setFillColor(248, 250, 252); // Gray-50
    this.doc.setDrawColor(226, 232, 240); // Gray-200
    this.doc.setLineWidth(0.5);
    const infoCardHeight = 35;
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, infoCardHeight, 3, 3, 'FD');
    
    // Report information
    this.doc.setTextColor(71, 85, 105); // Gray-600
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('PERÍODO DO RELATÓRIO', this.margin + 10, this.currentY + 10);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(15, 23, 42); // Gray-900
    const periodText = `${format(reportData.periodStart, 'dd/MM/yyyy', { locale: ptBR })} - ${format(reportData.periodEnd, 'dd/MM/yyyy', { locale: ptBR })}`;
    this.doc.text(periodText, this.margin + 10, this.currentY + 18);
    
    // User and generation info in two columns
    this.doc.setFontSize(9);
    this.doc.setTextColor(71, 85, 105); // Gray-600
    this.doc.text(`Usuário: ${reportData.userEmail}`, this.margin + 10, this.currentY + 28);
    
    const generationText = `Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`;
    const textWidth = this.doc.getTextWidth(generationText);
    this.doc.text(generationText, this.pageWidth - this.margin - textWidth - 10, this.currentY + 28);
    
    this.currentY += infoCardHeight + 15;
  }

  private generateSummary(reportData: ReportData) {
    this.addTitle('📊 Resumo Executivo', 14);
    
    const totalDays = reportData.dailyReports.length;
    const crisisCount = reportData.dailyReports.reduce((count, report) => {
      return count + report.quizzes.filter(q => q.tipo === 'emergencial').length;
    }, 0);
    
    const morningQuizCount = reportData.dailyReports.reduce((count, report) => {
      return count + report.quizzes.filter(q => q.tipo === 'matinal').length;
    }, 0);
    
    const nightQuizCount = reportData.dailyReports.reduce((count, report) => {
      return count + report.quizzes.filter(q => q.tipo === 'noturno').length;
    }, 0);

    // Summary cards layout
    const summaryItems = [
      { label: 'Dias com registros', value: totalDays, color: [34, 197, 94] }, // Green
      { label: 'Episódios de crise', value: crisisCount, color: [239, 68, 68] }, // Red
      { label: 'Diários matinais', value: morningQuizCount, color: [59, 130, 246] }, // Blue
      { label: 'Diários noturnos', value: nightQuizCount, color: [139, 69, 19] }, // Brown
      { label: 'Médicos cadastrados', value: reportData.doctors.length, color: [168, 85, 247] }, // Purple
      { label: 'Medicamentos ativos', value: reportData.medications.length, color: [245, 158, 11] } // Amber
    ];

    const cardWidth = (this.pageWidth - 2 * this.margin - 10) / 2; // Two columns
    const cardHeight = 20;
    let currentRow = 0;
    let currentCol = 0;

    summaryItems.forEach((item, index) => {
      const x = this.margin + (currentCol * (cardWidth + 5));
      const y = this.currentY;

      // Card background
      this.doc.setFillColor(item.color[0], item.color[1], item.color[2], 0.1);
      this.doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'F');

      // Value circle
      this.doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      this.doc.circle(x + 12, y + 10, 8, 'F');
      
      // Value text
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      const valueStr = item.value.toString();
      const valueWidth = this.doc.getTextWidth(valueStr);
      this.doc.text(valueStr, x + 12 - valueWidth/2, y + 12);

      // Label text
      this.doc.setTextColor(51, 65, 85); // Gray-700
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(item.label, x + 25, y + 12);

      currentCol = (currentCol + 1) % 2;
      if (currentCol === 0) {
        currentRow++;
        this.currentY += cardHeight + 5;
      }
    });

    if (currentCol === 1) {
      this.currentY += cardHeight + 5;
    }

    this.addSeparator();
  }

  private generateDoctorsSection(reportData: ReportData) {
    if (reportData.doctors.length === 0) return;
    
    this.addTitle('👩‍⚕️ Equipe Médica', 14);
    
    reportData.doctors.forEach((doctor, index) => {
      this.addSubtitle(`${index + 1}. ${doctor.nome}`);
      this.addText(`Especialidade: ${doctor.especialidade}`, 10, 10);
      this.addText(`CRM: ${doctor.crm}`, 10, 10);
      if (doctor.contato) {
        this.addText(`Contato: ${doctor.contato}`, 10, 10);
      }
      this.currentY += 5;
    });
    
    this.addSeparator();
  }

  private generateMedicationsSection(reportData: ReportData) {
    if (reportData.medications.length === 0) return;
    
    this.addTitle('💊 Medicamentos Prescritos', 14);
    
    reportData.medications.forEach((medication, index) => {
      this.addSubtitle(`${index + 1}. ${medication.nome}`);
      this.addText(`Dosagem: ${medication.dosagem}`, 10, 10);
      this.addText(`Frequência: ${medication.frequencia}`, 10, 10);
      this.addText(`Médico: ${medication.doctorName}`, 10, 10);
      if (medication.observacoes) {
        this.addText(`Observações: ${medication.observacoes}`, 10, 10);
      }
      this.currentY += 5;
    });
    
    this.addSeparator();
  }

  private generatePainEvolutionCard(reportData: ReportData) {
    const painData: Array<{ date: string; pain: number; dateStr: string }> = [];
    
    reportData.dailyReports.forEach(report => {
      const nightQuizzes = report.quizzes.filter(q => q.tipo === 'noturno');
      nightQuizzes.forEach(quiz => {
        if (quiz.respostas && quiz.respostas['1'] !== undefined) {
          const painLevel = parseInt(quiz.respostas['1'], 10);
          if (!isNaN(painLevel)) {
            painData.push({
              date: format(report.date, 'yyyy-MM-dd'),
              pain: painLevel,
              dateStr: format(report.date, 'dd/MM', { locale: ptBR })
            });
          }
        }
      });
    });

    // Always show the card, even with no data
    this.addTitle('📈 Evolução da Dor', 16);
    
    // Card description
    this.addText('Evolução da intensidade da dor nos últimos 30 dias', 11, 0, [107, 114, 128]);
    
    this.currentY += 5;
    
    if (painData.length === 0) {
      // Empty state card
      const emptyCardHeight = 80;
      this.doc.setFillColor(249, 250, 251); // Gray-50
      this.doc.setDrawColor(229, 231, 235); // Gray-200
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, emptyCardHeight, 5, 5, 'FD');
      
      // Empty state icon and text
      this.doc.setTextColor(156, 163, 175); // Gray-400
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('📈 Sem dados disponíveis', this.pageWidth / 2 - 35, this.currentY + 30);
      this.doc.setFontSize(10);
      this.doc.text('Complete alguns diários noturnos para ver sua evolução', this.pageWidth / 2 - 65, this.currentY + 45);
      
      this.currentY += emptyCardHeight + 15;
    } else {
      // Sort data by date
      painData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calculate statistics
      const avgPain = painData.reduce((sum, d) => sum + d.pain, 0) / painData.length;
      const maxPain = Math.max(...painData.map(d => d.pain));
      const minPain = Math.min(...painData.map(d => d.pain));
      
      // Header info badge
      const badgeText = `${painData.length} registros nos últimos 30 dias`;
      const badgeWidth = this.doc.getTextWidth(badgeText) + 20;
      const badgeX = (this.pageWidth - badgeWidth) / 2;
      
      this.doc.setFillColor(248, 250, 252); // Gray-50
      this.doc.setDrawColor(226, 232, 240); // Gray-200
      this.doc.roundedRect(badgeX, this.currentY, badgeWidth, 12, 6, 6, 'FD');
      
      this.doc.setTextColor(71, 85, 105); // Gray-600
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(badgeText, badgeX + 10, this.currentY + 7);
      
      this.currentY += 20;
      
      // Chart area background
      const chartHeight = 120;
      const chartWidth = this.pageWidth - 2 * this.margin;
      
      this.doc.setFillColor(255, 255, 255);
      this.doc.setDrawColor(226, 232, 240); // Gray-200
      this.doc.roundedRect(this.margin, this.currentY, chartWidth, chartHeight, 3, 3, 'FD');
      
      // Chart grid lines
      this.doc.setDrawColor(226, 232, 240, 0.3);
      this.doc.setLineWidth(0.5);
      
      // Horizontal grid lines (pain levels 0-10)
      for (let i = 0; i <= 10; i += 2) {
        const y = this.currentY + chartHeight - (i / 10 * (chartHeight - 20)) - 10;
        this.doc.line(this.margin + 30, y, this.margin + chartWidth - 20, y);
        
        // Y-axis labels
        this.doc.setTextColor(100, 116, 139); // Gray-500
        this.doc.setFontSize(8);
        this.doc.text(i.toString(), this.margin + 25, y + 2);
      }
      
      // Draw data points and lines
      const plotWidth = chartWidth - 50;
      const plotHeight = chartHeight - 30;
      const pointSpacing = plotWidth / Math.max(painData.length - 1, 1);
      
      this.doc.setDrawColor(59, 130, 246); // Blue-600
      this.doc.setLineWidth(2);
      
      // Draw connecting lines
      for (let i = 0; i < painData.length - 1; i++) {
        const x1 = this.margin + 30 + (i * pointSpacing);
        const y1 = this.currentY + chartHeight - (painData[i].pain / 10 * plotHeight) - 15;
        const x2 = this.margin + 30 + ((i + 1) * pointSpacing);
        const y2 = this.currentY + chartHeight - (painData[i + 1].pain / 10 * plotHeight) - 15;
        
        this.doc.line(x1, y1, x2, y2);
      }
      
      // Draw data points
      this.doc.setFillColor(59, 130, 246); // Blue-600
      painData.forEach((point, index) => {
        const x = this.margin + 30 + (index * pointSpacing);
        const y = this.currentY + chartHeight - (point.pain / 10 * plotHeight) - 15;
        
        // Outer circle (white border)
        this.doc.setFillColor(255, 255, 255);
        this.doc.circle(x, y, 4, 'F');
        
        // Inner circle (blue fill)
        this.doc.setFillColor(59, 130, 246);
        this.doc.circle(x, y, 3, 'F');
        
        // Date labels (only for some points to avoid crowding)
        if (painData.length <= 10 || index % Math.ceil(painData.length / 6) === 0 || index === painData.length - 1) {
          this.doc.setTextColor(100, 116, 139);
          this.doc.setFontSize(7);
          this.doc.setFont('helvetica', 'normal');
          const dateWidth = this.doc.getTextWidth(point.dateStr);
          this.doc.text(point.dateStr, x - dateWidth/2, this.currentY + chartHeight + 5);
        }
      });
      
      this.currentY += chartHeight + 15;
      
      // Chart legend and statistics
      const statsCardHeight = 30;
      this.doc.setFillColor(248, 250, 252); // Gray-50
      this.doc.setDrawColor(226, 232, 240); // Gray-200
      this.doc.roundedRect(this.margin, this.currentY, chartWidth, statsCardHeight, 3, 3, 'FD');
      
      // Legend
      this.doc.setFillColor(59, 130, 246);
      this.doc.rect(this.margin + 10, this.currentY + 10, 12, 2, 'F');
      this.doc.setTextColor(71, 85, 105);
      this.doc.setFontSize(9);
      this.doc.text('Intensidade da dor', this.margin + 28, this.currentY + 12);
      
      // Statistics
      const avgText = `Média: ${avgPain.toFixed(1)}/10`;
      const maxText = `Máx: ${maxPain}/10`;
      const minText = `Mín: ${minPain}/10`;
      
      this.doc.setTextColor(59, 130, 246); // Blue-600
      this.doc.setFont('helvetica', 'bold');
      
      const statsStartX = this.margin + 120;
      this.doc.text(avgText, statsStartX, this.currentY + 12);
      this.doc.text(maxText, statsStartX + 60, this.currentY + 12);
      this.doc.text(minText, statsStartX + 100, this.currentY + 12);
      
      this.currentY += statsCardHeight + 10;
    }
    
    this.addSeparator();
  }

  private generatePainPoints(reportData: ReportData) {
    const painPoints: Record<string, number> = {};
    
    reportData.dailyReports.forEach(report => {
      report.quizzes.forEach(quiz => {
        if (quiz.respostas) {
          // Look for pain point questions (commonly question 4 in morning/night quizzes)
          Object.keys(quiz.respostas).forEach(questionKey => {
            const answer = quiz.respostas[questionKey];
            if (typeof answer === 'string' && answer.includes('dor') || 
                typeof answer === 'string' && (answer.includes('cabeça') || answer.includes('costas') || 
                answer.includes('braço') || answer.includes('perna') || answer.includes('lombar'))) {
              painPoints[answer] = (painPoints[answer] || 0) + 1;
            }
          });
        }
      });
    });

    const sortedPoints = Object.entries(painPoints)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    if (sortedPoints.length === 0) return;
    
    this.addTitle('🎯 Pontos de Dor Mais Frequentes', 14);
    
    sortedPoints.forEach(([point, count], index) => {
      this.addText(`${index + 1}. ${point}: ${count} ocorrências`);
    });
    
    this.addSeparator();
  }

  private generateCrisisEpisodes(reportData: ReportData) {
    const crisisReports = reportData.dailyReports.filter(report => 
      report.quizzes.some(q => q.tipo === 'emergencial')
    );

    if (crisisReports.length === 0) return;
    
    this.addTitle('🚨 Episódios de Crise', 14);
    
    crisisReports.forEach(report => {
      const crisisQuizzes = report.quizzes.filter(q => q.tipo === 'emergencial');
      
      this.addSubtitle(`${format(report.date, 'dd/MM/yyyy', { locale: ptBR })} - ${crisisQuizzes.length} episódio(s)`);
      
      crisisQuizzes.forEach((quiz, index) => {
        this.addText(`Episódio ${index + 1}:`, 10, 5);
        if (quiz.respostas) {
          Object.keys(quiz.respostas).forEach(questionKey => {
            const answer = quiz.respostas[questionKey];
            if (answer !== undefined && answer !== '') {
              this.addText(`• ${answer}`, 9, 15);
            }
          });
        }
      });
      this.currentY += 5;
    });
    
    this.addSeparator();
  }

  private generateFooter() {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Footer background
      const footerHeight = 15;
      const footerY = this.pageHeight - footerHeight - 5;
      
      this.doc.setFillColor(248, 250, 252); // Gray-50
      this.doc.rect(this.margin, footerY, this.pageWidth - 2 * this.margin, footerHeight, 'F');
      
      // Footer border
      this.doc.setDrawColor(226, 232, 240); // Gray-200
      this.doc.setLineWidth(0.5);
      this.doc.line(this.margin, footerY, this.pageWidth - this.margin, footerY);
      
      // Footer content
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(107, 114, 128); // Gray-500
      
      // Left side - App name
      this.doc.text('DorLog - Gestão Inteligente da Sua Saúde', this.margin + 5, footerY + 8);
      
      // Center - Generation timestamp
      const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR });
      const centerText = `Gerado em ${timestamp}`;
      const centerTextWidth = this.doc.getTextWidth(centerText);
      this.doc.text(centerText, (this.pageWidth - centerTextWidth) / 2, footerY + 8);
      
      // Right side - Page number
      const pageText = `${i}/${pageCount}`;
      const pageTextWidth = this.doc.getTextWidth(pageText);
      this.doc.text(pageText, this.pageWidth - this.margin - pageTextWidth - 5, footerY + 8);
    }
  }

  public async generateReport(userEmail: string, periodValues: string[]): Promise<Blob> {
    console.log('🔄 Iniciando geração do relatório PDF...');
    console.log('📧 Usuário:', userEmail);
    console.log('📅 Períodos:', periodValues);

    this.addFont();
    
    const reportData = await this.fetchReportData(userEmail, periodValues);
    console.log('📊 Dados coletados:', {
      dailyReports: reportData.dailyReports.length,
      doctors: reportData.doctors.length,
      medications: reportData.medications.length
    });

    this.generateHeader(reportData);
    this.generatePainEvolutionCard(reportData);
    this.generateSummary(reportData);
    this.generateDoctorsSection(reportData);
    this.generateMedicationsSection(reportData);
    this.generatePainPoints(reportData);
    this.generateCrisisEpisodes(reportData);
    this.generateFooter();

    console.log('✅ Relatório PDF gerado com sucesso');
    
    return this.doc.output('blob');
  }
}