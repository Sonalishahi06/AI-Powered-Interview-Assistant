import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RootState } from '@/store/store';
import { resumeInterview, clearCurrentSession } from '@/store/slices/interviewSlice';
import { clearCurrentCandidate } from '@/store/slices/candidateSlice';
import { RotateCcw, X, Clock } from 'lucide-react';

const WelcomeBackModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  
  const { currentSession } = useSelector((state: RootState) => state.interview);
  const { currentCandidate } = useSelector((state: RootState) => state.candidate);

  useEffect(() => {
    // Show modal if there's an unfinished session
    if (currentSession && currentSession.isActive && !currentSession.isPaused) {
      setIsOpen(true);
    }
  }, [currentSession]);

  const handleResume = () => {
    dispatch(resumeInterview());
    setIsOpen(false);
  };

  const handleStartFresh = () => {
    dispatch(clearCurrentSession());
    dispatch(clearCurrentCandidate());
    setIsOpen(false);
  };

  if (!currentSession || !currentCandidate) return null;

  const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
  const progress = ((currentSession.currentQuestionIndex) / currentSession.questions.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-lg">
            <RotateCcw className="h-5 w-5 text-primary" />
            <span>Welcome Back!</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            You have an unfinished interview session for <strong>{currentCandidate.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{currentSession.currentQuestionIndex + 1} of {currentSession.questions.length}</span>
            </div>
            
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-smooth"
                style={{ width: `${progress}%` }}
              />
            </div>

            {currentQuestion && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  Current: {currentQuestion.difficulty} Question ({currentQuestion.timeLimit}s)
                </span>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={handleResume}
              className="flex-1 bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Resume Interview
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleStartFresh}
              className="flex-1 hover:bg-destructive hover:text-destructive-foreground transition-smooth"
            >
              <X className="h-4 w-4 mr-2" />
              Start Fresh
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeBackModal;