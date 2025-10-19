'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Trophy, Calendar, Users, Undo2 } from 'lucide-react';
import { Match } from '@/types/database';
import { MatchScoreEditor } from './MatchScoreEditor';
import { getAllMatches, updateMatchScore, undoMatch } from '@/lib/supabase';

export const AdminMatchPanel: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const matchesData = await getAllMatches();
      setMatches(matchesData);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScore = async (matchId: string, player1Score: number, player2Score: number) => {
    try {
      await updateMatchScore(matchId, player1Score, player2Score);
      // Update local state
      setMatches(matches.map(match => 
        match.id === matchId 
          ? { ...match, player1_score: player1Score, player2_score: player2Score, is_completed: true }
          : match
      ));
      setEditingMatchId(null);
    } catch (error) {
      console.error('Error updating match score:', error);
      alert('Błąd podczas zapisywania wyniku meczu');
    }
  };

  const handleUndoMatch = async (matchId: string) => {
    if (!confirm('Czy na pewno chcesz cofnąć ten mecz? Wynik zostanie zresetowany.')) {
      return;
    }

    try {
      await undoMatch(matchId);
      // Update local state
      setMatches(matches.map(match => 
        match.id === matchId 
          ? { ...match, player1_score: 0, player2_score: 0, is_completed: false }
          : match
      ));
    } catch (error) {
      console.error('Error undoing match:', error);
      alert('Błąd podczas cofania meczu');
    }
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'completed') return match.is_completed;
    if (filter === 'pending') return !match.is_completed;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Ładowanie meczów...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Panel Administratora - Mecze</h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Trophy size={16} />
          <span>{matches.length} meczów</span>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Wszystkie ({matches.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Zakończone ({matches.filter(m => m.is_completed).length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Oczekujące ({matches.filter(m => !m.is_completed).length})
        </button>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Brak meczów do wyświetlenia</p>
          </div>
        ) : (
          filteredMatches.map((match) => (
            <div key={match.id}>
              {editingMatchId === match.id ? (
                <MatchScoreEditor
                  match={match}
                  onSave={handleSaveScore}
                  onCancel={() => setEditingMatchId(null)}
                />
              ) : (
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Users size={16} className="text-gray-400 dark:text-gray-500" />
                        <span className="font-medium text-gray-900 dark:text-white">{match.player1?.nickname}</span>
                        <span className="text-gray-500 dark:text-gray-400">vs</span>
                        <span className="font-medium text-gray-900 dark:text-white">{match.player2?.nickname}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-bold ${
                          match.player1_score > match.player2_score ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {match.player1_score}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                        <span className={`text-lg font-bold ${
                          match.player2_score > match.player1_score ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {match.player2_score}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar size={14} />
                        <span>{new Date(match.match_date).toLocaleDateString('pl-PL')}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        match.is_completed
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400'
                          : 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-400'
                      }`}>
                        {match.is_completed ? 'Zakończony' : 'Oczekujący'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingMatchId(match.id)}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                      >
                        Edytuj wynik
                      </button>
                      {match.is_completed && (
                        <button
                          onClick={() => handleUndoMatch(match.id)}
                          className="px-3 py-1 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors text-sm font-medium flex items-center space-x-1"
                          title="Cofnij mecz"
                        >
                          <Undo2 size={14} />
                          <span>Cofnij</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};