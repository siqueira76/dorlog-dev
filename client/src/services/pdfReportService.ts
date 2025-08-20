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
    this.checkPageBreak(30);
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += fontSize + 5;
  }

  private addSubtitle(subtitle: string, fontSize: number = 12) {
    this.checkPageBreak(20);
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(subtitle, this.margin, this.currentY);
    this.currentY += fontSize + 3;
  }

  private addText(text: string, fontSize: number = 10, indent: number = 0) {
    this.checkPageBreak(15);
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'normal');
    
    const maxWidth = this.pageWidth - 2 * this.margin - indent;
    const lines = this.doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      this.checkPageBreak();
      this.doc.text(line, this.margin + indent, this.currentY);
      this.currentY += fontSize + 2;
    });
  }

  private addSeparator() {
    this.checkPageBreak(10);
    this.doc.setDrawColor(200);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
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
    // App logo/title
    this.doc.setFillColor(59, 130, 246); // Blue-600
    this.doc.rect(this.margin, 10, this.pageWidth - 2 * this.margin, 30, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('DorLog - Relatório de Saúde', this.margin + 10, 25);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Gestão Inteligente da Sua Saúde', this.margin + 10, 35);
    
    this.currentY = 50;
    
    // Report period
    this.doc.setTextColor(0, 0, 0);
    this.addText(`Período: ${format(reportData.periodStart, 'dd/MM/yyyy', { locale: ptBR })} - ${format(reportData.periodEnd, 'dd/MM/yyyy', { locale: ptBR })}`);
    this.addText(`Usuário: ${reportData.userEmail}`);
    this.addText(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`);
    
    this.currentY += 10;
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

    this.addText(`• Dias com registros: ${totalDays}`);
    this.addText(`• Episódios de crise: ${crisisCount}`);
    this.addText(`• Diários matinais: ${morningQuizCount}`);
    this.addText(`• Diários noturnos: ${nightQuizCount}`);
    this.addText(`• Médicos cadastrados: ${reportData.doctors.length}`);
    this.addText(`• Medicamentos ativos: ${reportData.medications.length}`);
    
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

  private generatePainEvolution(reportData: ReportData) {
    const painData: Array<{ date: string; pain: number }> = [];
    
    reportData.dailyReports.forEach(report => {
      const nightQuizzes = report.quizzes.filter(q => q.tipo === 'noturno');
      nightQuizzes.forEach(quiz => {
        if (quiz.respostas && quiz.respostas['1'] !== undefined) {
          const painLevel = parseInt(quiz.respostas['1'], 10);
          if (!isNaN(painLevel)) {
            painData.push({
              date: format(report.date, 'dd/MM', { locale: ptBR }),
              pain: painLevel
            });
          }
        }
      });
    });

    if (painData.length === 0) return;
    
    this.addTitle('📈 Evolução da Dor', 14);
    
    // Calculate statistics
    const avgPain = painData.reduce((sum, d) => sum + d.pain, 0) / painData.length;
    const maxPain = Math.max(...painData.map(d => d.pain));
    const minPain = Math.min(...painData.map(d => d.pain));
    
    this.addText(`Intensidade média da dor: ${avgPain.toFixed(1)}/10`);
    this.addText(`Pico máximo de dor: ${maxPain}/10`);
    this.addText(`Menor nível registrado: ${minPain}/10`);
    this.addText(`Total de registros: ${painData.length}`);
    
    this.currentY += 10;
    
    // Simple text-based chart representation
    this.addSubtitle('Últimos Registros:', 11);
    painData.slice(-10).forEach(entry => {
      const barLength = Math.round((entry.pain / 10) * 20);
      const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
      this.addText(`${entry.date}: ${bar} (${entry.pain}/10)`, 9, 5);
    });
    
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
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100);
      
      // Footer text
      const footerY = this.pageHeight - 10;
      this.doc.text('DorLog - Gestão Inteligente da Sua Saúde', this.margin, footerY);
      this.doc.text(`Página ${i} de ${pageCount}`, this.pageWidth - this.margin - 30, footerY);
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
    this.generateSummary(reportData);
    this.generateDoctorsSection(reportData);
    this.generateMedicationsSection(reportData);
    this.generatePainEvolution(reportData);
    this.generatePainPoints(reportData);
    this.generateCrisisEpisodes(reportData);
    this.generateFooter();

    console.log('✅ Relatório PDF gerado com sucesso');
    
    return this.doc.output('blob');
  }
}