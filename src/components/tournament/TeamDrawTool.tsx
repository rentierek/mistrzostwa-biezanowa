'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shuffle, Copy, Download, Users, UserCheck } from 'lucide-react';
import { ExportButton } from '@/components/ui/ExportButton';
import { getAllPlayers, getAllTeams } from '@/lib/supabase';
import { Player, Team } from '@/types/database';

interface TeamAssignment {
  player: string;
  team: string;
}

export const TeamDrawTool: React.FC = () => {
  const [playersInput, setPlayersInput] = useState('');
  const [teamsInput, setTeamsInput] = useState('');
  const [assignments, setAssignments] = useState<TeamAssignment[]>([]);
  const [isDrawn, setIsDrawn] = useState(false);
  const [inputMode, setInputMode] = useState<'manual' | 'database'>('manual');
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [players, teams] = await Promise.all([
          getAllPlayers(),
          getAllTeams()
        ]);
        setAvailablePlayers(players);
        setAvailableTeams(teams);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const parseInput = (input: string): string[] => {
    return input
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const togglePlayerSelection = (playerId: string, playerName: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const toggleTeamSelection = (teamId: string, teamName: string) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const performDraw = () => {
    let players: string[];
    let teams: string[];

    if (inputMode === 'manual') {
      players = parseInput(playersInput);
      teams = parseInput(teamsInput);
    } else {
      players = selectedPlayers.map(id => {
        const player = availablePlayers.find(p => p.id === id);
        return player ? player.nickname : '';
      }).filter(name => name);
      
      teams = selectedTeams.map(id => {
        const team = availableTeams.find(t => t.id === id);
        return team ? team.name : '';
      }).filter(name => name);
    }

    if (players.length === 0) {
      alert('Proszę wybrać lub wprowadzić listę graczy.');
      return;
    }

    if (teams.length === 0) {
      alert('Proszę wybrać lub wprowadzić listę drużyn.');
      return;
    }

    if (players.length > teams.length) {
      alert('Liczba graczy nie może być większa niż liczba dostępnych drużyn.');
      return;
    }

    // Shuffle teams and assign to players
    const shuffledTeams = shuffleArray(teams);
    const newAssignments: TeamAssignment[] = players.map((player, index) => ({
      player,
      team: shuffledTeams[index]
    }));

    setAssignments(newAssignments);
    setIsDrawn(true);
  };

  const resetDraw = () => {
    setAssignments([]);
    setIsDrawn(false);
    setSelectedPlayers([]);
    setSelectedTeams([]);
  };

  const copyToClipboard = () => {
    const text = assignments
      .map(assignment => `${assignment.player} - ${assignment.team}`)
      .join('\n');
    
    navigator.clipboard.writeText(text).then(() => {
      alert('Wyniki zostały skopiowane do schowka!');
    }).catch(() => {
      alert('Nie udało się skopiować do schowka.');
    });
  };

  // Prepare data for export
  const exportData = assignments.map((assignment, index) => ({
    'Nr': index + 1,
    'Gracz': assignment.player,
    'Drużyna': assignment.team
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Losowanie Drużyn</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Input Mode Toggle */}
          <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <button
              onClick={() => setInputMode('manual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                inputMode === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
              }`}
              disabled={isDrawn}
            >
              <Copy size={16} />
              Wprowadź ręcznie
            </button>
            <button
              onClick={() => setInputMode('database')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                inputMode === 'database'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
              }`}
              disabled={isDrawn || loading}
            >
              <Users size={16} />
              Wybierz z bazy danych
            </button>
          </div>

          {/* Input Section */}
          {inputMode === 'manual' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lista Graczy (jeden w każdej linii)
              </label>
              <textarea
                value={playersInput}
                onChange={(e) => setPlayersInput(e.target.value)}
                placeholder="Gracz1&#10;Gracz2&#10;Gracz3"
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isDrawn}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lista Drużyn (jedna w każdej linii)
              </label>
              <textarea
                value={teamsInput}
                onChange={(e) => setTeamsInput(e.target.value)}
                placeholder="Real Madrid&#10;FC Barcelona&#10;Manchester City"
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isDrawn}
              />
            </div>
          </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Player Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Wybierz Graczy ({selectedPlayers.length} wybranych)
                </label>
                <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">Ładowanie graczy...</div>
                  ) : availablePlayers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Brak dostępnych graczy</div>
                  ) : (
                    availablePlayers.map((player) => (
                      <label
                        key={player.id}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPlayers.includes(player.id)}
                          onChange={() => togglePlayerSelection(player.id, player.nickname)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={isDrawn}
                        />
                        <div className="flex items-center space-x-2">
                          {(player.photo_url || player.avatar_url) && (
                            <img
                              src={player.photo_url || player.avatar_url}
                              alt={player.nickname}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <span className="text-gray-900 dark:text-white">{player.nickname}</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Team Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Wybierz Drużyny ({selectedTeams.length} wybranych)
                </label>
                <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">Ładowanie drużyn...</div>
                  ) : availableTeams.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Brak dostępnych drużyn</div>
                  ) : (
                    availableTeams.map((team) => (
                      <label
                        key={team.id}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTeams.includes(team.id)}
                          onChange={() => toggleTeamSelection(team.id, team.name)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={isDrawn}
                        />
                        <div className="flex items-center space-x-2">
                          {team.badge_url ? (
                            <img
                              src={team.badge_url}
                              alt={team.name}
                              className="w-6 h-6 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                {team.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="text-gray-900 dark:text-white">{team.name}</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isDrawn ? (
              <Button 
                onClick={performDraw}
                className="inline-flex items-center gap-2"
              >
                <Shuffle size={16} />
                Wykonaj Losowanie
              </Button>
            ) : (
              <>
                <Button 
                  onClick={resetDraw}
                  variant="secondary"
                  className="inline-flex items-center gap-2"
                >
                  <Shuffle size={16} />
                  Nowe Losowanie
                </Button>
                <Button 
                  onClick={copyToClipboard}
                  variant="outline"
                  className="inline-flex items-center gap-2"
                >
                  <Copy size={16} />
                  Kopiuj Wyniki
                </Button>
                <ExportButton 
                  data={exportData}
                  fileName={`losowanie-druzyn-${new Date().toISOString().split('T')[0]}`}
                  sheetName="Losowanie Drużyn"
                  variant="outline"
                />
              </>
            )}
          </div>

          {/* Results Section */}
          {isDrawn && assignments.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Wyniki Losowania</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid gap-3">
                  {assignments.map((assignment, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{assignment.player}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-600 text-sm">gra jako</span>
                        <div className="font-medium text-gray-900">{assignment.team}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">Instrukcje:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Wprowadź listę graczy w lewym polu (jeden gracz w każdej linii)</li>
              <li>• Wprowadź listę drużyn w prawym polu (jedna drużyna w każdej linii)</li>
              <li>• Liczba drużyn musi być równa lub większa od liczby graczy</li>
              <li>• Kliknij "Wykonaj Losowanie" aby przydzielić drużyny losowo</li>
              <li>• Możesz skopiować wyniki lub wyeksportować je do pliku Excel</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};