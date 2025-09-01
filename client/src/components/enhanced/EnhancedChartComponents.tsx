/**
 * Componentes de visualização enhanced para relatórios DorLog
 * 
 * Componentes gráficos avançados que integram dados NLP e padrões comportamentais
 * para relatórios inteligentes. Trabalha junto com o sistema existente.
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

// Tipos para dados de visualização
export interface SentimentEvolutionData {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
  painLevel?: number;
}

export interface CorrelationData {
  painLevel: number;
  moodScore: number;
  sentiment: string;
  date: string;
  context?: string;
}

export interface EntityWordCloudData {
  entity: string;
  frequency: number;
  category: string;
}

export interface UrgencyHeatmapData {
  day: string;
  hour: number;
  intensity: number;
}

export interface PatternFlowData {
  step: string;
  value: number;
  category: 'trigger' | 'emotion' | 'action' | 'outcome';
}

// Paleta de cores para os gráficos enhanced
const ENHANCED_COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280',
  gradient: {
    positive: ['#dcfce7', '#10b981'],
    negative: ['#fee2e2', '#ef4444'],
    neutral: ['#f3f4f6', '#6b7280']
  }
};

/**
 * Gráfico de evolução do sentimento com área empilhada
 */
export const SentimentEvolutionChart: React.FC<{
  data: SentimentEvolutionData[];
  showPainOverlay?: boolean;
}> = ({ data, showPainOverlay = false }) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      dateFormatted: new Date(item.date).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">💭</div>
          <p className="text-gray-500">Dados insuficientes para análise de sentimento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={ENHANCED_COLORS.positive} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={ENHANCED_COLORS.positive} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={ENHANCED_COLORS.danger} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={ENHANCED_COLORS.danger} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="neutralGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={ENHANCED_COLORS.neutral} stopOpacity={0.6}/>
              <stop offset="95%" stopColor={ENHANCED_COLORS.neutral} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
          
          <XAxis 
            dataKey="dateFormatted"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            label={{ 
              value: 'Intensidade (%)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: '12px', fill: '#64748b' }
            }}
          />
          
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="capitalize">{entry.dataKey}: {Math.round(entry.value as number)}%</span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          
          <Area
            type="monotone"
            dataKey="negative"
            stackId="1"
            stroke={ENHANCED_COLORS.danger}
            fill="url(#negativeGradient)"
            name="Negativo"
          />
          
          <Area
            type="monotone"
            dataKey="neutral"
            stackId="1"
            stroke={ENHANCED_COLORS.neutral}
            fill="url(#neutralGradient)"
            name="Neutro"
          />
          
          <Area
            type="monotone"
            dataKey="positive"
            stackId="1"
            stroke={ENHANCED_COLORS.positive}
            fill="url(#positiveGradient)"
            name="Positivo"
          />
          
          {showPainOverlay && (
            <Line
              type="monotone"
              dataKey="painLevel"
              stroke={ENHANCED_COLORS.warning}
              strokeWidth={2}
              dot={{ fill: ENHANCED_COLORS.warning, strokeWidth: 2, r: 4 }}
              name="Nível de Dor"
              yAxisId="right"
            />
          )}
          
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Cards de métricas simples para análise dor-humor
 */
