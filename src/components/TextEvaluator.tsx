
import React, { useState, useEffect } from 'react';
import AnalysisInput from './AnalysisInput';
import AnalysisResults from './AnalysisResults';
import HistoryTab from './HistoryTab';
import { analyzeText } from '@/utils/textAnalysis';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalysisResult {
  aiProbability: number;
  writingStyle: string;
  writingApproach: string;
  competenceLevel: string;
  authorLikelihood: string;
  comments: string;
}

interface HistoryEntry {
  id: string;
  timestamp: number;
  question: string;
  answerText: string;
  judgingCriteria: string;
  isCriticalMode: boolean;
  results: AnalysisResult;
}

const TextEvaluator = () => {
  const [question, setQuestion] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [judgingCriteria, setJudgingCriteria] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCriticalMode, setIsCriticalMode] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('text-analysis-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }
  }, []);

  const saveToHistory = (analysisResults: AnalysisResult) => {
    const historyEntry: HistoryEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      question,
      answerText,
      judgingCriteria,
      isCriticalMode,
      results: analysisResults,
    };

    const newHistory = [historyEntry, ...history].slice(0, 50); // Keep only latest 50 entries
    setHistory(newHistory);
    localStorage.setItem('text-analysis-history', JSON.stringify(newHistory));
  };

  const handleAnalyze = async () => {
    if (!question.trim() || !answerText.trim()) {
      setError('Please provide both a question and answer text.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const analysis = await analyzeText(question, answerText, judgingCriteria, isCriticalMode);
      setResults(analysis);
      saveToHistory(analysis);
    } catch (err) {
      setError('Failed to analyze text. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setQuestion(entry.question);
    setAnswerText(entry.answerText);
    setJudgingCriteria(entry.judgingCriteria);
    setIsCriticalMode(entry.isCriticalMode);
    setResults(entry.results);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl text-white shadow-lg">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
            Academic Text Analyzer
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Advanced AI detection and writing analysis using rigorous academic standards and 
            state-of-the-art language models for comprehensive text evaluation
          </p>
          <div className="flex justify-center gap-6 mt-6 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Critical Standards
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              Advanced Detection
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Academic Rigor
            </span>
          </div>
        </div>

        <Tabs defaultValue="analyzer" className="max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="analyzer">Text Analyzer</TabsTrigger>
            <TabsTrigger value="history">Analysis History</TabsTrigger>
          </TabsList>

          <TabsContent value="analyzer" className="space-y-6">
            {/* Critical/Generous Toggle */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-4 bg-white/60 rounded-xl p-4 border border-slate-200 backdrop-blur-sm">
                <Label htmlFor="detection-mode" className="text-sm font-semibold text-slate-700">
                  Detection Mode:
                </Label>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium ${!isCriticalMode ? 'text-emerald-600' : 'text-slate-500'}`}>
                    Generous
                  </span>
                  <Switch
                    id="detection-mode"
                    checked={isCriticalMode}
                    onCheckedChange={setIsCriticalMode}
                    className="data-[state=checked]:bg-red-500"
                  />
                  <span className={`text-sm font-medium ${isCriticalMode ? 'text-red-600' : 'text-slate-500'}`}>
                    Critical
                  </span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <AnalysisInput
                question={question}
                answerText={answerText}
                judgingCriteria={judgingCriteria}
                isAnalyzing={isAnalyzing}
                error={error}
                isCriticalMode={isCriticalMode}
                onQuestionChange={setQuestion}
                onAnswerChange={setAnswerText}
                onCriteriaChange={setJudgingCriteria}
                onAnalyze={handleAnalyze}
              />

              <AnalysisResults
                results={results}
                isAnalyzing={isAnalyzing}
              />
            </div>
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab 
              history={history} 
              onLoadEntry={loadFromHistory}
              onClearHistory={() => {
                setHistory([]);
                localStorage.removeItem('text-analysis-history');
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TextEvaluator;
