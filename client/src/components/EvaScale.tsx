import React, { useState } from 'react';
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

  const handleValueChange = (newValue: number) => {
    setSelectedValue(newValue);
    onChange(newValue);
  };

  const getScaleColor = (val: number) => {
    if (val === 0) return 'bg-green-500';
    if (val <= 2) return 'bg-green-400';
    if (val <= 4) return 'bg-yellow-400';
    if (val <= 6) return 'bg-orange-400';
    if (val <= 8) return 'bg-red-400';
    return 'bg-red-600';
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

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`} data-testid="eva-scale-container">
      <CardContent className="p-6">
        {/* Valor selecionado e descrição */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl" data-testid="eva-face-emoji">
              {getFaceEmoji(selectedValue)}
            </span>
            <div className="text-center">
              <div className={`text-3xl font-bold px-4 py-2 rounded-lg text-white ${getScaleColor(selectedValue)}`} data-testid="eva-selected-value">
                {selectedValue}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 font-medium" data-testid="eva-scale-description">
            {getScaleText(selectedValue)}
          </p>
        </div>

        {/* Escala visual */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">0</span>
            <span className="text-xs text-gray-500">10</span>
          </div>
          
          {/* Barra de progresso visual */}
          <div className="relative h-8 bg-gray-200 rounded-lg overflow-hidden">
            {/* Gradiente de fundo */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-400 via-orange-400 to-red-600"></div>
            
            {/* Indicador da posição atual */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-gray-800 border border-white shadow-lg transition-all duration-200"
              style={{ left: `${(selectedValue / 10) * 100}%`, transform: 'translateX(-50%)' }}
              data-testid="eva-position-indicator"
            ></div>
          </div>
        </div>

        {/* Botões numéricos */}
        <div className="grid grid-cols-11 gap-1 mb-4">
          {Array.from({ length: 11 }, (_, i) => (
            <Button
              key={i}
              variant={selectedValue === i ? "default" : "outline"}
              size="sm"
              className={`h-8 w-8 p-0 text-xs ${
                selectedValue === i 
                  ? `${getScaleColor(i)} text-white border-gray-400` 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => handleValueChange(i)}
              data-testid={`eva-button-${i}`}
            >
              {i}
            </Button>
          ))}
        </div>

        {/* Labels das extremidades */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>Sem dor</span>
          <span>Dor máxima</span>
        </div>
      </CardContent>
    </Card>
  );
};