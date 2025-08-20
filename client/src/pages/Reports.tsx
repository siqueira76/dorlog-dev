import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Calendar, Download, AlertTriangle, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
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
          if (docData && typeof docData.toDate === 'function') {
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
      const lastEntryStr = lastEntryDate?.toDateString() || '';

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
      const diffTime = today.getTime() - (lastEntryDate?.getTime() || 0);
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

  // Query para buscar pontos de dor
  const { data: painPoints, isLoading: isLoadingPainPoints } = useQuery({
    queryKey: ['pain-points', currentUser?.email],
    queryFn: fetchPainPoints,
    enabled: !!currentUser?.email,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

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
            const entryDate = docData.toDate();
            
            // Procurar por quizzes do tipo 'noturno'
            if (data.quizzes && Array.isArray(data.quizzes)) {
              const nightQuizzes = data.quizzes.filter((quiz: any) => quiz.tipo === 'noturno');
              
              nightQuizzes.forEach((quiz: any) => {
                // Obter resposta da pergunta 1 (intensidade da dor)
                if (quiz.respostas && quiz.respostas['1'] !== undefined) {
                  const painLevel = Number(quiz.respostas['1']);
                  if (!isNaN(painLevel)) {
                    painData.push({
                      date: entryDate.toISOString().split('T')[0], // YYYY-MM-DD
                      dateStr: entryDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                      pain: painLevel
                    });
                  }
                }
              });
            }
          }
        }
      });
      
      // Ordenar por data
      painData.sort((a, b) => a.date.localeCompare(b.date));
      
      console.log(`📈 Dados de evolução da dor encontrados: ${painData.length} registros`);
      console.log('📊 Amostra dos dados:', painData.slice(0, 3));
      
      return painData;
    } catch (error) {
      console.error('Erro ao buscar evolução da dor:', error);
      return [];
    }
  };

  // Query para buscar evolução da dor
  const { data: painEvolution, isLoading: isLoadingPain } = useQuery({
    queryKey: ['pain-evolution', currentUser?.email],
    queryFn: fetchPainEvolution,
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
              <MapPin className="h-5 w-5 mr-2 text-orange-500" />
            </div>
            <div className="text-2xl font-bold mb-1 text-orange-600" data-testid="text-pain-points">
              {isLoadingPainPoints ? '...' : (painPoints?.length || 0)}
            </div>
            <p className="text-sm text-muted-foreground">Pontos de Dor</p>
            <p className="text-xs text-muted-foreground leading-tight">
              {isLoadingPainPoints ? 'Carregando...' : 
                painPoints && painPoints.length > 0 ? 
                  `${painPoints[0].point} (${painPoints[0].count}x)` : 
                  'Nenhum ponto registrado'
              }
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
              Acompanhe a intensidade da sua dor baseada nos diários noturnos (últimos 30 dias)
            </p>
            {isLoadingPain ? (
              <div className="bg-muted rounded-xl p-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50 animate-pulse" />
                <p className="text-sm text-muted-foreground">
                  Carregando dados...
                </p>
              </div>
            ) : !painEvolution || painEvolution.length === 0 ? (
              <div className="bg-muted rounded-xl p-6 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
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
                      left: 30,
                      bottom: 15,
                    }}
                  >
                    {/* Gradientes e definições */}
                    <defs>
                      <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02}/>
                      </linearGradient>
                      <filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#3b82f6" floodOpacity="0.3"/>
                      </filter>
                    </defs>
                    
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
                      tickCount={6}
                      tickFormatter={(value) => `${value}`}
                      label={{ 
                        value: 'Intensidade', 
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
                        'Intensidade'
                      ]}
                      labelFormatter={(label) => label}
                      cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '2 2', strokeOpacity: 0.5 }}
                    />
                    
                    
                    {/* Área de preenchimento sutil */}
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    
                    {/* Linha principal com visual moderno */}
                    <Line 
                      type="monotone" 
                      dataKey="pain" 
                      stroke="#3b82f6" 
                      strokeWidth={2.5}
                      connectNulls={false}
                      dot={{ 
                        fill: '#3b82f6', 
                        stroke: '#ffffff',
                        strokeWidth: 2, 
                        r: 4,
                        filter: 'url(#dropshadow)'
                      }}
                      activeDot={{ 
                        r: 6, 
                        stroke: '#3b82f6', 
                        strokeWidth: 2, 
                        fill: '#ffffff',
                        filter: 'url(#dropshadow)'
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
