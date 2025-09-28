import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, TrendingUp, TrendingDown, Clock, FileText, Eye } from 'lucide-react';
import CandidateDetail from './CandidateDetail';
import { Candidate } from '@/store/slices/candidateSlice';

const InterviewerTab = () => {
  const { candidates } = useSelector((state: RootState) => state.candidate);
  const { sessions } = useSelector((state: RootState) => state.interview);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Filter and sort candidates
  const filteredCandidates = candidates
    .filter(candidate => 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.finalScore || 0) - (a.finalScore || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return b.createdAt - a.createdAt;
        default:
          return 0;
      }
    });

  const getStatusBadge = (status: string, score?: number) => {
    switch (status) {
      case 'completed':
        const variant = score && score >= 80 ? 'default' : 
                      score && score >= 60 ? 'secondary' : 'destructive';
        return <Badge variant={variant}>{status}</Badge>;
      case 'interviewing':
        return <Badge variant="secondary" className="bg-warning/10 text-warning">In Progress</Badge>;
      case 'ready':
        return <Badge variant="outline">Ready</Badge>;
      case 'incomplete':
        return <Badge variant="outline" className="text-muted-foreground">Incomplete</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreIcon = (score?: number) => {
    if (!score) return null;
    return score >= 70 ? 
      <TrendingUp className="h-4 w-4 text-success" /> : 
      <TrendingDown className="h-4 w-4 text-destructive" />;
  };

  if (selectedCandidate) {
    return (
      <CandidateDetail 
        candidate={selectedCandidate}
        onBack={() => setSelectedCandidate(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Interviewer Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor candidate progress and review interview results
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{candidates.length}</p>
                <p className="text-xs text-muted-foreground">Total Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-warning" />
              <div>
                <p className="text-2xl font-bold">
                  {candidates.filter(c => c.status === 'interviewing').length}
                </p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <div>
                <p className="text-2xl font-bold">
                  {candidates.filter(c => c.status === 'completed').length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(
                    candidates
                      .filter(c => c.finalScore)
                      .reduce((sum, c) => sum + (c.finalScore || 0), 0) /
                    Math.max(candidates.filter(c => c.finalScore).length, 1)
                  )}%
                </p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-card">
        <CardHeader>
          <CardTitle>Candidate List</CardTitle>
          <CardDescription>
            Search and filter candidates by status, score, or other criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40 bg-background/50">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Score (High to Low)</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="date">Date (Recent First)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Candidate List */}
          <div className="space-y-3">
            {filteredCandidates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No candidates found</p>
                <p className="text-sm">Upload resumes in the Interviewee tab to get started</p>
              </div>
            ) : (
              filteredCandidates.map((candidate) => (
                <Card key={candidate.id} className="bg-background/50 border-border/50 hover:shadow-card transition-smooth cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                          {getStatusBadge(candidate.status, candidate.finalScore)}
                          {candidate.finalScore && getScoreIcon(candidate.finalScore)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{candidate.email}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>
                            Applied: {new Date(candidate.createdAt).toLocaleDateString()}
                          </span>
                          {candidate.finalScore && (
                            <span className="font-medium">Score: {candidate.finalScore}%</span>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedCandidate(candidate)}
                        className="hover:bg-primary hover:text-primary-foreground transition-smooth"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewerTab;