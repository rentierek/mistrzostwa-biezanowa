'use client';

import React, { useState } from 'react';
import { Edit3, Save, X, Trophy } from 'lucide-react';
import { Match } from '@/types/database';

interface MatchScoreEditorProps {
  match: Match;
  onSave: (matchId: string, player1Score: number, player2Score: number) => void;
  onCancel: () => void;
}

export const MatchScoreEditor: React.FC<MatchScoreEditorProps> = ({
  match,
  onSave,
  onCancel
}) => {
  const [player1Score, setPlayer1Score] = useState(match.player1_score || 0);
  const [player2Score, setPlayer2Score] = useState(match.player2_score || 0);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(match.id, player1Score, player2Score);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setPlayer1Score(match.player1_score || 0);
    setPlayer2Score(match.player2_score || 0);
    setIsEditing(false);
    onCancel();
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="font-medium">{match.player1?.nickname}</span>
            <span className="mx-2 text-gray-500">vs</span>
            <span className="font-medium">{match.player2?.nickname}</span>
          </div>
          <div className="flex items-center space-x-2 text-lg font-bold">
            <span className={player1Score > player2Score ? 'text-green-600' : 'text-gray-600'}>
              {player1Score}
            </span>
            <span className="text-gray-400">-</span>
            <span className={player2Score > player1Score ? 'text-green-600' : 'text-gray-600'}>
              {player2Score}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Edit3 size={16} />
          <span>Edytuj</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Trophy size={20} className="text-blue-600" />
          <span>Edycja Wyniku Meczu</span>
        </h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Player 1 Score */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {match.player1?.nickname}
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={player1Score}
              onChange={(e) => setPlayer1Score(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Player 2 Score */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {match.player2?.nickname}
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={player2Score}
              onChange={(e) => setPlayer2Score(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Match Info */}
        <div className="p-3 bg-white rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">
            <p><strong>Turniej:</strong> {match.tournament?.name}</p>
            <p><strong>Data:</strong> {new Date(match.match_date).toLocaleDateString('pl-PL')}</p>
            <p><strong>Status:</strong> {match.is_completed ? 'Zakończony' : 'Zaplanowany'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="flex items-center space-x-1 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X size={16} />
            <span>Anuluj</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save size={16} />
            <span>Zapisz</span>
          </button>
        </div>
      </div>
    </div>
  );
};