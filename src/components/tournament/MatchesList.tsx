'use client';

import React from 'react';
import { MatchWithDetails } from '@/types/database';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ExportButton } from '@/components/ui/ExportButton';
import { Calendar, Clock } from 'lucide-react';

interface MatchesListProps {
  matches: MatchWithDetails[];
  title?: string;
  showExport?: boolean;
  maxItems?: number;
}

export const MatchesList: React.FC<MatchesListProps> = ({ 
  matches, 
  title = 'Mecze',
  showExport = true,
  maxItems
}) => {
  const displayMatches = maxItems ? matches.slice(0, maxItems) : matches;

  // Prepare data for export
  const exportData = matches.map(match => ({
    'Data': new Date(match.match_date).toLocaleDateString('pl-PL'),
    'Gracz 1': match.player1.nickname,
    'Drużyna 1': match.team1.name,
    'Wynik 1': match.player1_score,
    'Wynik 2': match.player2_score,
    'Drużyna 2': match.team2.name,
    'Gracz 2': match.player2.nickname,
    'Status': match.is_completed ? 'Zakończony' : 'Zaplanowany'
  }));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {showExport && matches.length > 0 && (
            <ExportButton 
              data={exportData} 
              fileName={`mecze-${new Date().toISOString().split('T')[0]}`}
              sheetName="Mecze"
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {displayMatches.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Brak meczów do wyświetlenia
          </div>
        ) : (
          <div className="space-y-3">
            {displayMatches.map((match) => (
              <div 
                key={match.id} 
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  match.is_completed 
                    ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600' 
                    : 'bg-white dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                }`}
              >
                {/* Match Date and Time */}
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(match.match_date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{formatTime(match.match_date)}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    match.is_completed 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-400' 
                      : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-400'
                  }`}>
                    {match.is_completed ? 'Zakończony' : 'Zaplanowany'}
                  </div>
                </div>

                {/* Match Details */}
                <div className="flex items-center justify-between">
                  {/* Player 1 */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">{match.player1.nickname}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{match.team1.name}</div>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-4 px-6">
                    {match.is_completed ? (
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${
                          match.player1_score > match.player2_score ? 'text-green-600 dark:text-green-400' :
                          match.player1_score < match.player2_score ? 'text-red-600 dark:text-red-400' :
                          'text-gray-600 dark:text-gray-300'
                        }`}>
                          {match.player1_score}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                        <span className={`text-2xl font-bold ${
                          match.player2_score > match.player1_score ? 'text-green-600 dark:text-green-400' :
                          match.player2_score < match.player1_score ? 'text-red-600 dark:text-red-400' :
                          'text-gray-600 dark:text-gray-300'
                        }`}>
                          {match.player2_score}
                        </span>
                      </div>
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500 font-medium">VS</div>
                    )}
                  </div>

                  {/* Player 2 */}
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="flex items-center gap-2">
                      <div className="text-left">
                        <div className="font-medium text-gray-900 dark:text-white">{match.player2.nickname}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{match.team2.name}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {maxItems && matches.length > maxItems && (
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Wyświetlono {maxItems} z {matches.length} meczów
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};