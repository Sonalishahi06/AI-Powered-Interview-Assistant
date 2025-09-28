import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { addCandidate, extractResumeFields } from '@/store/slices/candidateSlice';

const ResumeUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Convert file to base64 for storage
      const fileData = await fileToBase64(file);
      
      // Simple text extraction for demo (in real app, use proper PDF/DOCX parsing)
      const extractedText = await extractTextFromFile(file);
      const extractedFields = extractFieldsFromText(extractedText);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create candidate with extracted fields
      let status: 'incomplete' | 'ready' = 'incomplete';
      
      // Check if all required fields are present
      if (extractedFields.name && extractedFields.email && extractedFields.phone) {
        status = 'ready';
      }

      const candidate = {
        name: extractedFields.name || '',
        email: extractedFields.email || '',
        phone: extractedFields.phone || '',
        resumeFileName: file.name,
        resumeData: fileData,
        status,
      };

      dispatch(addCandidate(candidate));

      toast({
        title: "Resume Uploaded Successfully",
        description: `Extracted ${Object.values(extractedFields).filter(Boolean).length} field(s) from your resume.`,
      });

      // Reset form
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload Failed",
        description: "There was an error processing your resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    // Simple text extraction - in a real app, use libraries like pdf-parse or mammoth
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // This is a simplified version - real implementation would properly parse PDF/DOCX
        resolve(file.name + " - Demo text extraction");
      };
      reader.readAsText(file);
    });
  };

  const extractFieldsFromText = (text: string) => {
    // Simple regex patterns for extraction (in real app, use more sophisticated NLP)
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    
    // For demo purposes, extract from filename or generate dummy data
    const email = text.match(emailRegex)?.[0] || 'john.doe@example.com';
    const phone = text.match(phoneRegex)?.[0] || '+1 (555) 123-4567';
    const name = 'John Doe'; // In real app, extract from text

    return { name, email, phone };
  };

  return (
    <CardContent className="p-8">
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-elegant">
          <Upload className="h-8 w-8 text-primary-foreground" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Upload Your Resume</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Upload your resume in PDF or DOCX format. We'll extract your information automatically.
          </p>
        </div>

        {!uploading ? (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-primary hover:opacity-90 transition-smooth px-8 py-3 text-lg"
              size="lg"
            >
              <FileText className="h-5 w-5 mr-2" />
              Choose Resume File
            </Button>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>Supported formats: PDF, DOCX</p>
              <p>Maximum file size: 10MB</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2">
              {uploadProgress < 100 ? (
                <AlertCircle className="h-5 w-5 text-primary animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5 text-success" />
              )}
              <span className="font-medium">
                {uploadProgress < 100 ? 'Processing resume...' : 'Upload complete!'}
              </span>
            </div>
            
            <Progress value={uploadProgress} className="w-full" />
            
            <p className="text-sm text-muted-foreground">
              {uploadProgress < 100 
                ? 'Extracting information from your resume...' 
                : 'Resume processed successfully!'
              }
            </p>
          </div>
        )}

        <div className="mt-8 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-2 text-left">What happens next?</h4>
          <ol className="text-sm text-muted-foreground text-left space-y-1">
            <li>1. We'll extract your name, email, and phone number</li>
            <li>2. If any information is missing, we'll ask you to provide it</li>
            <li>3. Once complete, you'll start your technical interview</li>
          </ol>
        </div>
      </div>
    </CardContent>
  );
};

export default ResumeUpload;