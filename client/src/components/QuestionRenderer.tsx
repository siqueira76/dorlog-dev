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
          // Mapear opções específicas do Firebase para emojis
          const getEmojiForOption = (opcao: string) => {
            const emojiMap: { [key: string]: string } = {
              'Ansioso': '😰',
              'Triste': '😢', 
              'Irritado': '😠',
              'Calmo': '😌',
              'Feliz': '😊',
              'Depressivo': '😔',
              'Deprecivo': '😔' // Alternativa caso esteja escrito assim
            };
            return emojiMap[opcao] || '😐';
          };

          // Determinar layout responsivo baseado no número de opções
          const getGridClass = (numOptions: number) => {
            if (numOptions <= 2) return "grid grid-cols-1 sm:grid-cols-2 gap-3";
            if (numOptions <= 3) return "grid grid-cols-1 sm:grid-cols-3 gap-3";
            if (numOptions <= 4) return "grid grid-cols-2 sm:grid-cols-4 gap-3";
            return "grid grid-cols-2 sm:grid-cols-3 gap-3";
          };
          
          return (
            <div className={getGridClass(question.opcoes.length)}>
              {question.opcoes.map((opcao, index) => (
                <Button
                  key={index}
                  variant={localAnswer === opcao ? "default" : "outline"}
                  className={`h-24 flex-col space-y-2 p-3 transition-all duration-200 hover:scale-105 ${
                    localAnswer === opcao 
                      ? "bg-primary text-primary-foreground shadow-lg" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleAnswerChange(opcao)}
                  data-testid={`button-emoji-${index}`}
                >
                  <span className="text-3xl mb-1">{getEmojiForOption(opcao)}</span>
                  <span className="text-xs font-medium text-center leading-tight break-words">
                    {opcao}
                  </span>
                </Button>
              ))}
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
    <div className="space-y-6">
      {/* Pergunta */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="text-question">
          {question.texto}
        </h2>
      </div>

      {/* Renderização da resposta */}
      <div>
        {renderQuestion()}
      </div>
    </div>
  );
}