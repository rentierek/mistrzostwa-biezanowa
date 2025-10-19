'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, Save, X, Trophy, Calendar, GripVertical } from 'lucide-react';
import { MatchWithDetails } from '@/types/database';
import { getMatchesForTournament, updateMatchScore, updateMatchOrder } from '@/lib/supabase';

interface MatchEditorProps {
  tournamentId: string;
  tournamentName: string;
  onClose: () => void;
}

export const MatchEditor: React.FC<MatchEditorProps> = ({ tournamentId, tournamentName, onClose }) => {
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editScores, setEditScores] = useState<{ player1Score: number; player2Score: number }>({ player1Score: 0, player2Score: 0 });
  const [saving, setSaving] = useState(false);
  const [draggedMatch, setDraggedMatch] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    loadMatches();
  }, [tournamentId]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const matchesData = await getMatchesForTournament(tournamentId);
      setMatches(matchesData);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (match: MatchWithDetails) => {
    setEditingMatch(match.id);
    setEditScores({
      player1Score: match.player1_score,
      player2Score: match.player2_score
    });
  };

  const cancelEditing = () => {
    setEditingMatch(null);
    setEditScores({ player1Score: 0, player2Score: 0 });
  };

  const saveMatch = async (matchId: string) => {
    try {
      setSaving(true);
      await updateMatchScore(matchId, editScores.player1Score, editScores.player2Score);
      await loadMatches(); // Reload matches to get updated data
      setEditingMatch(null);
      setEditScores({ player1Score: 0, player2Score: 0 });
    } catch (error) {
      console.error('Error updating match:', error);
      alert('Błąd podczas aktualizacji wyniku meczu');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, matchId: string) => {
    setDraggedMatch(matchId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedMatch) return;
    
    const draggedIndex = matches.findIndex(match => match.id === draggedMatch);
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedMatch(null);
      setDragOverIndex(null);
      return;
    }

    // Create new matches array with reordered items
    const newMatches = [...matches];
    const [draggedItem] = newMatches.splice(draggedIndex, 1);
    newMatches.splice(dropIndex, 0, draggedItem);

    // Update local state immediately for better UX
    setMatches(newMatches);

    try {
      // Create match order updates
      const matchOrders = newMatches.map((match, index) => ({
        matchId: match.id,
        order: index
      }));

      // Update order in database
      await updateMatchOrder(tournamentId, matchOrders);
    } catch (error) {
      console.error('Error updating match order:', error);
      // Revert local state on error
      await loadMatches();
      alert('Błąd podczas zmiany kolejności meczów');
    }

    setDraggedMatch(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedMatch(null);
    setDragOverIndex(null);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Ładowanie meczów...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edycja Wyników Meczów</h2>
              <p className="text-gray-600">{tournamentName}</p>
              <p className="text-sm text-blue-600 mt-1">Przeciągnij mecze, aby zmienić ich kolejność</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Brak meczów w tym turnieju</p>
            </div>
          ) : (
            matches.map((match, index) => (
              <div
                key={match.id}
                draggable
                onDragStart={(e) => handleDragStart(e, match.id)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-all cursor-move ${
                  draggedMatch === match.id 
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 opacity-50' 
                    : dragOverIndex === index 
                      ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600 border-2' 
                      : 'bg-white dark:bg-gray-800 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Drag Handle */}
                  <div className="flex items-center mr-3">
                    <GripVertical className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" />
                  </div>
                  
                  {/* Match Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar size={14} />
                        <span>{formatDate(match.match_date)}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        match.is_completed
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        {match.is_completed ? 'Zakończony' : 'Oczekujący'}
                      </span>
                    </div>

                    {/* Players and Teams */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Player 1 */}
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="font-semibold text-gray-900 dark:text-white">{match.player1.nickname}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{match.team1.name}</div>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="flex items-center space-x-2 px-4">
                          {editingMatch === match.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="0"
                                max="20"
                                value={editScores.player1Score}
                                onChange={(e) => setEditScores(prev => ({ ...prev, player1Score: parseInt(e.target.value) || 0 }))}
                                className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center font-bold text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <span className="text-gray-500 dark:text-gray-400 font-bold">:</span>
                              <input
                                type="number"
                                min="0"
                                max="20"
                                value={editScores.player2Score}
                                onChange={(e) => setEditScores(prev => ({ ...prev, player2Score: parseInt(e.target.value) || 0 }))}
                                className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center font-bold text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          ) : (
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {match.player1_score} : {match.player2_score}
                            </div>
                          )}
                        </div>

                        {/* Player 2 */}
                        <div className="flex items-center space-x-2">
                          <div className="text-left">
                            <div className="font-semibold text-gray-900 dark:text-white">{match.player2.nickname}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{match.team2.name}</div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        {editingMatch === match.id ? (
                          <>
                            <button
                              onClick={() => saveMatch(match.id)}
                              disabled={saving}
                              className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                            >
                              <Save size={14} />
                              <span>{saving ? 'Zapisywanie...' : 'Zapisz'}</span>
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={saving}
                              className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
                            >
                              <X size={14} />
                              <span>Anuluj</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startEditing(match)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Edit3 size={14} />
                            <span>Edytuj</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};