import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { User, Mail, Phone, CheckCircle } from 'lucide-react';
import { updateCandidate } from '@/store/slices/candidateSlice';
import { Candidate } from '@/store/slices/candidateSlice';

interface InfoCollectionProps {
  candidate: Candidate;
}

const InfoCollection = ({ candidate }: InfoCollectionProps) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: candidate.name || '',
    email: candidate.email || '',
    phone: candidate.phone || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const missingFields = [
    !candidate.name && 'name',
    !candidate.email && 'email', 
    !candidate.phone && 'phone'
  ].filter(Boolean) as string[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone format (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = formData.phone.replace(/[^\d+]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      dispatch(updateCandidate({
        id: candidate.id,
        updates: {
          ...formData,
          status: 'ready',
        }
      }));

      toast({
        title: "Profile Complete!",
        description: "Your information has been saved. Ready to start the interview.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <CardContent className="p-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-elegant">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          
          <h3 className="text-xl font-semibold">Complete Your Profile</h3>
          <p className="text-muted-foreground">
            We need a few more details before starting your interview.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Full Name</span>
              {!candidate.name && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`bg-background/50 ${!candidate.name ? 'border-destructive/50' : ''}`}
              required
            />
            {candidate.name && (
              <div className="flex items-center space-x-1 text-sm text-success">
                <CheckCircle className="h-3 w-3" />
                <span>Extracted from resume</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Email Address</span>
              {!candidate.email && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`bg-background/50 ${!candidate.email ? 'border-destructive/50' : ''}`}
              required
            />
            {candidate.email && (
              <div className="flex items-center space-x-1 text-sm text-success">
                <CheckCircle className="h-3 w-3" />
                <span>Extracted from resume</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Phone Number</span>
              {!candidate.phone && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`bg-background/50 ${!candidate.phone ? 'border-destructive/50' : ''}`}
              required
            />
            {candidate.phone && (
              <div className="flex items-center space-x-1 text-sm text-success">
                <CheckCircle className="h-3 w-3" />
                <span>Extracted from resume</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-primary hover:opacity-90 transition-smooth py-3"
            size="lg"
          >
            {isSubmitting ? 'Saving...' : 'Start Interview'}
          </Button>
        </form>

        {missingFields.length > 0 && (
          <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <h4 className="font-medium text-warning mb-2">Missing Information</h4>
            <p className="text-sm text-muted-foreground">
              We couldn't extract the following from your resume: {missingFields.join(', ')}
            </p>
          </div>
        )}
      </div>
    </CardContent>
  );
};

export default InfoCollection;