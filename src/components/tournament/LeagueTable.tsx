'use client';

import React from 'react';
import { LeagueTableEntry } from '@/types/database';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ExportButton } from '@/components/ui/ExportButton';

interface LeagueTableProps {
  data: LeagueTableEntry[];
  title?: string;
  showExport?: boolean;
}

export const LeagueTable: React.FC<LeagueTableProps> = ({ 
  data, 
  title = 'Tabela Ligi',
  showExport = true 
}) => {
  // Prepare data for export
  const exportData = data.map(entry => ({
    'Pozycja': entry.position,
    'Gracz': entry.nickname,
    'Drużyna': entry.team_name,
    'Mecze': entry.matches_played,
    'Punkty': entry.points,
    'Zwycięstwa': entry.wins,
    'Remisy': entry.draws,
    'Porażki': entry.losses,
    'Bramki Zdobyte': entry.goals_for,
    'Bramki Stracone': entry.goals_against,
    'Różnica Bramek': entry.goal_difference
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {showExport && data.length > 0 && (
            <ExportButton 
              data={exportData} 
              fileName={`tabela-ligi-${new Date().toISOString().split('T')[0]}`}
              sheetName="Tabela Ligi"
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Brak danych do wyświetlenia
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-600">#</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Gracz</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Drużyna</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600">M</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600">Pkt</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600">Z</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600">R</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600">P</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600">BZ</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600">BS</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600">+/-</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry, index) => (
                  <tr 
                    key={entry.player_id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100' : 
                      index < 3 ? 'bg-gradient-to-r from-green-50 to-green-100' : ''
                    }`}
                  >
                    <td className="py-3 px-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index < 3 ? 'bg-green-500 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {entry.position}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium text-gray-900">{entry.nickname}</div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        {entry.team_badge ? (
                          <img 
                            src={entry.team_badge} 
                            alt={entry.team_name}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-500">
                              {entry.team_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-gray-700 text-xs">{entry.team_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center text-gray-600">{entry.matches_played}</td>
                    <td className="py-3 px-2 text-center">
                      <span className="font-bold text-gray-900">{entry.points}</span>
                    </td>
                    <td className="py-3 px-2 text-center text-green-600">{entry.wins}</td>
                    <td className="py-3 px-2 text-center text-yellow-600">{entry.draws}</td>
                    <td className="py-3 px-2 text-center text-red-600">{entry.losses}</td>
                    <td className="py-3 px-2 text-center text-gray-600">{entry.goals_for}</td>
                    <td className="py-3 px-2 text-center text-gray-600">{entry.goals_against}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`font-medium ${
                        entry.goal_difference > 0 ? 'text-green-600' :
                        entry.goal_difference < 0 ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {entry.goal_difference > 0 ? '+' : ''}{entry.goal_difference}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};