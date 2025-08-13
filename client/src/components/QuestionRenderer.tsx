import { useState, useEffect } from 'react';
import { QuizQuestion } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
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
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Avalie de 0 a 10
              </p>
              <div className="text-3xl font-bold text-primary">
                {localAnswer ?? 5}
              </div>
            </div>
            <Slider
              value={[localAnswer ?? 5]}
              onValueChange={(value) => handleAnswerChange(value[0])}
              max={10}
              min={0}
              step={1}
              className="w-full"
              data-testid="slider-eva"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>10</span>
            </div>
          </div>
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
        const emojiOptions = [
          { emoji: '😢', value: 'muito-ruim', label: 'Muito Ruim', icon: Frown },
          { emoji: '😐', value: 'ruim', label: 'Ruim', icon: Meh },
          { emoji: '😊', value: 'bom', label: 'Bom', icon: Smile },
          { emoji: '😍', value: 'muito-bom', label: 'Muito Bom', icon: Heart },
          { emoji: '🤩', value: 'excelente', label: 'Excelente', icon: ThumbsUp },
        ];

        return (
          <div className="grid grid-cols-5 gap-2">
            {emojiOptions.map((option, index) => {
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