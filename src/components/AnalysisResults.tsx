
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface AnalysisResult {
  aiProbability: number;
  writingStyle: string;
  writingApproach: string;
  competenceLevel: string;
  authorLikelihood: string;
  comments: string;
}

interface AnalysisResultsProps {
  results: AnalysisResult | null;
  isAnalyzing: boolean;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ results, isAnalyzing }) => {
  const getCompetenceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'basic': return 'bg-red-50 text-red-700 border-red-200';
      case 'intermediate': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'advanced': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'expert': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'formulaic': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getAIProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-red-600';
    if (probability >= 60) return 'text-orange-600';
    if (probability >= 40) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const getAIProbabilityIcon = (probability: number) => {
    if (probability >= 70) return <XCircle className="h-5 w-5 text-red-500" />;
    if (probability >= 40) return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    return <CheckCircle className="h-5 w-5 text-emerald-500" />;
  };

  const getProgressBarColor = (probability: number) => {
    if (probability >= 80) return 'bg-red-500';
    if (probability >= 60) return 'bg-orange-500';
    if (probability >= 40) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <Card className="h-fit shadow-xl border-0 bg-gradient-to-br from-slate-50 to-purple-50/30 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-slate-800">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg text-white">
            <Brain className="h-5 w-5" />
          </div>
          Critical Analysis Results
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          Comprehensive evaluation using advanced detection algorithms
        </p>
      </CardHeader>
      <CardContent>
        {!results && !isAnalyzing && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Ready for Analysis</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Enter your text content and click "Perform Critical Analysis" to receive detailed insights
            </p>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-6" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Analyzing Content</h3>
            <p className="text-slate-600">Applying critical standards and advanced detection methods...</p>
          </div>
        )}

        {results && (
          <div className="space-y-8">
            {/* AI Probability Section */}
            <div className="bg-white/60 rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getAIProbabilityIcon(results.aiProbability)}
                  <h3 className="font-bold text-slate-800">AI Generation Probability</h3>
                </div>
                <span className={`text-3xl font-bold ${getAIProbabilityColor(results.aiProbability)}`}>
                  {results.aiProbability}%
                </span>
              </div>
              <div className="relative">
                <Progress value={results.aiProbability} className="h-4" />
                <div 
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${getProgressBarColor(results.aiProbability)}`}
                  style={{ width: `${results.aiProbability}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between text-sm text-slate-600">
                <span>Human-like</span>
                <span>AI-generated</span>
              </div>
            </div>

            {/* Classification Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/60 rounded-xl p-5 border border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Writing Style
                </h4>
                <Badge className="bg-blue-50 text-blue-800 border-blue-200 px-3 py-1 text-sm font-medium">
                  {results.writingStyle}
                </Badge>
              </div>

              <div className="bg-white/60 rounded-xl p-5 border border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Writing Approach
                </h4>
                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 px-3 py-1 text-sm font-medium">
                  {results.writingApproach}
                </Badge>
              </div>

              <div className="bg-white/60 rounded-xl p-5 border border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Competence Level
                </h4>
                <Badge className={`${getCompetenceColor(results.competenceLevel)} px-3 py-1 text-sm font-medium border`}>
                  {results.competenceLevel}
                </Badge>
              </div>

              <div className="bg-white/60 rounded-xl p-5 border border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Author Classification
                </h4>
                <Badge className={results.authorLikelihood === 'Human' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-red-50 text-red-800 border-red-200'} 
                  style={{ padding: '4px 12px', fontSize: '14px', fontWeight: '500' }}
                >
                  {results.authorLikelihood}
                </Badge>
              </div>
            </div>

            {/* Detailed Comments */}
            <div className="bg-white/60 rounded-xl border border-slate-200">
              <div className="p-6">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="p-1 bg-slate-200 rounded">
                    <Brain className="h-4 w-4 text-slate-600" />
                  </div>
                  Critical Analysis Commentary
                </h4>
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                    {results.comments}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisResults;
