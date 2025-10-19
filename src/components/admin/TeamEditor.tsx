'use client';

import React, { useState } from 'react';
import { Users, Save, X, Shield } from 'lucide-react';
import { Team } from '@/types/database';

interface TeamEditorProps {
  team?: Team;
  onSave: (teamData: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export const TeamEditor: React.FC<TeamEditorProps> = ({
  team,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: team?.name || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nazwa drużyny jest wymagana';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nazwa drużyny musi mieć co najmniej 2 znaki';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Nazwa drużyny nie może być dłuższa niż 50 znaków';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        name: formData.name.trim()
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Popular team suggestions
  const popularTeams = [
    'Real Madrid', 'Barcelona', 'Manchester United', 'Liverpool', 'Chelsea', 'Arsenal',
    'Manchester City', 'Bayern Munich', 'Paris Saint-Germain', 'Juventus', 'AC Milan',
    'Inter Milan', 'Atletico Madrid', 'Borussia Dortmund', 'Ajax', 'Tottenham'
  ];

  const handleSuggestionClick = (teamName: string) => {
    setFormData(prev => ({ ...prev, name: teamName }));
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span>{team ? 'Edytuj Drużynę' : 'Dodaj Nową Drużynę'}</span>
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nazwa drużyny *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="np. Real Madrid"
              maxLength={50}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.name.length}/50 znaków
            </p>
          </div>

          {/* Popular Teams Suggestions */}
          {!team && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Popularne drużyny (kliknij aby wybrać)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {popularTeams.map((teamName) => (
                  <button
                    key={teamName}
                    type="button"
                    onClick={() => handleSuggestionClick(teamName)}
                    className="text-left px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {teamName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Informacje o drużynie:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Nazwa drużyny musi być unikalna w systemie</li>
                  <li>• Możesz użyć nazw prawdziwych klubów piłkarskich</li>
                  <li>• Nazwa będzie wyświetlana w meczach i tabelach</li>
                  <li>• Możesz edytować nazwę w dowolnym momencie</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center space-x-1 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X size={16} />
              <span>Anuluj</span>
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={16} />
              <span>{team ? 'Zapisz Zmiany' : 'Dodaj Drużynę'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};