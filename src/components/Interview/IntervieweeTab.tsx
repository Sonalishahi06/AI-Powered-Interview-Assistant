import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import ResumeUpload from './ResumeUpload';
import ChatInterface from './ChatInterface';
import InfoCollection from './InfoCollection';
import { Card } from '@/components/ui/card';

const IntervieweeTab = () => {
  const dispatch = useDispatch();
  const { currentCandidate } = useSelector((state: RootState) => state.candidate);
  const { currentSession } = useSelector((state: RootState) => state.interview);

  const renderCurrentStep = () => {
    // No candidate - start with resume upload
    if (!currentCandidate) {
      return <ResumeUpload />;
    }

    // Candidate exists but missing info - collect missing fields
    if (currentCandidate.status === 'incomplete') {
      return <InfoCollection candidate={currentCandidate} />;
    }

    // Everything ready - show chat interface
    return <ChatInterface />;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {!currentCandidate && "Welcome to Your Interview"}
          {currentCandidate?.status === 'incomplete' && "Let's Complete Your Profile"}
          {currentCandidate?.status === 'ready' && "Ready to Start!"}
          {currentCandidate?.status === 'interviewing' && "Interview in Progress"}
          {currentCandidate?.status === 'completed' && "Interview Completed"}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {!currentCandidate && "Upload your resume to get started with the AI-powered interview process."}
          {currentCandidate?.status === 'incomplete' && "We need a few more details before we can begin your interview."}
          {currentCandidate?.status === 'ready' && "Your profile is complete. Let's begin the technical interview!"}
          {currentCandidate?.status === 'interviewing' && "Answer each question to the best of your ability within the time limit."}
          {currentCandidate?.status === 'completed' && "Thank you for completing the interview. Your results are being processed."}
        </p>
      </div>

      <Card className="shadow-card border-0 bg-card/30 backdrop-blur-sm">
        {renderCurrentStep()}
      </Card>
    </div>
  );
};

export default IntervieweeTab;