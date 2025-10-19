'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Trophy, Save, X, Users, Shuffle, Target, Image } from 'lucide-react';
import { Tournament, Player, Team } from '@/types/database';
import { getAllPlayers, getAllTeams, uploadTournamentPhoto, uploadTournamentVideo, uploadTournamentThumbnail } from '@/lib/supabase';
import MediaUpload from '@/components/ui/MediaUpload';

interface TournamentCreatorProps {
  onSave: (tournament: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>, participants?: string[], teamAssignments?: Record<string, string>, mediaFiles?: { photos?: File[]; videos?: File[]; thumbnail?: File }) => void;
  onCancel: () => void;
  existingTournament?: Tournament;
}

export const TournamentCreator: React.FC<TournamentCreatorProps> = ({
  onSave,
  onCancel,
  existingTournament
}) => {
  const [formData, setFormData] = useState({
    name: existingTournament?.name || '',
    start_date: existingTournament?.start_date ? existingTournament.start_date.split('T')[0] : '',
    end_date: existingTournament?.end_date ? existingTournament.end_date.split('T')[0] : '',
    is_active: existingTournament?.is_active || false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [teamAssignments, setTeamAssignments] = useState<Record<string, string>>({});
  const [tournamentFormat, setTournamentFormat] = useState<'league' | 'knockout' | 'groups'>('league');
  const [loading, setLoading] = useState(true);
  
  // Media upload state
  const [mediaFiles, setMediaFiles] = useState<{
    photos: File[];
    videos: File[];
    thumbnail?: File;
  }>({
    photos: [],
    videos: [],
    thumbnail: undefined
  });
  const [mediaUrls, setMediaUrls] = useState<{
    photos: string[];
    videos: string[];
    thumbnail_url?: string;
  }>({
    photos: existingTournament?.photos || [],
    videos: existingTournament?.videos || [],
    thumbnail_url: existingTournament?.thumbnail_url
  });
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    loadPlayersAndTeams();
  }, []);

  const loadPlayersAndTeams = async () => {
    try {
      const [playersData, teamsData] = await Promise.all([
        getAllPlayers(),
        getAllTeams()
      ]);
      setPlayers(playersData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading players and teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nazwa turnieju jest wymagana';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Data rozpoczęcia jest wymagana';
    }

    if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
      newErrors.end_date = 'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia';
    }

    // Only validate participants if any are selected
    if (selectedParticipants.length > 0) {
      if (selectedParticipants.length < 2) {
        newErrors.participants = 'Wybierz co najmniej 2 uczestników lub usuń wszystkich';
      }

      // Check if all participants have team assignments
      const missingTeams = selectedParticipants.filter(playerId => !teamAssignments[playerId]);
      if (missingTeams.length > 0) {
        newErrors.teams = 'Wszyscy uczestnicy muszą mieć przypisane drużyny';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== TOURNAMENT CREATION DEBUG ===');
    console.log('Selected participants:', selectedParticipants);
    console.log('Selected participants count:', selectedParticipants.length);
    console.log('Team assignments:', teamAssignments);
    console.log('All players count:', players.length);
    console.log('Media files:', mediaFiles);
    
    // Extra validation: warn if all players are selected
    if (selectedParticipants.length === players.length && players.length > 0) {
      console.warn('⚠️ WARNING: All players are selected! This might be unintentional.');
      console.warn('If you meant to select all players, this is fine. Otherwise, please check your selection.');
    }
    
    // Only validate participants if any are selected
    if (selectedParticipants.length > 0) {
      // Validate that selected participants have team assignments
      const participantsWithoutTeams = selectedParticipants.filter(playerId => !teamAssignments[playerId]);
      if (participantsWithoutTeams.length > 0) {
        console.error('❌ ERROR: Some participants do not have team assignments:', participantsWithoutTeams);
        alert('Wszyscy uczestnicy muszą mieć przypisane drużyny');
        return;
      }
    }
    
    console.log('✅ Validation passed. Creating tournament with', selectedParticipants.length, 'participants');
    
    if (validateForm()) {
      const tournamentData = {
        name: formData.name.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        is_active: formData.is_active,
        ...mediaUrls // Include uploaded media URLs
      };
      
      // Prepare media files for upload
      const mediaFilesToUpload = {
        photos: mediaFiles.photos.length > 0 ? mediaFiles.photos : undefined,
        videos: mediaFiles.videos.length > 0 ? mediaFiles.videos : undefined,
        thumbnail: mediaFiles.thumbnail
      };
      
      onSave(
        tournamentData, 
        selectedParticipants.length > 0 ? selectedParticipants : undefined, 
        selectedParticipants.length > 0 ? teamAssignments : undefined,
        mediaFilesToUpload
      );
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleParticipantToggle = (playerId: string) => {
    console.log('=== PARTICIPANT TOGGLE ===');
    console.log('Player ID:', playerId);
    console.log('Current selected count:', selectedParticipants.length);
    
    setSelectedParticipants(prev => {
      const newParticipants = prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId];
      
      console.log('New selected count:', newParticipants.length);
      console.log('Action:', prev.includes(playerId) ? 'REMOVED' : 'ADDED');
      
      // Remove team assignment if participant is deselected
      if (!newParticipants.includes(playerId)) {
        setTeamAssignments(prevAssignments => {
          const newAssignments = { ...prevAssignments };
          delete newAssignments[playerId];
          return newAssignments;
        });
      }
      
      return newParticipants;
    });
  };

  const handleTeamAssignment = (playerId: string, teamId: string) => {
    setTeamAssignments(prev => ({
      ...prev,
      [playerId]: teamId
    }));
  };

  const randomizeTeams = () => {
    const availableTeams = [...teams];
    const newAssignments: Record<string, string> = {};
    
    selectedParticipants.forEach(playerId => {
      if (availableTeams.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableTeams.length);
        const selectedTeam = availableTeams.splice(randomIndex, 1)[0];
        newAssignments[playerId] = selectedTeam.id;
      }
    });
    
    setTeamAssignments(newAssignments);
  };

  const selectAllPlayers = () => {
    console.log('=== SELECT ALL PLAYERS CALLED ===');
    console.log('This will select all', players.length, 'players');
    console.trace('Call stack:');
    setSelectedParticipants(players.map(p => p.id));
  };

  const clearAllPlayers = () => {
    setSelectedParticipants([]);
    setTeamAssignments({});
  };

  // Media upload handlers
  const handlePhotoUpload = async (file: File) => {
    setUploadingMedia(true);
    try {
      // For now, we'll store the file and upload it after tournament creation
      // This is because we need the tournament ID first
      setMediaFiles(prev => ({
        ...prev,
        photos: [...prev.photos, file]
      }));
      
      // Create a temporary URL for preview
      const tempUrl = URL.createObjectURL(file);
      setMediaUrls(prev => ({
        ...prev,
        photos: [...prev.photos, tempUrl]
      }));
    } catch (error) {
      console.error('Error handling photo upload:', error);
      alert('Błąd podczas przesyłania zdjęcia');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    setUploadingMedia(true);
    try {
      setMediaFiles(prev => ({
        ...prev,
        videos: [...prev.videos, file]
      }));
      
      // Create a temporary URL for preview
      const tempUrl = URL.createObjectURL(file);
      setMediaUrls(prev => ({
        ...prev,
        videos: [...prev.videos, tempUrl]
      }));
    } catch (error) {
      console.error('Error handling video upload:', error);
      alert('Błąd podczas przesyłania filmu');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleThumbnailUpload = async (file: File) => {
    setUploadingMedia(true);
    try {
      setMediaFiles(prev => ({
        ...prev,
        thumbnail: file
      }));
      
      // Create a temporary URL for preview
      const tempUrl = URL.createObjectURL(file);
      setMediaUrls(prev => ({
        ...prev,
        thumbnail_url: tempUrl
      }));
    } catch (error) {
      console.error('Error handling thumbnail upload:', error);
      alert('Błąd podczas przesyłania miniatury');
    } finally {
      setUploadingMedia(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Ładowanie...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-blue-600" />
            <span>{existingTournament ? 'Edytuj Turniej' : 'Utwórz Nowy Turniej'}</span>
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tournament Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nazwa Turnieju *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="np. Mistrzostwa Wiosenne 2024"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                Data Rozpoczęcia *
              </label>
              <input
                type="date"
                id="start_date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.start_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                Data Zakończenia
              </label>
              <input
                type="date"
                id="end_date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.end_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Tournament Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format Turnieju
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="format"
                  value="league"
                  checked={tournamentFormat === 'league'}
                  onChange={(e) => setTournamentFormat(e.target.value as 'league')}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium">Liga</div>
                  <div className="text-sm text-gray-500">Każdy z każdym</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="format"
                  value="knockout"
                  checked={tournamentFormat === 'knockout'}
                  onChange={(e) => setTournamentFormat(e.target.value as 'knockout')}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium">Puchar</div>
                  <div className="text-sm text-gray-500">System eliminacji</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="format"
                  value="groups"
                  checked={tournamentFormat === 'groups'}
                  onChange={(e) => setTournamentFormat(e.target.value as 'groups')}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium">Grupy</div>
                  <div className="text-sm text-gray-500">2 grupy po 4 graczy</div>
                </div>
              </label>
            </div>
          </div>

          {/* Participant Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Wybierz Uczestników (opcjonalne) ({selectedParticipants.length} wybranych)
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={selectAllPlayers}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Wybierz wszystkich
                </button>
                <button
                  type="button"
                  onClick={clearAllPlayers}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Wyczyść
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {players.map(player => (
                <label key={player.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedParticipants.includes(player.id)}
                    onChange={() => handleParticipantToggle(player.id)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">{player.nickname}</span>
                </label>
              ))}
            </div>
            {errors.participants && (
              <p className="mt-1 text-sm text-red-600">{errors.participants}</p>
            )}
          </div>

          {/* Team Assignments */}
          {selectedParticipants.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Przypisanie Drużyn *
                </label>
                <button
                  type="button"
                  onClick={randomizeTeams}
                  className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700"
                >
                  <Shuffle size={14} />
                  <span>Losuj drużyny</span>
                </button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {selectedParticipants.map(playerId => {
                  const player = players.find(p => p.id === playerId);
                  return (
                    <div key={playerId} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{player?.nickname}</span>
                      <select
                        value={teamAssignments[playerId] || ''}
                        onChange={(e) => handleTeamAssignment(playerId, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Wybierz drużynę</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
              {errors.teams && (
                <p className="mt-1 text-sm text-red-600">{errors.teams}</p>
              )}
            </div>
          )}

          {/* Media Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Image className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Media Turnieju</h3>
            </div>
            
            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Miniatura Turnieju
              </label>
              <MediaUpload
                 uploadType="thumbnail"
                 onThumbnailUpload={handleThumbnailUpload}
                 maxFileSize={5} // 5MB
                 disabled={uploadingMedia}
                 multiple={false}
               />
              {mediaUrls.thumbnail_url && (
                <div className="mt-2">
                  <img 
                    src={mediaUrls.thumbnail_url} 
                    alt="Tournament thumbnail" 
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Photos Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zdjęcia Turnieju
              </label>
              <MediaUpload
                 uploadType="photo"
                 onPhotoUpload={handlePhotoUpload}
                 maxFileSize={10} // 10MB
                 disabled={uploadingMedia}
                 multiple={true}
               />
              {mediaUrls.photos.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {mediaUrls.photos.map((url, index) => (
                    <img 
                      key={index}
                      src={url} 
                      alt={`Tournament photo ${index + 1}`} 
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Videos Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filmy Turnieju
              </label>
              <MediaUpload
                 uploadType="video"
                 onVideoUpload={handleVideoUpload}
                 maxFileSize={100} // 100MB
                 disabled={uploadingMedia}
                 multiple={true}
               />
              {mediaUrls.videos.length > 0 && (
                <div className="mt-2 space-y-2">
                  {mediaUrls.videos.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <video 
                        src={url} 
                        className="w-32 h-20 object-cover rounded border"
                        controls
                      />
                      <span className="text-sm text-gray-600">Film {index + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Tournament Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Ustaw jako aktywny turniej
            </label>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Informacje o turnieju:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Tylko jeden turniej może być aktywny w tym samym czasie</li>
                  <li>• Data zakończenia jest opcjonalna i może być ustawiona później</li>
                  <li>• Uczestnicy są opcjonalni - można dodać ich później</li>
                  <li>• Format turnieju określa sposób rozgrywania meczów</li>
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
              <span>{existingTournament ? 'Zapisz Zmiany' : 'Utwórz Turniej'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};