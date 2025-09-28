import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Question {
  id: string;
  text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number; // in seconds
  answer?: string;
  score?: number;
  timeSpent?: number;
}

export interface InterviewSession {
  id: string;
  candidateId: string;
  questions: Question[];
  currentQuestionIndex: number;
  isActive: boolean;
  isPaused: boolean;
  startTime?: number;
  endTime?: number;
  finalScore?: number;
  summary?: string;
  timeRemaining?: number;
}

interface InterviewState {
  currentSession: InterviewSession | null;
  sessions: InterviewSession[];
}

const initialState: InterviewState = {
  currentSession: null,
  sessions: [],
};

// Sample questions for full stack development
const generateQuestions = (): Question[] => [
  {
    id: '1',
    text: 'What is the difference between let, const, and var in JavaScript?',
    difficulty: 'Easy',
    timeLimit: 20,
  },
  {
    id: '2', 
    text: 'Explain the concept of closures in JavaScript with an example.',
    difficulty: 'Easy',
    timeLimit: 20,
  },
  {
    id: '3',
    text: 'What are React hooks and how do useState and useEffect work?',
    difficulty: 'Medium',
    timeLimit: 60,
  },
  {
    id: '4',
    text: 'Explain the difference between SQL and NoSQL databases. When would you use each?',
    difficulty: 'Medium', 
    timeLimit: 60,
  },
  {
    id: '5',
    text: 'Design a REST API for a simple e-commerce system. Include endpoints for products, users, and orders.',
    difficulty: 'Hard',
    timeLimit: 120,
  },
  {
    id: '6',
    text: 'How would you optimize a React application for performance? Discuss lazy loading, memoization, and bundle optimization.',
    difficulty: 'Hard',
    timeLimit: 120,
  },
];

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    startInterview: (state, action: PayloadAction<{ candidateId: string }>) => {
      const session: InterviewSession = {
        id: Date.now().toString(),
        candidateId: action.payload.candidateId,
        questions: generateQuestions(),
        currentQuestionIndex: 0,
        isActive: true,
        isPaused: false,
        startTime: Date.now(),
        timeRemaining: generateQuestions()[0].timeLimit,
      };
      state.currentSession = session;
      state.sessions.push(session);
    },
    
    answerQuestion: (state, action: PayloadAction<{ answer: string; timeSpent: number }>) => {
      if (state.currentSession) {
        const currentQuestion = state.currentSession.questions[state.currentSession.currentQuestionIndex];
        if (currentQuestion) {
          currentQuestion.answer = action.payload.answer;
          currentQuestion.timeSpent = action.payload.timeSpent;
          currentQuestion.score = calculateScore(currentQuestion);
        }
      }
    },
    
    nextQuestion: (state) => {
      if (state.currentSession) {
        state.currentSession.currentQuestionIndex += 1;
        if (state.currentSession.currentQuestionIndex < state.currentSession.questions.length) {
          const nextQuestion = state.currentSession.questions[state.currentSession.currentQuestionIndex];
          state.currentSession.timeRemaining = nextQuestion.timeLimit;
        } else {
          // Interview completed
          state.currentSession.isActive = false;
          state.currentSession.endTime = Date.now();
          state.currentSession.finalScore = calculateFinalScore(state.currentSession.questions);
          state.currentSession.summary = generateSummary(state.currentSession.questions);
        }
      }
    },
    
    pauseInterview: (state) => {
      if (state.currentSession) {
        state.currentSession.isPaused = true;
      }
    },
    
    resumeInterview: (state) => {
      if (state.currentSession) {
        state.currentSession.isPaused = false;
      }
    },
    
    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      if (state.currentSession) {
        state.currentSession.timeRemaining = action.payload;
      }
    },
    
    endInterview: (state) => {
      if (state.currentSession) {
        state.currentSession.isActive = false;
        state.currentSession.endTime = Date.now();
        state.currentSession.finalScore = calculateFinalScore(state.currentSession.questions);
        state.currentSession.summary = generateSummary(state.currentSession.questions);
      }
    },
    
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
  },
});

// Helper functions
const calculateScore = (question: Question): number => {
  if (!question.answer) return 0;
  
  // Simple scoring based on answer length and time efficiency
  const answerLength = question.answer.length;
  const timeEfficiency = question.timeSpent ? (question.timeLimit - question.timeSpent) / question.timeLimit : 0;
  
  let baseScore = 0;
  if (answerLength > 20) baseScore = 60;
  if (answerLength > 50) baseScore = 75;
  if (answerLength > 100) baseScore = 85;
  if (answerLength > 200) baseScore = 95;
  
  return Math.min(100, baseScore + (timeEfficiency * 20));
};

const calculateFinalScore = (questions: Question[]): number => {
  const scores = questions.map(q => q.score || 0);
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / questions.length);
};

const generateSummary = (questions: Question[]): string => {
  const avgScore = calculateFinalScore(questions);
  const completedQuestions = questions.filter(q => q.answer).length;
  
  if (avgScore >= 80) {
    return `Excellent performance! Candidate demonstrated strong knowledge across ${completedQuestions}/6 questions with an average score of ${avgScore}%. Shows solid understanding of full-stack development concepts.`;
  } else if (avgScore >= 60) {
    return `Good performance. Candidate answered ${completedQuestions}/6 questions with an average score of ${avgScore}%. Shows decent understanding but could benefit from more practice in some areas.`;
  } else {
    return `Needs improvement. Candidate completed ${completedQuestions}/6 questions with an average score of ${avgScore}%. Requires additional training in full-stack development fundamentals.`;
  }
};

export const {
  startInterview,
  answerQuestion,
  nextQuestion,
  pauseInterview,
  resumeInterview,
  updateTimeRemaining,
  endInterview,
  clearCurrentSession,
} = interviewSlice.actions;

export default interviewSlice.reducer;