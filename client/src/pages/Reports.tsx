import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Calendar, Download, AlertTriangle, MapPin, BookOpen } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Reports() {
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();

  // Função para buscar episódios de crise
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
      
      const reportDiarioRef = collection(db, 'report_diario');
      const q = query(reportDiarioRef);
      
      const querySnapshot = await getDocs(q);
      console.log('📄 Total de documentos encontrados:', querySnapshot.docs.length);
      
      let crisisCount = 0;
      let documentsChecked = 0;
      
      querySnapshot.forEach((doc) => {
        const docId = doc.id;
        const data = doc.data();
        
        // Verificar se o documento pertence ao usuário atual
        if (docId.startsWith(`${currentUser.email}_`) || data.usuarioId === currentUser.email || data.email === currentUser.email) {
          
          // Verificar se o documento está dentro dos últimos 30 dias
          const docData = data.data;
          if (docData && typeof docData.toDate === 'function' && docData >= thirtyDaysAgoTimestamp) {
            documentsChecked++;
            console.log('📋 Documento válido encontrado:', docId, 'Data:', docData.toDate().toISOString());
            
            // Contar quizzes do tipo 'emergencial'
            if (data.quizzes && Array.isArray(data.quizzes)) {
              const emergencyQuizzes = data.quizzes.filter((quiz: any) => quiz.tipo === 'emergencial');
              console.log(`🚨 ${emergencyQuizzes.length} quiz(zes) emergencial(is) encontrado(s) em ${docId}`);
              crisisCount += emergencyQuizzes.length;
            }
          }
        }
      });
      
      console.log(`✅ Busca concluída. Documentos verificados: ${documentsChecked}, Crises encontradas: ${crisisCount}`);
      return crisisCount;
    } catch (error) {
      console.error('Erro ao buscar episódios de crise:', error);
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
          if (docData && typeof docData.toDate === 'function') {
            const entryDate = docData.toDate();
            if (!lastEntryDate || entryDate > lastEntryDate) {
              lastEntryDate = entryDate;
            }
          }
        }
      });

      console.log(`📊 Documentos do usuário encontrados: ${userDocuments}`);
      console.log('📅 Último registro encontrado:', lastEntryDate?.toISOString() ?? null);

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
      const lastEntryStr = lastEntryDate?.toDateString() ?? '';

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
      const diffTime = today.getTime() - (lastEntryDate ? lastEntryDate.getTime() : 0);
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

  // Função para buscar pontos de dor (resposta 2 dos quizzes noturnos)
  const fetchPainPoints = async (): Promise<Array<{ point: string; count: number }>> => {
    if (!currentUser?.email) {
      return [];
    }

    try {
      console.log('🎯 Buscando pontos de dor para:', currentUser.email);
      
      // Calcular data de 30 dias atrás
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo);
      
      const reportDiarioRef = collection(db, 'report_diario');
      const q = query(reportDiarioRef);
      
      const querySnapshot = await getDocs(q);
      const painPointsCount: { [key: string]: number } = {};
      
      // Processar documentos e extrair pontos de dor
      querySnapshot.forEach((doc) => {
        const docId = doc.id;
        const data = doc.data();
        
        // Verificar se o documento pertence ao usuário atual
        if (docId.startsWith(`${currentUser.email}_`) || data.usuarioId === currentUser.email || data.email === currentUser.email) {
          // Verificar se o documento está dentro dos últimos 30 dias
          const docData = data.data;
          if (docData && typeof docData.toDate === 'function' && docData >= thirtyDaysAgoTimestamp) {
            
            // Procurar por quizzes do tipo 'noturno'
            if (data.quizzes && Array.isArray(data.quizzes)) {
              const nightQuizzes = data.quizzes.filter((quiz: any) => quiz.tipo === 'noturno');
              
              nightQuizzes.forEach((quiz: any) => {
                // Obter resposta da pergunta 2 (pontos de dor)
                if (quiz.respostas && quiz.respostas['2'] !== undefined) {
                  const painPoints = quiz.respostas['2'];
                  
                  // Se a resposta é um array, processar cada item
                  if (Array.isArray(painPoints)) {
                    painPoints.forEach((point: string) => {
                      if (point && point.trim() !== '') {
                        const pointName = point.trim();
                        painPointsCount[pointName] = (painPointsCount[pointName] || 0) + 1;
                      }
                    });
                  } else if (typeof painPoints === 'string' && painPoints.trim() !== '') {
                    // Se a resposta é uma string única
                    const pointName = painPoints.trim();
                    painPointsCount[pointName] = (painPointsCount[pointName] || 0) + 1;
                  }
                }
              });
            }
          }
        }
      });
      
      // Converter para array e ordenar por frequência
      const painPointsArray = Object.entries(painPointsCount)
        .map(([point, count]) => ({ point, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8); // Limitar aos 8 pontos mais frequentes
      
      console.log(`🎯 Pontos de dor encontrados: ${painPointsArray.length} diferentes`);
      console.log('📊 Amostra dos dados:', painPointsArray.slice(0, 3));
      
      return painPointsArray;
    } catch (error) {
      console.error('Erro ao buscar pontos de dor:', error);
      return [];
    }
  };

  // Função para buscar dados de evolução da dor (quizzes noturnos)
  const fetchPainEvolution = async (): Promise<Array<{ date: string; pain: number; dateStr: string }>> => {
    if (!currentUser?.email) {
      return [];
    }

    try {
      console.log('📊 Buscando evolução da dor para:', currentUser.email);
      
      // Calcular data de 30 dias atrás
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo);
      
      const reportDiarioRef = collection(db, 'report_diario');
      const q = query(reportDiarioRef);
      
      const querySnapshot = await getDocs(q);
      const painData: Array<{ date: string; pain: number; dateStr: string }> = [];
      
      // Processar documentos e extrair dados de dor
      querySnapshot.forEach((doc) => {
        const docId = doc.id;
        const data = doc.data();
        
        // Verificar se o documento pertence ao usuário atual
        if (docId.startsWith(`${currentUser.email}_`) || data.usuarioId === currentUser.email || data.email === currentUser.email) {
          // Verificar se o documento está dentro dos últimos 30 dias
          const docData = data.data;
          if (docData && typeof docData.toDate === 'function' && docData >= thirtyDaysAgoTimestamp) {
            
            // Procurar por quizzes do tipo 'noturno'
            if (data.quizzes && Array.isArray(data.quizzes)) {
              const nightQuizzes = data.quizzes.filter((quiz: any) => quiz.tipo === 'noturno');
              
              nightQuizzes.forEach((quiz: any) => {
                // Obter resposta da pergunta 1 (intensidade da dor)
                if (quiz.respostas && quiz.respostas['1'] !== undefined) {
                  const painIntensity = parseInt(quiz.respostas['1'], 10);
                  if (!isNaN(painIntensity)) {
                    const entryDate = docData.toDate();
                    const dateStr = entryDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                    const isoDate = entryDate.toISOString().split('T')[0];
                    
                    painData.push({
                      date: isoDate,
                      pain: painIntensity,
                      dateStr: dateStr
                    });
                  }
                }
              });
            }
          }
        }
      });
      
      // Ordenar por data e remover duplicatas (manter o último registro do dia)
      const uniquePainData = painData
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .reduce((acc, current) => {
          const existingIndex = acc.findIndex(item => item.date === current.date);
          if (existingIndex >= 0) {
            acc[existingIndex] = current; // Substituir pelo mais recente
          } else {
            acc.push(current);
          }
          return acc;
        }, [] as Array<{ date: string; pain: number; dateStr: string }>);
      
      console.log(`📈 Dados de evolução da dor encontrados: ${uniquePainData.length} registros`);
      console.log('📊 Amostra dos dados:', uniquePainData.slice(0, 3));
      
      return uniquePainData;
    } catch (error) {
      console.error('Erro ao buscar evolução da dor:', error);
      return [];
    }
  };

  // Queries para buscar dados
  const { data: crisisEpisodes, isLoading: isLoadingCrisis } = useQuery({
    queryKey: ['crisis-episodes', currentUser?.email],
    queryFn: fetchCrisisEpisodes,
    enabled: !!currentUser?.email,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const { data: diaryAdherence, isLoading: isLoadingDiary } = useQuery({
    queryKey: ['diary-adherence', currentUser?.email],
    queryFn: fetchDiaryAdherence,
    enabled: !!currentUser?.email,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const { data: painPoints, isLoading: isLoadingPainPoints } = useQuery({
    queryKey: ['pain-points', currentUser?.email],
    queryFn: fetchPainPoints,
    enabled: !!currentUser?.email,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const { data: painEvolution, isLoading: isLoadingEvolution } = useQuery({
    queryKey: ['pain-evolution', currentUser?.email],
    queryFn: fetchPainEvolution,
    enabled: !!currentUser?.email,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return (
    <div className="p-4 pb-20 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <Button
            onClick={() => setLocation('/reports/monthly')}
            className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            data-testid="button-generate-pdf-report"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Gerar Relatorio Mensal</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
        <p className="text-muted-foreground">
          Acompanhe sua evolução e padrões de saúde
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="shadow-sm border border-border">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
            </div>
            <div className="text-xl font-bold mb-1 text-red-600" data-testid="text-crisis-episodes">
              {isLoadingCrisis ? '...' : (crisisEpisodes || 0)}
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-tight">Episódios de Crise</p>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-border">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className={`h-4 w-4 mr-1 ${
                diaryAdherence?.status === 'good' ? 'text-green-500' :
                diaryAdherence?.status === 'warning' ? 'text-yellow-500' :
                diaryAdherence?.status === 'danger' ? 'text-red-500' :
                'text-gray-400'
              }`} />
            </div>
            <div className={`text-xl font-bold mb-1 ${
              diaryAdherence?.status === 'good' ? 'text-green-600' :
              diaryAdherence?.status === 'warning' ? 'text-yellow-600' :
              diaryAdherence?.status === 'danger' ? 'text-red-600' :
              'text-gray-400'
            }`} data-testid="text-diary-adherence">
              {isLoadingDiary ? '...' : (diaryAdherence?.daysSinceLastEntry || 0)}
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-tight">Adesão ao Diário</p>
            <p className="text-xs text-muted-foreground leading-tight">
              {isLoadingDiary ? 'Verificando...' : (diaryAdherence?.message || 'Carregando...')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução da Dor */}
        <Card className="shadow-sm border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              Evolução da Dor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Evolução da intensidade da dor nos últimos 30 dias
            </p>
            {isLoadingEvolution ? (
              <div className="bg-muted rounded-xl p-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50 animate-pulse" />
                <p className="text-sm text-muted-foreground">
                  Carregando dados...
                </p>
              </div>
            ) : !painEvolution || painEvolution.length === 0 ? (
              <div className="bg-muted rounded-xl p-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Complete alguns diários noturnos para ver sua evolução
                </p>
              </div>
            ) : (
              <div className="h-80 w-full p-3">
                {/* Header info */}
                <div className="mb-4 text-center">
                  <span className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                    {painEvolution?.length || 0} registros nos últimos 30 dias
                  </span>
                </div>
                
                <ResponsiveContainer width="100%" height="70%">
                  <LineChart
                    data={painEvolution}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid 
                      strokeDasharray="1 3" 
                      stroke="#e2e8f0" 
                      strokeOpacity={0.3}
                      horizontal={true}
                      vertical={false}
                    />
                    
                    <XAxis 
                      dataKey="dateStr" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ 
                        fontSize: 11, 
                        fill: '#64748b',
                        fontWeight: 500
                      }}
                      dy={10}
                    />
                    
                    <YAxis 
                      domain={[0, 10]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ 
                        fontSize: 11, 
                        fill: '#64748b',
                        fontWeight: 500
                      }}
                      dx={-10}
                      label={{ 
                        value: 'Dor (0-10)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { 
                          textAnchor: 'middle', 
                          fontSize: '10px', 
                          fill: '#64748b',
                          fontWeight: 500
                        }
                      }}
                    />
                    
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        padding: '8px 12px',
                        backdropFilter: 'blur(8px)'
                      }}
                      labelStyle={{ 
                        color: '#1e293b',
                        fontWeight: 600,
                        fontSize: '12px',
                        marginBottom: '2px'
                      }}
                      formatter={(value: number) => [
                        <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '14px' }}>
                          {value}/10
                        </span>, 
                        'Dor'
                      ]}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    
                    <Line 
                      type="monotone" 
                      dataKey="pain" 
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{
                        fill: '#3b82f6',
                        strokeWidth: 2,
                        stroke: '#ffffff',
                        r: 5
                      }}
                      activeDot={{
                        r: 6,
                        stroke: '#3b82f6',
                        strokeWidth: 2,
                        fill: '#ffffff'
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                
                {/* Legenda e estatísticas */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <div className="w-3 h-0.5 bg-blue-500 rounded"></div>
                      <span>Intensidade da dor</span>
                    </div>
                    {painEvolution && painEvolution.length > 0 && (
                      <div className="text-xs text-slate-600">
                        Média: <span className="font-semibold text-blue-600">
                          {(painEvolution.reduce((sum, item) => sum + item.pain, 0) / painEvolution.length).toFixed(1)}/10
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pontos de Dor */}
        <Card className="shadow-sm border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <MapPin className="h-5 w-5 mr-2 text-orange-500" />
              Pontos de Dor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Frequência dos pontos de dor relatados nos últimos 30 dias
            </p>
            {isLoadingPainPoints ? (
              <div className="bg-muted rounded-xl p-6 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50 animate-pulse" />
                <p className="text-sm text-muted-foreground">
                  Carregando dados...
                </p>
              </div>
            ) : !painPoints || painPoints.length === 0 ? (
              <div className="bg-muted rounded-xl p-6 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Complete alguns diários noturnos para ver os pontos de dor
                </p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={painPoints}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid 
                      strokeDasharray="1 3" 
                      stroke="#e2e8f0" 
                      strokeOpacity={0.3}
                      horizontal={true}
                      vertical={false}
                    />
                    
                    <XAxis 
                      dataKey="point" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ 
                        fontSize: 10, 
                        fill: '#64748b',
                        fontWeight: 500
                      }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ 
                        fontSize: 11, 
                        fill: '#64748b',
                        fontWeight: 500
                      }}
                      dx={-10}
                      label={{ 
                        value: 'Frequência', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { 
                          textAnchor: 'middle', 
                          fontSize: '10px', 
                          fill: '#64748b',
                          fontWeight: 500
                        }
                      }}
                    />
                    
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        padding: '8px 12px',
                        backdropFilter: 'blur(8px)'
                      }}
                      labelStyle={{ 
                        color: '#1e293b',
                        fontWeight: 600,
                        fontSize: '12px',
                        marginBottom: '2px'
                      }}
                      formatter={(value: number) => [
                        <span style={{ color: '#f97316', fontWeight: 700, fontSize: '14px' }}>
                          {value}x
                        </span>, 
                        'Relatado'
                      ]}
                      labelFormatter={(label) => label}
                    />
                    
                    <Bar 
                      dataKey="count" 
                      fill="#f97316"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo Mensal */}
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
              onClick={() => setLocation('/reports/monthly')}
            >
              Gerar Relatório Mensal
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}