export const PainMoodMetricsCards: React.FC<{
  data: CorrelationData[];
}> = ({ data }) => {
  const metrics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        avgPain: 0,
        moodTrend: 'Neutro',
        totalRecords: 0,
        correlationStatus: 'Dados insuficientes',
        moodColor: ENHANCED_COLORS.neutral,
        statusColor: ENHANCED_COLORS.neutral
      };
    }

    // Calcular dor média
    const avgPain = Math.round((data.reduce((sum, item) => sum + item.painLevel, 0) / data.length) * 10) / 10;
    
    // Analisar humor predominante
    const positiveCount = data.filter(item => item.sentiment === 'POSITIVE').length;
    const negativeCount = data.filter(item => item.sentiment === 'NEGATIVE').length;
    const neutralCount = data.filter(item => item.sentiment === 'NEUTRAL').length;
    
    let moodTrend: string;
    let moodColor: string;
    
    if (positiveCount > negativeCount && positiveCount > neutralCount) {
      moodTrend = 'Predominantemente Positivo';
      moodColor = ENHANCED_COLORS.positive;
    } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
      moodTrend = 'Predominantemente Negativo';
      moodColor = ENHANCED_COLORS.danger;
    } else {
      moodTrend = 'Variado/Neutro';
      moodColor = ENHANCED_COLORS.neutral;
    }

    // Status da correlação
    let correlationStatus: string;
    let statusColor: string;
    
    if (data.length < 5) {
      correlationStatus = `${data.length}/5 registros mínimos`;
      statusColor = ENHANCED_COLORS.warning;
    } else {
      correlationStatus = 'Análise disponível';
      statusColor = ENHANCED_COLORS.success;
    }

    return {
      avgPain,
      moodTrend,
      totalRecords: data.length,
      correlationStatus,
      moodColor,
      statusColor
    };
  }, [data]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card: Dor Média */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-red-50">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {metrics.avgPain}/10
              </div>
              <div className="text-sm text-gray-500">Dor Média</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(metrics.avgPain / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Card: Humor */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-blue-50">
              <span className="text-2xl">😊</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {metrics.moodTrend}
              </div>
              <div className="text-sm text-gray-500">Humor Geral</div>
            </div>
          </div>
          <div className="flex items-center mt-3">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: metrics.moodColor }}
            />
            <span className="text-xs text-gray-600">
              {metrics.totalRecords} {metrics.totalRecords === 1 ? 'registro' : 'registros'}
            </span>
          </div>
        </div>

        {/* Card: Registros */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-green-50">
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {metrics.totalRecords}
              </div>
              <div className="text-sm text-gray-500">Registros</div>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-3">
            Dados coletados para análise
          </div>
        </div>

        {/* Card: Status da Correlação */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-purple-50">
              <span className="text-2xl">🔗</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {metrics.correlationStatus}
              </div>
              <div className="text-sm text-gray-500">Correlação</div>
            </div>
          </div>
          <div className="flex items-center mt-3">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: metrics.statusColor }}
            />
            <span className="text-xs text-gray-600">
              {metrics.totalRecords < 5 ? 'Insuficiente' : 'Disponível'}
            </span>
          </div>
        </div>
      </div>

      {/* Observação quando há poucos dados */}
      {metrics.totalRecords > 0 && metrics.totalRecords < 5 && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg">⚠️</span>
            <div>
              <h4 className="text-sm font-medium text-amber-800 mb-1">
                Dados insuficientes para correlação estatística
              </h4>
              <p className="text-xs text-amber-700">
                São necessários pelo menos 5 registros para análise de correlação válida. 
                Continue preenchendo os questionários diários para obter insights mais precisos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Word Cloud simples para entidades médicas
 */
export const EntityWordCloudChart: React.FC<{
  data: EntityWordCloudData[];
}> = ({ data }) => {
  const processedData = useMemo(() => {
    const maxFreq = Math.max(...data.map(item => item.frequency));
    return data
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20)
      .map((item, index) => ({
        ...item,
        size: Math.max(12, (item.frequency / maxFreq) * 24 + 12),
        color: getCategoryColor(item.category),
        opacity: 0.7 + (item.frequency / maxFreq) * 0.3
      }));
  }, [data]);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'symptoms': return ENHANCED_COLORS.danger;
      case 'medications': return ENHANCED_COLORS.info;
      case 'bodyparts': return ENHANCED_COLORS.warning;
      case 'emotions': return ENHANCED_COLORS.secondary;
      default: return ENHANCED_COLORS.neutral;
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">🏷️</div>
          <p className="text-gray-500">Nenhuma entidade médica identificada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80 w-full p-4 bg-gray-50 rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-2 justify-center items-center h-full">
        {processedData.map((item, index) => (
          <span
            key={index}
            className="px-2 py-1 rounded-md font-medium cursor-pointer transition-all duration-200 hover:scale-110"
            style={{
              fontSize: `${item.size}px`,
              color: item.color,
              backgroundColor: `${item.color}15`,
              opacity: item.opacity
            }}
            title={`${item.entity} - Frequência: ${item.frequency} (${item.category})`}
          >
            {item.entity}
          </span>
        ))}
      </div>
      
      {/* Legenda de categorias */}
      <div className="flex justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ENHANCED_COLORS.danger }}></div>
          <span>Sintomas</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ENHANCED_COLORS.info }}></div>
          <span>Medicamentos</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ENHANCED_COLORS.warning }}></div>
          <span>Corpo</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ENHANCED_COLORS.secondary }}></div>
          <span>Emoções</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Heatmap de urgência (implementação simplificada com grid CSS)
 */
