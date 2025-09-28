import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  resumeFileName?: string;
  resumeData?: string;
  status: 'incomplete' | 'ready' | 'interviewing' | 'completed';
  finalScore?: number;
  summary?: string;
  createdAt: number;
  completedAt?: number;
}

interface CandidateState {
  candidates: Candidate[];
  currentCandidate: Candidate | null;
}

const initialState: CandidateState = {
  candidates: [],
  currentCandidate: null,
};

const candidateSlice = createSlice({
  name: 'candidate',
  initialState,
  reducers: {
    addCandidate: (state, action: PayloadAction<Omit<Candidate, 'id' | 'createdAt'>>) => {
      const candidate: Candidate = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: Date.now(),
      };
      state.candidates.push(candidate);
      state.currentCandidate = candidate;
    },
    
    updateCandidate: (state, action: PayloadAction<{ id: string; updates: Partial<Candidate> }>) => {
      const index = state.candidates.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.candidates[index] = { ...state.candidates[index], ...action.payload.updates };
        if (state.currentCandidate?.id === action.payload.id) {
          state.currentCandidate = state.candidates[index];
        }
      }
    },
    
    setCurrentCandidate: (state, action: PayloadAction<string>) => {
      const candidate = state.candidates.find(c => c.id === action.payload);
      state.currentCandidate = candidate || null;
    },
    
    completeCandidate: (state, action: PayloadAction<{ id: string; score: number; summary: string }>) => {
      const index = state.candidates.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.candidates[index].status = 'completed';
        state.candidates[index].finalScore = action.payload.score;
        state.candidates[index].summary = action.payload.summary;
        state.candidates[index].completedAt = Date.now();
      }
    },
    
    uploadResume: (state, action: PayloadAction<{ candidateId: string; fileName: string; data: string }>) => {
      const index = state.candidates.findIndex(c => c.id === action.payload.candidateId);
      if (index !== -1) {
        state.candidates[index].resumeFileName = action.payload.fileName;
        state.candidates[index].resumeData = action.payload.data;
      }
    },
    
    extractResumeFields: (state, action: PayloadAction<{ candidateId: string; name?: string; email?: string; phone?: string }>) => {
      const index = state.candidates.findIndex(c => c.id === action.payload.candidateId);
      if (index !== -1) {
        const updates = { ...action.payload };
        delete updates.candidateId;
        state.candidates[index] = { ...state.candidates[index], ...updates };
        
        if (state.currentCandidate?.id === action.payload.candidateId) {
          state.currentCandidate = state.candidates[index];
        }
      }
    },
    
    clearCurrentCandidate: (state) => {
      state.currentCandidate = null;
    },
  },
});

export const {
  addCandidate,
  updateCandidate,
  setCurrentCandidate,
  completeCandidate,
  uploadResume,
  extractResumeFields,
  clearCurrentCandidate,
} = candidateSlice.actions;

export default candidateSlice.reducer;