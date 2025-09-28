import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Clock, Bot, User, Play, Pause, CheckCircle } from 'lucide-react';
import { startInterview, answerQuestion, nextQuestion, updateTimeRemaining, endInterview } from '@/store/slices/interviewSlice';
import { updateCandidate, completeCandidate } from '@/store/slices/candidateSlice';
import { toast } from '@/hooks/use-toast';

const ChatInterface = () => {
  const dispatch = useDispatch();
  const { currentCandidate } = useSelector((state: RootState) => state.candidate);
  const { currentSession } = useSelector((state: RootState) => state.interview);
  
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    sender: 'bot' | 'user';
    timestamp: number;
  }>>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (currentSession?.isActive && !currentSession.isPaused) {
      startTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentSession?.currentQuestionIndex, currentSession?.isActive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (currentSession?.isActive && !isStarted) {
      setIsStarted(true);
      addMessage('Welcome to your technical interview! Let\'s begin with the first question.', 'bot');
      showCurrentQuestion();
    }
  }, [currentSession]);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      if (currentSession?.timeRemaining && currentSession.timeRemaining > 0) {
        const newTime = currentSession.timeRemaining - 1;
        dispatch(updateTimeRemaining(newTime));
        
        if (newTime === 0) {
          handleTimeUp();
        }
      }
    }, 1000);
  };

  const handleTimeUp = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const timeSpent = getCurrentQuestion()?.timeLimit || 0;
    
    if (currentAnswer.trim()) {
      dispatch(answerQuestion({ 
        answer: currentAnswer, 
        timeSpent 
      }));
      addMessage(currentAnswer, 'user');
    } else {
      addMessage('No answer provided (time expired)', 'user');
      dispatch(answerQuestion({ 
        answer: '', 
        timeSpent 
      }));
    }

    setCurrentAnswer('');
    
    // Move to next question or end interview
    if (currentSession && currentSession.currentQuestionIndex < currentSession.questions.length - 1) {
      dispatch(nextQuestion());
      setTimeout(() => {
        addMessage('Time\'s up! Let\'s move to the next question.', 'bot');
        showCurrentQuestion();
      }, 1000);
    } else {
      endInterviewFlow();
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) {
      toast({
        title: "Empty Answer",
        description: "Please provide an answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const timeSpent = (getCurrentQuestion()?.timeLimit || 0) - (currentSession?.timeRemaining || 0);
    
    dispatch(answerQuestion({ 
      answer: currentAnswer, 
      timeSpent 
    }));
    
    addMessage(currentAnswer, 'user');
    setCurrentAnswer('');

    // Move to next question or end interview
    if (currentSession && currentSession.currentQuestionIndex < currentSession.questions.length - 1) {
      dispatch(nextQuestion());
      setTimeout(() => {
        addMessage('Great! Let\'s continue with the next question.', 'bot');
        showCurrentQuestion();
      }, 1000);
    } else {
      endInterviewFlow();
    }
  };

  const endInterviewFlow = () => {
    dispatch(endInterview());
    
    if (currentCandidate && currentSession) {
      dispatch(updateCandidate({
        id: currentCandidate.id,
        updates: { status: 'completed' }
      }));
      
      dispatch(completeCandidate({
        id: currentCandidate.id,
        score: currentSession.finalScore || 0,
        summary: currentSession.summary || 'Interview completed.'
      }));
    }

    addMessage('Thank you for completing the interview! Your responses have been recorded and will be reviewed by our team.', 'bot');
    
    toast({
      title: "Interview Complete!",
      description: "Thank you for your time. Results will be available in the interviewer dashboard.",
    });
  };

  const showCurrentQuestion = () => {
    const question = getCurrentQuestion();
    if (question) {
      setTimeout(() => {
        addMessage(question.text, 'bot');
      }, 500);
    }
  };

  const getCurrentQuestion = () => {
    if (!currentSession) return null;
    return currentSession.questions[currentSession.currentQuestionIndex];
  };

  const addMessage = (text: string, sender: 'bot' | 'user') => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: Date.now()
    }]);
  };

  const handleStartInterview = () => {
    if (!currentCandidate) return;
    
    dispatch(startInterview({ candidateId: currentCandidate.id }));
    dispatch(updateCandidate({
      id: currentCandidate.id,
      updates: { status: 'interviewing' }
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-success/10 text-success';
      case 'Medium': return 'bg-warning/10 text-warning';
      case 'Hard': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  const currentQuestion = getCurrentQuestion();
  const progress = currentSession ? ((currentSession.currentQuestionIndex + 1) / currentSession.questions.length) * 100 : 0;
  const isCompleted = currentSession && !currentSession.isActive;

  if (!currentCandidate) return null;

  return (
    <CardContent className="p-6 space-y-6">
      {/* Interview Status */}
      {currentSession && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold">
                Question {currentSession.currentQuestionIndex + 1} of {currentSession.questions.length}
              </h3>
              {currentQuestion && (
                <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                  {currentQuestion.difficulty}
                </Badge>
              )}
            </div>
            
            {currentSession.isActive && currentSession.timeRemaining !== undefined && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-mono font-medium">
                  {formatTime(currentSession.timeRemaining)}
                </span>
              </div>
            )}
          </div>

          <Progress value={progress} className="w-full" />
        </div>
      )}

      {/* Chat Messages */}
      <Card className="bg-background/30 border-border/50">
        <ScrollArea className="h-96 p-4">
          <div className="space-y-4">
            {!isStarted && (
              <div className="text-center space-y-4 py-8">
                <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-elegant">
                  <Play className="h-8 w-8 text-primary-foreground" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Ready to Start?</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    You'll have 6 questions total: 2 Easy (20s each), 2 Medium (60s each), and 2 Hard (120s each).
                  </p>
                </div>

                <Button
                  onClick={handleStartInterview}
                  className="bg-gradient-primary hover:opacity-90 transition-smooth px-8 py-3"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Interview
                </Button>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] space-y-2`}>
                  <div className="flex items-center space-x-2">
                    {message.sender === 'bot' ? (
                      <Bot className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {message.sender === 'bot' ? 'AI Interviewer' : 'You'}
                    </span>
                  </div>
                  
                  <div
                    className={`p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground ml-6'
                        : 'bg-muted/50 text-foreground'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </Card>

      {/* Answer Input */}
      {currentSession?.isActive && !isCompleted && (
        <div className="space-y-4">
          <Textarea
            placeholder="Type your answer here..."
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="min-h-[100px] bg-background/50 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSubmitAnswer();
              }
            }}
          />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Press Ctrl+Enter to submit or click the button
            </span>
            
            <Button
              onClick={handleSubmitAnswer}
              disabled={!currentAnswer.trim()}
              className="bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Answer
            </Button>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {isCompleted && (
        <div className="text-center space-y-4 py-6">
          <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-success">Interview Complete!</h3>
            <p className="text-muted-foreground">
              Thank you for your time. Your responses are being processed.
            </p>
          </div>
        </div>
      )}
    </CardContent>
  );
};

export default ChatInterface;