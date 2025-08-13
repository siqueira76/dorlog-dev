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
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {localAnswer ?? Math.floor((min + max) / 2)}
              </div>
            </div>
            <Slider
              value={[localAnswer ?? Math.floor((min + max) / 2)]}
              onValueChange={(value) => handleAnswerChange(value[0])}
              max={max}
              min={min}
              step={1}
              className="w-full"
              data-testid="slider-custom"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{min}</span>
              <span>{max}</span>
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.opcoes?.map((opcao, index) => {
              const isChecked = Array.isArray(localAnswer) ? localAnswer.includes(opcao) : false;
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`checkbox-${index}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      let newAnswer = Array.isArray(localAnswer) ? [...localAnswer] : [];
                      if (checked) {
                        if (!newAnswer.includes(opcao)) {
                          newAnswer.push(opcao);
                        }
                      } else {
                        newAnswer = newAnswer.filter(item => item !== opcao);
                      }
                      handleAnswerChange(newAnswer);
                    }}
                    data-testid={`checkbox-${index}`}
                  />
                  <label
                    htmlFor={`checkbox-${index}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {opcao}
                  </label>
                </div>
              );
            })}
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