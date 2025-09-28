import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Mail, Phone, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Candidate } from '@/store/slices/candidateSlice';

interface CandidateDetailProps {
  candidate: Candidate;
  onBack: () => void;
}

const CandidateDetail = ({ candidate, onBack }: CandidateDetailProps) => {
  const { sessions } = useSelector((state: RootState) => state.interview);
  
  // Find the interview session for this candidate
  const candidateSession = sessions.find(session => session.candidateId === candidate.id);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-success/10 text-success border-success/20';
      case 'Medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'Hard': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const formatDuration = (startTime?: number, endTime?: number) => {
    if (!startTime || !endTime) return 'N/A';
    const duration = Math.round((endTime - startTime) / 1000 / 60);
    return `${duration} minutes`;
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="hover:bg-muted transition-smooth"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{candidate.name}</h2>
          <p className="text-muted-foreground">Candidate Details & Interview Results</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Information */}
        <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Candidate Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{candidate.email}</p>
                </div>
              </div>

              {candidate.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{candidate.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Resume</p>
                  <p className="font-medium">{candidate.resumeFileName || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge 
                  variant={candidate.status === 'completed' ? 'default' : 'secondary'}
                  className={candidate.status === 'completed' ? 'bg-success text-success-foreground' : ''}
                >
                  {candidate.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Applied</span>
                <span className="text-sm font-medium">
                  {new Date(candidate.createdAt).toLocaleDateString()}
                </span>
              </div>

              {candidate.completedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="text-sm font-medium">
                    {new Date(candidate.completedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interview Summary */}
        <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Interview Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {candidateSession && candidate.status === 'completed' ? (
              <>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold">
                    <span className={getScoreColor(candidate.finalScore || 0)}>
                      {candidate.finalScore || 0}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Final Score</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Questions Answered</span>
                    <span className="font-medium">
                      {candidateSession.questions.filter(q => q.answer).length} / {candidateSession.questions.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="font-medium">
                      {formatDuration(candidateSession.startTime, candidateSession.endTime)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Score</span>
                    <span className={`font-medium ${getScoreColor(candidate.finalScore || 0)}`}>
                      {candidate.finalScore || 0}%
                    </span>
                  </div>
                </div>

                {candidate.summary && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">AI Summary</p>
                      <p className="text-sm leading-relaxed">{candidate.summary}</p>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center space-y-3 py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <div>
                  <p className="font-medium">No Interview Data</p>
                  <p className="text-sm text-muted-foreground">
                    {candidate.status === 'interviewing' 
                      ? 'Interview is still in progress'
                      : 'Interview has not been completed yet'
                    }
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question Details */}
        <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Question Breakdown</span>
            </CardTitle>
            <CardDescription>
              Detailed performance on each question
            </CardDescription>
          </CardHeader>
          <CardContent>
            {candidateSession ? (
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {candidateSession.questions.map((question, index) => (
                    <Card key={question.id} className="bg-background/30 border-border/50">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Q{index + 1}</span>
                              <Badge className={getDifficultyColor(question.difficulty)} variant="outline">
                                {question.difficulty}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {question.text}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">Time Limit:</span>
                            <span className="ml-1 font-medium">{formatTime(question.timeLimit)}</span>
                          </div>
                          
                          <div>
                            <span className="text-muted-foreground">Time Used:</span>
                            <span className="ml-1 font-medium">
                              {question.timeSpent ? formatTime(question.timeSpent) : 'N/A'}
                            </span>
                          </div>
                          
                          <div>
                            <span className="text-muted-foreground">Score:</span>
                            <span className={`ml-1 font-medium ${getScoreColor(question.score || 0)}`}>
                              {question.score || 0}%
                            </span>
                          </div>
                          
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <span className="ml-1 font-medium">
                              {question.answer ? 'Answered' : 'Skipped'}
                            </span>
                          </div>
                        </div>

                        {question.answer && (
                          <div className="pt-2 border-t border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Answer:</p>
                            <p className="text-sm bg-muted/30 p-2 rounded text-foreground">
                              {question.answer}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No question data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CandidateDetail;