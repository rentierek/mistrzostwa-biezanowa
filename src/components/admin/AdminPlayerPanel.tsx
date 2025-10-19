'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, Mail, Calendar } from 'lucide-react';
import { Player } from '@/types/database';
import { getAllPlayers, createPlayer, updatePlayer, deletePlayer } from '@/lib/supabase';
import { PlayerEditor } from './PlayerEditor';

export const AdminPlayerPanel: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const data = await getAllPlayers();
      setPlayers(data);
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlayer = () => {
    setEditingPlayer(null);
    setShowEditor(true);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setShowEditor(true);
  };

  const handleSavePlayer = async (playerData: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setSaving(true);
      
      if (editingPlayer) {
        // Update existing player
        await updatePlayer(editingPlayer.id, playerData);
      } else {
        // Create new player
        await createPlayer(playerData);
      }
      
      await loadPlayers();
      setShowEditor(false);
      setEditingPlayer(null);
    } catch (error) {
      console.error('Error saving player:', error);
      alert('Wystąpił błąd podczas zapisywania gracza');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlayer = async (player: Player) => {
    if (window.confirm(`Czy na pewno chcesz usunąć gracza "${player.nickname}"? Ta operacja jest nieodwracalna.`)) {
      try {
        await deletePlayer(player.id);
        await loadPlayers();
      } catch (error) {
        console.error('Error deleting player:', error);
        alert('Wystąpił błąd podczas usuwania gracza');
      }
    }
  };

  const filteredPlayers = players.filter(player =>
    player.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (player.email && player.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (showEditor) {
    return (
      <PlayerEditor
        player={editingPlayer || undefined}
        onSave={handleSavePlayer}
        onCancel={() => {
          setShowEditor(false);
          setEditingPlayer(null);
        }}
      />
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Zarządzanie Graczami</span>
          </h3>
          <button
            onClick={handleCreatePlayer}
            className="flex items-center space-x-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>Dodaj Gracza</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Szukaj gracza po pseudonimie lub emailu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">Łączna liczba graczy</p>
                <p className="text-2xl font-bold text-blue-900">{players.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600">Gracze z emailem</p>
                <p className="text-2xl font-bold text-green-900">
                  {players.filter(p => p.email).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600">Wyniki wyszukiwania</p>
                <p className="text-2xl font-bold text-purple-900">{filteredPlayers.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Players List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Ładowanie graczy...</p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nie znaleziono graczy pasujących do wyszukiwania' : 'Brak graczy w systemie'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Gracz</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Data dodania</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        {(player.photo_url || player.avatar_url) ? (
                          <img
                            src={player.photo_url || player.avatar_url}
                            alt={player.nickname}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{player.nickname}</p>
                          <p className="text-sm text-gray-500">ID: {player.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {player.email ? (
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{player.email}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Brak</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{formatDate(player.created_at)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditPlayer(player)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edytuj gracza"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(player)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Usuń gracza"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Users className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Zarządzanie graczami:</p>
              <ul className="space-y-1 text-yellow-700">
                <li>• Dodawaj nowych graczy do systemu</li>
                <li>• Edytuj informacje o istniejących graczach</li>
                <li>• Usuwaj graczy (uwaga: operacja nieodwracalna)</li>
                <li>• Wyszukuj graczy po pseudonimie lub emailu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};