export const UrgencyHeatmapChart: React.FC<{
  data: UrgencyHeatmapData[];
}> = ({ data }) => {
  const processedData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const grid = days.map(day => 
      hours.map(hour => {
        const dataPoint = data.find(d => 
          new Date(d.day).getDay() === days.indexOf(day) && d.hour === hour
        );
        return {
          day,
          hour,
          intensity: dataPoint?.intensity || 0
        };
      })
    );
    
    return { days, hours, grid };
  }, [data]);

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return '#f8fafc';
    const colors = ['#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c'];
    const index = Math.min(Math.floor((intensity / 10) * colors.length), colors.length - 1);
    return colors[index];
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">📅</div>
          <p className="text-gray-500">Dados insuficientes para mapa temporal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80 w-full p-4 bg-gray-50 rounded-lg overflow-auto">
      <div className="min-w-full">
        <div className="grid grid-cols-25 gap-1 text-xs">
          {/* Header com horas */}
          <div></div>
          {processedData.hours.map(hour => (
            <div key={hour} className="text-center text-gray-500 font-medium p-1">
              {hour}h
            </div>
          ))}
          
          {/* Grid principal */}
          {processedData.grid.map((dayData, dayIndex) => (
            <React.Fragment key={dayIndex}>
              <div className="text-gray-600 font-medium p-1 text-right">
                {processedData.days[dayIndex]}
              </div>
              {dayData.map((cell, hourIndex) => (
                <div
                  key={`${dayIndex}-${hourIndex}`}
                  className="w-4 h-4 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110"
                  style={{ backgroundColor: getIntensityColor(cell.intensity) }}
                  title={`${cell.day} ${cell.hour}h - Intensidade: ${cell.intensity}/10`}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
        
        {/* Legenda */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs">
          <span className="text-gray-500">Menos</span>
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getIntensityColor((i / 6) * 10) }}
            />
          ))}
          <span className="text-gray-500">Mais</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Gráfico de fluxo comportamental (Sankey simplificado)
 */
export const BehavioralFlowChart: React.FC<{
  data: PatternFlowData[];
}> = ({ data }) => {
  const processedData = useMemo(() => {
    const categories = ['trigger', 'emotion', 'action', 'outcome'] as const;
    return categories.map(category => ({
      category,
      items: data.filter(item => item.category === category),
      color: getCategoryColor(category)
    }));
  }, [data]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trigger': return ENHANCED_COLORS.warning;
      case 'emotion': return ENHANCED_COLORS.secondary;
      case 'action': return ENHANCED_COLORS.info;
      case 'outcome': return ENHANCED_COLORS.success;
      default: return ENHANCED_COLORS.neutral;
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">🔄</div>
          <p className="text-gray-500">Padrões comportamentais em análise</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80 w-full p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between h-full">
        {processedData.map((categoryData, index) => (
          <div key={categoryData.category} className="flex flex-col justify-center flex-1 px-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize text-center">
              {categoryData.category === 'trigger' ? 'Gatilhos' :
               categoryData.category === 'emotion' ? 'Emoções' :
               categoryData.category === 'action' ? 'Ações' : 'Resultados'}
            </h4>
            <div className="space-y-2">
              {categoryData.items.slice(0, 5).map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="relative p-2 rounded-lg text-center text-xs font-medium text-white shadow-sm"
                  style={{ 
                    backgroundColor: categoryData.color,
                    opacity: 0.7 + (item.value / 100) * 0.3
                  }}
                >
                  <div>{item.step}</div>
                  <div className="text-xs opacity-75">{item.value}%</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Componente container para todos os gráficos enhanced
 */
export const EnhancedVisualizationContainer: React.FC<{
  sentimentData?: SentimentEvolutionData[];
  correlationData?: CorrelationData[];
  entityData?: EntityWordCloudData[];
  urgencyData?: UrgencyHeatmapData[];
  flowData?: PatternFlowData[];
}> = ({ 
  sentimentData = [], 
  correlationData = [], 
  entityData = [], 
  urgencyData = [], 
  flowData = [] 
}) => {
  return (
    <div className="space-y-6">
      {/* Evolução do Sentimento */}
      {sentimentData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">💭</span>
            <h3 className="text-lg font-semibold text-gray-900">Evolução do Sentimento</h3>
          </div>
          <SentimentEvolutionChart data={sentimentData} showPainOverlay />
        </div>
      )}

      {/* Métricas Dor-Humor */}
      {(correlationData.length > 0 || true) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🔗</span>
            <h3 className="text-lg font-semibold text-gray-900">Métricas Dor-Humor</h3>
          </div>
          <PainMoodMetricsCards data={correlationData} />
        </div>
      )}

      {/* Entidades Médicas */}
      {entityData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🏷️</span>
            <h3 className="text-lg font-semibold text-gray-900">Entidades Médicas Identificadas</h3>
          </div>
          <EntityWordCloudChart data={entityData} />
        </div>
      )}

      {/* Mapa de Urgência Temporal */}
      {urgencyData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📅</span>
            <h3 className="text-lg font-semibold text-gray-900">Padrões Temporais de Urgência</h3>
          </div>
          <UrgencyHeatmapChart data={urgencyData} />
        </div>
      )}

      {/* Fluxo Comportamental */}
      {flowData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🔄</span>
            <h3 className="text-lg font-semibold text-gray-900">Padrões Comportamentais</h3>
          </div>
          <BehavioralFlowChart data={flowData} />
        </div>
      )}
    </div>
  );
};