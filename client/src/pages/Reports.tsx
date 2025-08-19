import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Calendar, Download, AlertTriangle, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Reports() {
  const { currentUser } = useAuth();

  // Função para contar episódios de crise dos últimos 30 dias
  const fetchCrisisEpisodes = async (): Promise<number> => {
    if (!currentUser?.email) {
      return 0;
    }

    try {
      console.log('🔍 Buscando episódios de crise para:', currentUser.email);
      
      // Calcular data de 30 dias atrás
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo);
      
      console.log('📅 Filtro de data - últimos 30 dias desde:', thirtyDaysAgo.toISOString());
      
      // Buscar documentos por email apenas (evitando índice composto)
      // Os documentos têm ID no formato: {email}_{YYYY-MM-DD}
      const reportDiarioRef = collection(db, 'report_diario');
      
      // Estratégia 1: Buscar por documentos com prefixo do email
      // Como os IDs são {email}_{date}, vamos buscar todos do usuário
      const q = query(reportDiarioRef);
      
      const querySnapshot = await getDocs(q);
      let crisisCount = 0;
      let documentsChecked = 0;
      
      console.log('📄 Total de documentos encontrados:', querySnapshot.size);
      
      // Filtrar por email e data no cliente
      querySnapshot.forEach((doc) => {
        const docId = doc.id;
        const data = doc.data();
        
        // Verificar se o documento pertence ao usuário atual
        if (docId.startsWith(`${currentUser.email}_`) || data.usuarioId === currentUser.email || data.email === currentUser.email) {
          documentsChecked++;
          
          // Verificar se o documento está dentro dos últimos 30 dias
          const docData = data.data;
          if (docData && docData >= thirtyDaysAgoTimestamp) {
            console.log('📋 Documento válido encontrado:', docId, 'Data:', docData.toDate());
            
            if (data.quizzes && Array.isArray(data.quizzes)) {
              const emergencialQuizzes = data.quizzes.filter((quiz: any) => 
                quiz.tipo === 'emergencial'
              );
              console.log(`🚨 ${emergencialQuizzes.length} quiz(zes) emergencial(is) encontrado(s) em ${docId}`);
              crisisCount += emergencialQuizzes.length;
            }
          }
        }
      });
      
      console.log(`✅ Busca concluída. Documentos verificados: ${documentsChecked}, Crises encontradas: ${crisisCount}`);
      
      return crisisCount;
    } catch (error) {
      console.error('Erro ao contar episódios de crise:', error);
      return 0;
    }
  };

  // Função para verificar adesão ao diário
  const fetchDiaryAdherence = async (): Promise<{ daysSinceLastEntry: number; message: string; status: 'good' | 'warning' | 'danger' | 'empty' }> => {
    if (!currentUser?.email) {
      return { daysSinceLastEntry: 0, message: 'Usuário não autenticado', status: 'empty' };
    }

    try {
      console.log('📖 Verificando adesão ao diário para:', currentUser.email);
      
      const reportDiarioRef = collection(db, 'report_diario');
      const q = query(reportDiarioRef);
      
      const querySnapshot = await getDocs(q);
      let lastEntryDate: Date | null = null;
      let userDocuments = 0;
      
      // Encontrar a data do último registro do usuário
      querySnapshot.forEach((doc) => {
        const docId = doc.id;
        const data = doc.data();
        
        if (docId.startsWith(`${currentUser.email}_`) || data.usuarioId === currentUser.email || data.email === currentUser.email) {
          userDocuments++;
          const docData = data.data;
          if (docData) {
            const entryDate = docData.toDate();
            if (!lastEntryDate || entryDate > lastEntryDate) {
              lastEntryDate = entryDate;
            }
          }
        }
      });

      console.log(`📊 Documentos do usuário encontrados: ${userDocuments}`);
      console.log('📅 Último registro encontrado:', lastEntryDate?.toISOString());

      // Se não há registros
      if (!lastEntryDate || userDocuments === 0) {
        return {
          daysSinceLastEntry: 0,
          message: 'Você ainda não fez nenhum registro no Diário',
          status: 'empty'
        };
      }

      const today = new Date();
      const todayStr = today.toDateString();
      const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString();
      const lastEntryStr = lastEntryDate.toDateString();

      // Se o último registro é hoje
      if (lastEntryStr === todayStr) {
        return {
          daysSinceLastEntry: 0,
          message: 'Você está em dia com os registros no Diário',
          status: 'good'
        };
      }

      // Se o último registro foi ontem
      if (lastEntryStr === yesterdayStr) {
        return {
          daysSinceLastEntry: 1,
          message: 'Você ainda não fez nenhum registro hoje',
          status: 'warning'
        };
      }

      // Calcular dias desde o último registro
      const diffTime = today.getTime() - lastEntryDate.getTime();
      const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return {
        daysSinceLastEntry: daysSince,
        message: `${daysSince} ${daysSince === 1 ? 'dia' : 'dias'} sem registros`,
        status: daysSince > 7 ? 'danger' : 'warning'
      };

    } catch (error) {
      console.error('Erro ao verificar adesão ao diário:', error);
      return { daysSinceLastEntry: 0, message: 'Erro ao verificar registros', status: 'empty' };
    }
  };

  // Query para buscar episódios de crise
  const { data: crisisEpisodes, isLoading: isLoadingCrisis } = useQuery({
    queryKey: ['crisis-episodes', currentUser?.email],
    queryFn: fetchCrisisEpisodes,
    enabled: !!currentUser?.email,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para verificar adesão ao diário
  const { data: diaryAdherence, isLoading: isLoadingDiary } = useQuery({
    queryKey: ['diary-adherence', currentUser?.email],
    queryFn: fetchDiaryAdherence,
    enabled: !!currentUser?.email,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

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
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            </div>
            <div className="text-2xl font-bold text-red-600 mb-1" data-testid="text-crisis-episodes">
              {isLoadingCrisis ? '...' : (crisisEpisodes || 0)}
            </div>
            <p className="text-sm text-muted-foreground">Episódios de Crise</p>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-border">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className={`h-5 w-5 mr-2 ${
                diaryAdherence?.status === 'good' ? 'text-green-500' :
                diaryAdherence?.status === 'warning' ? 'text-yellow-500' :
                diaryAdherence?.status === 'danger' ? 'text-red-500' :
                'text-gray-400'
              }`} />
            </div>
            <div className={`text-2xl font-bold mb-1 ${
              diaryAdherence?.status === 'good' ? 'text-green-600' :
              diaryAdherence?.status === 'warning' ? 'text-yellow-600' :
              diaryAdherence?.status === 'danger' ? 'text-red-600' :
              'text-gray-400'
            }`} data-testid="text-diary-adherence">
              {isLoadingDiary ? '...' : (diaryAdherence?.daysSinceLastEntry || 0)}
            </div>
            <p className="text-sm text-muted-foreground">Adesão ao Diário</p>
            <p className="text-xs text-muted-foreground leading-tight">
              {isLoadingDiary ? 'Verificando...' : (diaryAdherence?.message || 'Carregando...')}
            </p>
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
