import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EvaScaleProps {
  value?: number;
  onChange: (value: number) => void;
  className?: string;
}

export const EvaScale: React.FC<EvaScaleProps> = ({
  value = 0,
  onChange,
  className = ""
}) => {
  const [selectedValue, setSelectedValue] = useState<number>(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragPosition, setDragPosition] = useState<number | null>(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleValueChange = (newValue: number) => {
    if (newValue !== selectedValue) {
      setIsAnimating(true);
      setSelectedValue(newValue);
      onChange(newValue);
      
      // Feedback tátil visual
      setTimeout(() => setIsAnimating(false), 200);
    }
  };

  const getScaleColor = (val: number) => {
    if (val === 0) return 'bg-green-500';
    if (val <= 2) return 'bg-green-400';
    if (val <= 4) return 'bg-yellow-400';
    if (val <= 6) return 'bg-orange-400';
    if (val <= 8) return 'bg-red-400';
    return 'bg-red-600';
  };

  const getScaleColorHex = (val: number) => {
    if (val === 0) return '#10b981';
    if (val <= 2) return '#22c55e';
    if (val <= 4) return '#facc15';
    if (val <= 6) return '#fb923c';
    if (val <= 8) return '#f87171';
    return '#dc2626';
  };

  const getScaleText = (val: number) => {
    if (val === 0) return 'Sem dor';
    if (val <= 2) return 'Dor leve';
    if (val <= 4) return 'Dor moderada';
    if (val <= 6) return 'Dor intensa';
    if (val <= 8) return 'Dor muito intensa';
    return 'Dor insuportável';
  };

  const getFaceEmoji = (val: number) => {
    if (val === 0) return '😊';
    if (val <= 2) return '🙂';
    if (val <= 4) return '😐';
    if (val <= 6) return '😟';
    if (val <= 8) return '😣';
    return '😫';
  };

  const handleBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    const newValue = Math.round((percentage / 100) * 10);
    handleValueChange(newValue);
  };

  const handleBarDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.buttons === 1) { // Mouse button pressed
      handleBarClick(event);
    }
  };

  return (
    <Card className={`w-full max-w-lg mx-auto shadow-lg transition-all duration-300 ${isAnimating ? 'scale-[1.02]' : ''} ${className}`} data-testid="eva-scale-container">
      <CardContent className="p-6 space-y-6">
        {/* Valor selecionado e descrição */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-4">
            <div className={`text-6xl transition-all duration-300 ${isAnimating ? 'scale-110' : ''}`} data-testid="eva-face-emoji">
              {getFaceEmoji(selectedValue)}
            </div>
            <div className="text-center">
              <div 
                className={`text-4xl font-bold px-6 py-3 rounded-xl text-white shadow-lg transition-all duration-300 ${getScaleColor(selectedValue)} ${isAnimating ? 'scale-110 shadow-xl' : ''}`} 
                data-testid="eva-selected-value"
                style={{ 
                  boxShadow: isAnimating ? `0 0 20px ${getScaleColorHex(selectedValue)}30` : undefined 
                }}
              >
                {selectedValue}
              </div>
            </div>
          </div>
          <p className={`text-lg font-semibold transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`} 
             style={{ color: getScaleColorHex(selectedValue) }} 
             data-testid="eva-scale-description">
            {getScaleText(selectedValue)}
          </p>
        </div>

        {/* Escala visual interativa */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-medium text-gray-600">
            <span>Sem dor</span>
            <span>Dor máxima</span>
          </div>
          
          {/* Barra de progresso visual com interação */}
          <div 
            className="relative h-12 bg-gray-200 rounded-full overflow-hidden cursor-pointer shadow-inner hover:shadow-lg transition-all duration-200"
            onClick={handleBarClick}
            onMouseMove={handleBarDrag}
            data-testid="eva-interactive-bar"
          >
            {/* Gradiente de fundo */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-400 via-orange-400 to-red-600"></div>
            
            {/* Progresso preenchido */}
            <div 
              className="absolute top-0 left-0 h-full bg-black bg-opacity-10 transition-all duration-300 ease-out"
              style={{ width: `${(selectedValue / 10) * 100}%` }}
            ></div>
            
            {/* Indicador da posição atual */}
            <div 
              className={`absolute top-1/2 w-6 h-6 bg-white border-4 border-gray-800 rounded-full shadow-xl transition-all duration-300 transform -translate-y-1/2 cursor-pointer hover:scale-125 ${isAnimating ? 'scale-125' : ''}`}
              style={{ 
                left: `${(selectedValue / 10) * 100}%`, 
                transform: 'translateX(-50%) translateY(-50%)',
                borderColor: getScaleColorHex(selectedValue)
              }}
              data-testid="eva-position-indicator"
            ></div>

            {/* Marcadores na escala */}
            {Array.from({ length: 11 }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-white bg-opacity-30"
                style={{ left: `${(i / 10) * 100}%` }}
              ></div>
            ))}
          </div>

          {/* Números na escala */}
          <div className="grid grid-cols-11 text-xs text-gray-500 font-medium">
            {Array.from({ length: 11 }, (_, i) => (
              <div key={i} className="text-center">
                {i}
              </div>
            ))}
          </div>
        </div>



        {/* Dicas visuais */}
        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>💡 Clique na barra ou arraste para selecionar o nível de dor</p>
          <p>Use a escala que melhor representa sua dor atual</p>
        </div>
      </CardContent>
    </Card>
  );
};