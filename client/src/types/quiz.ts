export type QuestionType = "opcoes" | "eva" | "slider" | "checkbox" | "texto" | "imagem" | "emojis";

export interface QuizQuestion {
  id: string | number;
  texto: string;
  tipo: QuestionType;
  opcoes?: string[];
  min?: number;
  max?: number;
}

export interface Quiz {
  nome: string;
  disparo: string;
  perguntas: Record<string, QuizQuestion>;
}

export interface QuizAnswer {
  questionId: string | number;
  answer: any;
}

export interface QuizSession {
  quizId: string;
  answers: QuizAnswer[];
  currentQuestionIndex: number;
  startTime: Date;
  endTime?: Date;
}