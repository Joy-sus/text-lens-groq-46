
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, MessageSquare, Brain, Target, Zap } from 'lucide-react';

interface AnalysisInputProps {
  question: string;
  answerText: string;
  judgingCriteria: string;
  isAnalyzing: boolean;
  error: string | null;
  onQuestionChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
  onCriteriaChange: (value: string) => void;
  onAnalyze: () => void;
}

const AnalysisInput: React.FC<AnalysisInputProps> = ({
  question,
  answerText,
  judgingCriteria,
  isAnalyzing,
  error,
  onQuestionChange,
  onAnswerChange,
  onCriteriaChange,
  onAnalyze,
}) => {
  return (
    <Card className="h-fit shadow-xl border-0 bg-gradient-to-br from-slate-50 to-blue-50/30 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-slate-800">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
            <FileText className="h-5 w-5" />
          </div>
          Text Analysis Input
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          Provide the content for rigorous academic analysis using advanced AI detection models
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="question" className="text-sm font-semibold flex items-center gap-2 text-slate-700">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            Original Question/Prompt <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="question"
            placeholder="Enter the original question, assignment prompt, or context that generated the response..."
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            className="min-h-[110px] resize-none border-slate-200 bg-white/70 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="answer" className="text-sm font-semibold flex items-center gap-2 text-slate-700">
            <Brain className="h-4 w-4 text-indigo-600" />
            Response Text to Analyze <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="answer"
            placeholder="Paste the text response that you want to analyze for AI probability and writing characteristics..."
            value={answerText}
            onChange={(e) => onAnswerChange(e.target.value)}
            className="min-h-[220px] resize-none border-slate-200 bg-white/70 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>{answerText.length} characters</span>
            <span>{answerText.split(/\s+/).filter(word => word.length > 0).length} words</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="criteria" className="text-sm font-semibold flex items-center gap-2 text-slate-700">
            <Target className="h-4 w-4 text-purple-600" />
            Evaluation Criteria <span className="text-slate-400">(Optional)</span>
          </Label>
          <Input
            id="criteria"
            placeholder="e.g., Academic rigor, Creative expression, Technical accuracy, Argumentative strength..."
            value={judgingCriteria}
            onChange={(e) => onCriteriaChange(e.target.value)}
            className="border-slate-200 bg-white/70 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <Button
          onClick={onAnalyze}
          disabled={isAnalyzing || !question.trim() || !answerText.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:transform-none disabled:hover:scale-100"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing with Critical Standards...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-5 w-5" />
              Perform Critical Analysis
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnalysisInput;
