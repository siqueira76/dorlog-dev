import { useState, useEffect } from 'react';
import { QuizQuestion } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { EvaScale } from '@/components/EvaScale';
import { Card, CardContent } from '@/components/ui/card';
import { Smile, Frown, Meh, Heart, ThumbsUp } from 'lucide-react';

interface QuestionRendererProps {
  question: QuizQuestion;
  answer?: any;
  onAnswer: (questionId: string | number, answer: any) => void;
}

export default function QuestionRenderer({ question, answer, onAnswer }: QuestionRendererProps) {
  const [localAnswer, setLocalAnswer] = useState(answer);

  useEffect(() => {
    setLocalAnswer(answer);
  }, [answer]);

  const handleAnswerChange = (newAnswer: any) => {
    setLocalAnswer(newAnswer);
    onAnswer(question.id, newAnswer);
  };

  const renderQuestion = () => {
    switch (question.tipo) {
      case 'opcoes':
        return (
          <div className="space-y-3">
            {question.opcoes?.map((opcao, index) => (
              <Button
                key={index}
                variant={localAnswer === opcao ? "default" : "outline"}
                className="w-full justify-start text-left h-auto p-4"
                onClick={() => handleAnswerChange(opcao)}
                data-testid={`button-option-${index}`}
              >
                {opcao}
              </Button>
            ))}
          </div>
        );

      case 'eva':
        return (
          <EvaScale
            value={localAnswer ?? 0}
            onChange={handleAnswerChange}
            className="w-full"
          />
        );

      case 'slider':
        const min = question.min ?? 0;
        const max = question.max ?? 100;
        const currentValue = localAnswer ?? Math.floor((min + max) / 2);
        const percentage = ((currentValue - min) / (max - min)) * 100;
        
        // Enhanced slider with better UX
        const handleSliderChange = (value: number[]) => {
          // Haptic feedback for mobile devices
          if ('vibrate' in navigator) {
            navigator.vibrate(10);
          }
          handleAnswerChange(value[0]);
        };

        // Generate descriptive labels based on context and range
        const getValueLabel = (value: number) => {
          if (max <= 5) {
            // For 0-5 scales (common for medical assessments)
            const labels = ['Nenhum', 'Muito leve', 'Leve', 'Moderado', 'Intenso', 'Muito intenso'];
            return labels[value] || value.toString();
          } else if (max <= 10) {
            // For 0-10 scales
            if (value === 0) return 'Nenhum';
            if (value <= 2) return 'Muito baixo';
            if (value <= 4) return 'Baixo';
            if (value <= 6) return 'Moderado';
            if (value <= 8) return 'Alto';
            return 'Muito alto';
          }
          return value.toString();
        };

        return (
          <div className="space-y-6 py-4">
            {/* Enhanced value display with contextual styling */}
            <div className="text-center space-y-2">
              <div className="relative inline-flex items-center justify-center">
                <div 
                  className={`text-4xl font-bold transition-all duration-300 ${
                    currentValue === min ? 'text-green-600' :
                    currentValue <= Math.floor(max * 0.3) ? 'text-blue-600' :
                    currentValue <= Math.floor(max * 0.7) ? 'text-yellow-600' :
                    'text-red-600'
                  }`}
                >
                  {currentValue}
                </div>
                <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-transparent via-current to-transparent opacity-10 animate-pulse"></div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                {getValueLabel(currentValue)}
              </div>
            </div>

            {/* Enhanced slider with visual progress indicator */}
            <div className="space-y-4 px-2">
              <div className="relative">
                {/* Progress background bar */}
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-full"></div>
                
                {/* Enhanced slider component */}
                <Slider
                  value={[currentValue]}
                  onValueChange={handleSliderChange}
                  max={max}
                  min={min}
                  step={1}
                  className="w-full relative z-10"
                  data-testid="slider-custom"
                />
                
                {/* Progress indicator */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              {/* Enhanced labels with tick marks */}
              <div className="relative px-2">
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <div className="w-1 h-3 bg-muted-foreground/30 rounded-full mx-auto mb-1"></div>
                    <span className="text-xs font-medium text-muted-foreground">{min}</span>
                    <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                      {max <= 5 ? 'Mínimo' : 'Nenhum'}
                    </div>
                  </div>
                  
                  {/* Middle indicator for better context */}
                  {max > 2 && (
                    <div className="text-center">
                      <div className="w-0.5 h-2 bg-muted-foreground/20 rounded-full mx-auto mb-1"></div>
                      <span className="text-xs text-muted-foreground/70">{Math.floor((min + max) / 2)}</span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="w-1 h-3 bg-muted-foreground/30 rounded-full mx-auto mb-1"></div>
                    <span className="text-xs font-medium text-muted-foreground">{max}</span>
                    <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                      {max <= 5 ? 'Máximo' : 'Muito alto'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Helpful instruction text */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Deslize para ajustar o valor
              </p>
            </div>
          </div>
        );

      case 'checkbox':
        const selectedItems = Array.isArray(localAnswer) ? localAnswer : [];
        const numOptions = question.opcoes?.length || 0;
        
        // Determine grid layout based on number of options for optimal mobile experience
        const getCheckboxGridClass = (count: number) => {
          if (count <= 2) return "grid grid-cols-1 gap-3 max-w-sm mx-auto";
          if (count <= 4) return "grid grid-cols-1 gap-3 max-w-md mx-auto";
          if (count <= 6) return "grid grid-cols-2 gap-3 max-w-lg mx-auto";
          return "grid grid-cols-2 gap-2 max-w-xl mx-auto";
        };

        return (
          <div className="space-y-4">
            {/* Selection counter for better feedback */}
            {selectedItems.length > 0 && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {selectedItems.length} selecionado{selectedItems.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}

            {/* Modern card-based checkbox options */}
            <div className={getCheckboxGridClass(numOptions)}>
              {question.opcoes?.map((opcao, index) => {
                const isSelected = selectedItems.includes(opcao);
                
                return (
                  <Card
                    key={index}
                    className={`
                      checkbox-card relative cursor-pointer transition-all duration-200 touch-target
                      hover:shadow-md active:scale-98 transform select-none
                      ${isSelected 
                        ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200 shadow-sm' 
                        : 'hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => {
                      // Add haptic feedback for mobile devices
                      if ('vibrate' in navigator) {
                        navigator.vibrate(10); // Very light vibration
                      }
                      
                      let newAnswer = [...selectedItems];
                      if (isSelected) {
                        newAnswer = newAnswer.filter(item => item !== opcao);
                      } else {
                        newAnswer.push(opcao);
                      }
                      handleAnswerChange(newAnswer);
                    }}
                    data-testid={`checkbox-card-${index}`}
                  >
                    <CardContent className="p-4 relative">
                      {/* Selection indicator with enhanced visual feedback */}
                      <div className={`
                        absolute top-3 right-3 w-6 h-6 rounded-full border-2 
                        flex items-center justify-center transition-all duration-300
                        ${isSelected 
                          ? 'bg-blue-500 border-blue-500 scale-110 shadow-sm' 
                          : 'border-gray-300 bg-white hover:border-gray-400'
                        }
                      `}>
                        {isSelected && (
                          <svg 
                            className="w-3.5 h-3.5 text-white animate-pulse" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                        )}
                      </div>

                      {/* Option text with better spacing and typography */}
                      <div className={`
                        pr-8 text-sm font-medium leading-relaxed
                        ${isSelected ? 'text-blue-900' : 'text-gray-700'}
                      `}>
                        {opcao}
                      </div>

                      {/* Subtle accent bar for selected items */}
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg" />
                      )}

                      {/* Enhanced visual state overlay */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500 opacity-5 rounded-lg pointer-events-none" />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Help text for mobile users */}
            {question.opcoes && question.opcoes.length > 1 && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Toque para selecionar múltiplas opções
                </p>
              </div>
            )}
          </div>
        );

      case 'texto':
        return (
          <div className="space-y-2">
            <Input
              placeholder="Digite sua resposta..."
              value={localAnswer || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              data-testid="input-text"
            />
          </div>
        );

      case 'imagem':
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Descreva ou faça comentários sobre a imagem..."
              value={localAnswer || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              rows={4}
              data-testid="textarea-image"
            />
            <p className="text-xs text-muted-foreground">
              Funcionalidade de upload de imagem será implementada em breve
            </p>
          </div>
        );

      case 'emojis':
        // Se a pergunta tem opções específicas, use-as. Caso contrário, use as opções padrão
        if (question.opcoes && question.opcoes.length > 0) {
          // Mapear opções específicas do Firebase para emojis e cores
          const getEmojiDataForOption = (opcao: string) => {
            const emojiMap: { [key: string]: { emoji: string; color: string; bgColor: string } } = {
              'Ansioso': { emoji: '😰', color: 'text-orange-600', bgColor: 'hover:bg-orange-50 data-[selected=true]:bg-orange-100' },
              'Triste': { emoji: '😢', color: 'text-blue-600', bgColor: 'hover:bg-blue-50 data-[selected=true]:bg-blue-100' }, 
              'Irritado': { emoji: '😠', color: 'text-red-600', bgColor: 'hover:bg-red-50 data-[selected=true]:bg-red-100' },
              'Calmo': { emoji: '😌', color: 'text-green-600', bgColor: 'hover:bg-green-50 data-[selected=true]:bg-green-100' },
              'Feliz': { emoji: '😊', color: 'text-yellow-600', bgColor: 'hover:bg-yellow-50 data-[selected=true]:bg-yellow-100' },
              'Depressivo': { emoji: '😔', color: 'text-purple-600', bgColor: 'hover:bg-purple-50 data-[selected=true]:bg-purple-100' },
              'Deprecivo': { emoji: '😔', color: 'text-purple-600', bgColor: 'hover:bg-purple-50 data-[selected=true]:bg-purple-100' }
            };
            return emojiMap[opcao] || { emoji: '😐', color: 'text-gray-600', bgColor: 'hover:bg-gray-50 data-[selected=true]:bg-gray-100' };
          };

          // Layout mobile-first otimizado para economia de espaço
          const getGridClass = (numOptions: number) => {
            if (numOptions <= 2) return "grid grid-cols-2 gap-3 max-w-sm mx-auto";
            if (numOptions <= 3) return "grid grid-cols-3 gap-2 max-w-md mx-auto";
            if (numOptions <= 4) return "grid grid-cols-2 gap-3 max-w-sm mx-auto";
            return "grid grid-cols-3 gap-2 max-w-lg mx-auto";
          };
          
          return (
            <div className={getGridClass(question.opcoes.length)}>
              {question.opcoes.map((opcao, index) => {
                const emojiData = getEmojiDataForOption(opcao);
                const isSelected = localAnswer === opcao;
                
                return (
                  <Button
                    key={index}
                    variant="outline"
                    data-selected={isSelected}
                    className={`
                      h-20 flex-col space-y-1 p-2 transition-all duration-200
                      border-2 rounded-lg relative overflow-hidden
                      ${isSelected 
                        ? `${emojiData.bgColor} border-current shadow-md ${emojiData.color}` 
                        : `${emojiData.bgColor} border-gray-200 hover:border-gray-300`
                      }
                      active:scale-95 focus:ring-1 focus:ring-offset-1 focus:ring-primary/30
                    `}
                    onClick={() => handleAnswerChange(opcao)}
                    data-testid={`button-emoji-${index}`}
                  >
                    {/* Indicador de seleção compacto */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-current rounded-full" />
                    )}
                    
                    {/* Emoji compacto */}
                    <div className="text-2xl leading-none">
                      {emojiData.emoji}
                    </div>
                    
                    {/* Label compacto */}
                    <span className={`
                      text-xs font-medium text-center leading-tight
                      ${isSelected ? 'text-current' : 'text-gray-700'}
                    `}>
                      {opcao}
                    </span>
                  </Button>
                );
              })}
            </div>
          );
        }

        // Fallback para opções padrão se não há opções específicas
        const defaultEmojiOptions = [
          { emoji: '😢', value: 'muito-ruim', label: 'Muito Ruim', icon: Frown },
          { emoji: '😐', value: 'ruim', label: 'Ruim', icon: Meh },
          { emoji: '😊', value: 'bom', label: 'Bom', icon: Smile },
          { emoji: '😍', value: 'muito-bom', label: 'Muito Bom', icon: Heart },
          { emoji: '🤩', value: 'excelente', label: 'Excelente', icon: ThumbsUp },
        ];

        return (
          <div className="grid grid-cols-5 gap-2">
            {defaultEmojiOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={localAnswer === option.value ? "default" : "outline"}
                  className="h-16 flex-col space-y-1 text-xs"
                  onClick={() => handleAnswerChange(option.value)}
                  data-testid={`button-emoji-${index}`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-xs">{option.label}</span>
                </Button>
              );
            })}
          </div>
        );

      default:
        return (
          <div className="text-center text-muted-foreground">
            Tipo de pergunta não suportado: {question.tipo}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Pergunta compacta para mobile */}
      <div className="text-center space-y-1">
        <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight" data-testid="text-question">
          {question.texto}
        </h2>
        {question.tipo === 'emojis' && (
          <p className="text-xs sm:text-sm text-muted-foreground">
            Selecione uma opção
          </p>
        )}
      </div>

      {/* Renderização da resposta otimizada */}
      <div className="quiz-response-container">
        {renderQuestion()}
      </div>
      
      {/* Feedback compacto para seleção */}
      {localAnswer && question.tipo === 'emojis' && (
        <div className="text-center">
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            {localAnswer}
          </div>
        </div>
      )}
    </div>
  );
}