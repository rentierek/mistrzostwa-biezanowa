'use client';

import React, { useState } from 'react';
import { User, Save, X, Mail, Image } from 'lucide-react';
import { Player } from '@/types/database';

interface PlayerEditorProps {
  player?: Player;
  onSave: (playerData: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export const PlayerEditor: React.FC<PlayerEditorProps> = ({
  player,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    nickname: player?.nickname || '',
    email: player?.email || '',
    avatar_url: player?.avatar_url || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Pseudonim jest wymagany';
    } else if (formData.nickname.trim().length < 2) {
      newErrors.nickname = 'Pseudonim musi mieć co najmniej 2 znaki';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Nieprawidłowy format adresu email';
    }

    if (formData.avatar_url && !isValidUrl(formData.avatar_url)) {
      newErrors.avatar_url = 'Nieprawidłowy format URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        nickname: formData.nickname.trim(),
        email: formData.email.trim() || undefined,
        avatar_url: formData.avatar_url.trim() || undefined
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <User className="w-6 h-6 text-blue-600" />
            <span>{player ? 'Edytuj Gracza' : 'Dodaj Nowego Gracza'}</span>
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nickname */}
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
              Pseudonim *
            </label>
            <input
              type="text"
              id="nickname"
              value={formData.nickname}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.nickname ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="np. Kamil_K"
            />
            {errors.nickname && (
              <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email (opcjonalny)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="gracz@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Avatar URL */}
          <div>
            <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 mb-2">
              URL Awatara (opcjonalny)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Image className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                id="avatar_url"
                value={formData.avatar_url}
                onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.avatar_url ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            {errors.avatar_url && (
              <p className="mt-1 text-sm text-red-600">{errors.avatar_url}</p>
            )}
          </div>

          {/* Preview */}
          {formData.avatar_url && isValidUrl(formData.avatar_url) && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <img
                src={formData.avatar_url}
                alt="Podgląd awatara"
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Podgląd awatara</p>
                <p className="text-xs text-gray-500">Awatar będzie wyświetlany w tej wielkości</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <User className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Informacje o graczu:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Pseudonim musi być unikalny w systemie</li>
                  <li>• Email jest opcjonalny i może być użyty do powiadomień</li>
                  <li>• Awatar powinien być w formacie JPG, PNG lub GIF</li>
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
              <span>{player ? 'Zapisz Zmiany' : 'Dodaj Gracza'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};