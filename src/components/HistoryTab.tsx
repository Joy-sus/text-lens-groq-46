
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Clock, Eye, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

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

interface HistoryTabProps {
  history: HistoryEntry[];
  onLoadEntry: (entry: HistoryEntry) => void;
  onClearHistory: () => void;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ history, onLoadEntry, onClearHistory }) => {
  const getAIProbabilityIcon = (probability: number) => {
    if (probability >= 70) return <XCircle className="h-4 w-4 text-red-500" />;
    if (probability >= 40) return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <CheckCircle className="h-4 w-4 text-emerald-500" />;
  };

  const getAIProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-red-600';
    if (probability >= 60) return 'text-orange-600';
    if (probability >= 40) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No Analysis History</h3>
        <p className="text-slate-500 max-w-sm mx-auto">
          Your analysis history will appear here once you start analyzing texts
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Analysis History</h2>
        <Button
          onClick={onClearHistory}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear History
        </Button>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {history.map((entry) => (
            <Card key={entry.id} className="shadow-md border-0 bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {getAIProbabilityIcon(entry.results.aiProbability)}
                    <div>
                      <CardTitle className="text-lg">
                        Analysis #{entry.id.slice(-6)}
                      </CardTitle>
                      <p className="text-sm text-slate-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={entry.isCriticalMode ? "destructive" : "default"}>
                      {entry.isCriticalMode ? 'Critical' : 'Generous'}
                    </Badge>
                    <span className={`text-2xl font-bold ${getAIProbabilityColor(entry.results.aiProbability)}`}>
                      {entry.results.aiProbability}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Question:</p>
                  <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                    {truncateText(entry.question, 150)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Analyzed Text:</p>
                  <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                    {truncateText(entry.answerText, 200)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-50 text-blue-800 border-blue-200">
                    {entry.results.writingStyle}
                  </Badge>
                  <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200">
                    {entry.results.writingApproach}
                  </Badge>
                  <Badge className="bg-purple-50 text-purple-800 border-purple-200">
                    {entry.results.competenceLevel}
                  </Badge>
                  <Badge className={entry.results.authorLikelihood === 'Human' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-red-50 text-red-800 border-red-200'}>
                    {entry.results.authorLikelihood}
                  </Badge>
                </div>

                <Button
                  onClick={() => onLoadEntry(entry)}
                  className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Load This Analysis
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default HistoryTab;
