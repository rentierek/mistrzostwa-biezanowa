'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit, Trash2, Search, Calendar, Users } from 'lucide-react';
import { Team } from '@/types/database';
import { getAllTeams, createTeam, updateTeam, deleteTeam } from '@/lib/supabase';
import { TeamEditor } from './TeamEditor';

export const AdminTeamPanel: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await getAllTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = () => {
    setEditingTeam(null);
    setShowEditor(true);
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setShowEditor(true);
  };

  const handleSaveTeam = async (teamData: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setSaving(true);
      
      if (editingTeam) {
        // Update existing team
        await updateTeam(editingTeam.id, teamData);
      } else {
        // Create new team
        await createTeam(teamData);
      }
      
      await loadTeams();
      setShowEditor(false);
      setEditingTeam(null);
    } catch (error) {
      console.error('Error saving team:', error);
      alert('Wystąpił błąd podczas zapisywania drużyny');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (window.confirm(`Czy na pewno chcesz usunąć drużynę "${team.name}"? Ta operacja jest nieodwracalna.`)) {
      try {
        await deleteTeam(team.id);
        await loadTeams();
      } catch (error) {
        console.error('Error deleting team:', error);
        alert('Wystąpił błąd podczas usuwania drużyny');
      }
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      <TeamEditor
        team={editingTeam || undefined}
        onSave={handleSaveTeam}
        onCancel={() => {
          setShowEditor(false);
          setEditingTeam(null);
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
            <Shield className="w-6 h-6 text-blue-600" />
            <span>Zarządzanie Drużynami</span>
          </h3>
          <button
            onClick={handleCreateTeam}
            className="flex items-center space-x-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>Dodaj Drużynę</span>
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
              placeholder="Szukaj drużyny po nazwie..."
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
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">Łączna liczba drużyn</p>
                <p className="text-2xl font-bold text-blue-900">{teams.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600">Możliwe mecze</p>
                <p className="text-2xl font-bold text-green-900">
                  {teams.length > 1 ? Math.floor((teams.length * (teams.length - 1)) / 2) : 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600">Wyniki wyszukiwania</p>
                <p className="text-2xl font-bold text-purple-900">{filteredTeams.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Ładowanie drużyn...</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nie znaleziono drużyn pasujących do wyszukiwania' : 'Brak drużyn w systemie'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((team) => (
              <div key={team.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{team.name}</h4>
                      <p className="text-sm text-gray-500">ID: {team.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditTeam(team)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edytuj drużynę"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Usuń drużynę"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Dodano: {formatDate(team.created_at)}</span>
                  </div>
                  
                  {/* Team Stats Placeholder */}
                  <div className="bg-gray-50 rounded-lg p-3 mt-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Mecze:</span>
                        <span className="ml-1 font-medium">0</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Zwycięstwa:</span>
                        <span className="ml-1 font-medium">0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Zarządzanie drużynami:</p>
              <ul className="space-y-1 text-yellow-700">
                <li>• Dodawaj nowe drużyny do systemu</li>
                <li>• Edytuj nazwy istniejących drużyn</li>
                <li>• Usuwaj drużyny (uwaga: operacja nieodwracalna)</li>
                <li>• Wyszukuj drużyny po nazwie</li>
                <li>• Każda drużyna może uczestniczyć w meczach</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};