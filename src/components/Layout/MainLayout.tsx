import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { MessageSquare, Users, Briefcase } from 'lucide-react';
import IntervieweeTab from '../Interview/IntervieweeTab';
import InterviewerTab from '../Interview/InterviewerTab';
import WelcomeBackModal from '../Modals/WelcomeBackModal';

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('interviewee');

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <WelcomeBackModal />
      
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-xl shadow-elegant">
                <Briefcase className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  InterviewAI Pro
                </h1>
                <p className="text-sm text-muted-foreground">
                  Intelligent Interview Assistant
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Card className="shadow-card border-0 bg-card/50 backdrop-blur-sm">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger 
                value="interviewee" 
                className="data-[state=active]:bg-card data-[state=active]:shadow-card flex items-center space-x-2 h-12"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Interviewee Chat</span>
              </TabsTrigger>
              <TabsTrigger 
                value="interviewer"
                className="data-[state=active]:bg-card data-[state=active]:shadow-card flex items-center space-x-2 h-12"
              >
                <Users className="h-4 w-4" />
                <span>Interviewer Dashboard</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="interviewee" className="mt-6">
              <IntervieweeTab />
            </TabsContent>

            <TabsContent value="interviewer" className="mt-6">
              <InterviewerTab />
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
};

export default MainLayout;