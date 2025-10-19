'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Calendar, Users, Edit3, Trash2, Target, Image, X, CheckCircle } from 'lucide-react';
import { Tournament } from '@/types/database';
import { TournamentCreator } from './TournamentCreator';
import { MatchEditor } from './MatchEditor';
import MediaGallery from '@/components/ui/MediaGallery';
import { getAllTournaments, createTournament, updateTournament, deleteTournament, setupNewTournament, createTournamentWithParticipants, deleteTournamentMediaFile, uploadTournamentPhoto, uploadTournamentVideo, uploadTournamentThumbnail, updateTournamentMedia, checkAndAssignTournamentAchievements, generateTournamentAchievements } from '@/lib/supabase';

export const AdminTournamentPanel: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupMessage, setSetupMessage] = useState('');

  const [editingMatches, setEditingMatches] = useState<Tournament | null>(null);
  const [managingMedia, setManagingMedia] = useState<Tournament | null>(null);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const tournamentsData = await getAllTournaments();
      setTournaments(tournamentsData);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async (
    tournamentData: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>, 
    participants?: string[], 
    teamAssignments?: Record<string, string>,
    mediaFiles?: { photos?: File[]; videos?: File[]; thumbnail?: File }
  ) => {
    console.log('=== HANDLE CREATE TOURNAMENT DEBUG ===');
    console.log('Tournament data:', tournamentData);
    console.log('Participants:', participants);
    console.log('Team assignments:', teamAssignments);
    
    try {
      let createdTournament;
      
      if (participants && teamAssignments) {
        console.log('Creating tournament with participants...');
        // Create tournament with participants and team assignments
        createdTournament = await createTournamentWithParticipants(tournamentData, participants, teamAssignments);
        console.log('Tournament created successfully:', createdTournament);
      } else {
        console.log('Creating basic tournament without participants...');
        // Create basic tournament without participants
        createdTournament = await createTournament(tournamentData);
        console.log('Basic tournament created successfully:', createdTournament);
      }
      
      // Handle media uploads if provided
      if (mediaFiles && createdTournament) {
        console.log('Uploading media files for tournament:', createdTournament.id);
        
        const mediaUrls: any = {};
        
        // Upload thumbnail
        if (mediaFiles.thumbnail) {
          console.log('Uploading thumbnail...');
          const thumbnailUrl = await uploadTournamentThumbnail(createdTournament.id, mediaFiles.thumbnail);
          mediaUrls.thumbnail_url = thumbnailUrl;
        }
        
        // Upload photos
        if (mediaFiles.photos && mediaFiles.photos.length > 0) {
          console.log('Uploading photos...');
          const photoUrls = [];
          for (const photo of mediaFiles.photos) {
            const photoUrl = await uploadTournamentPhoto(createdTournament.id, photo);
            photoUrls.push(photoUrl);
          }
          mediaUrls.photos = photoUrls;
        }
        
        // Upload videos
        if (mediaFiles.videos && mediaFiles.videos.length > 0) {
          console.log('Uploading videos...');
          const videoUrls = [];
          for (const video of mediaFiles.videos) {
            const videoUrl = await uploadTournamentVideo(createdTournament.id, video);
            videoUrls.push(videoUrl);
          }
          mediaUrls.videos = videoUrls;
        }
        
        // Update tournament with media URLs
        if (Object.keys(mediaUrls).length > 0) {
          console.log('Updating tournament with media URLs:', mediaUrls);
          await updateTournamentMedia(createdTournament.id, mediaUrls);
        }
      }
      
      console.log('Reloading tournaments...');
      await loadTournaments();
      console.log('Closing creator...');
      setShowCreator(false);
      console.log('Tournament creation completed successfully!');
      
    } catch (error) {
      console.error('=== ERROR CREATING TOURNAMENT ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Show more detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
      alert(`Błąd podczas tworzenia turnieju: ${errorMessage}`);
    }
  };

  const handleUpdateTournament = async (
    tournamentData: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>,
    participants?: string[], 
    teamAssignments?: Record<string, string>,
    mediaFiles?: { photos?: File[]; videos?: File[]; thumbnail?: File }
  ) => {
    if (!editingTournament) return;
    
    try {
      // First update the basic tournament data
      await updateTournament(editingTournament.id, tournamentData);
      
      // Handle media uploads if any files are provided
      if (mediaFiles) {
        const mediaUrls: { photos?: string[]; videos?: string[]; thumbnail_url?: string } = {};
        
        // Upload thumbnail if provided
        if (mediaFiles.thumbnail) {
          try {
            const thumbnailUrl = await uploadTournamentThumbnail(editingTournament.id, mediaFiles.thumbnail);
            mediaUrls.thumbnail_url = thumbnailUrl;
          } catch (error) {
            console.error('Error uploading thumbnail:', error);
            alert('Błąd podczas przesyłania miniatury');
          }
        }
        
        // Upload photos if provided
        if (mediaFiles.photos && mediaFiles.photos.length > 0) {
          try {
            console.log('Uploading photos for tournament update...');
            const photoUrls: string[] = [];
            for (const photo of mediaFiles.photos) {
              console.log('Uploading photo:', photo.name);
              const photoUrl = await uploadTournamentPhoto(editingTournament.id, photo);
              photoUrls.push(photoUrl);
              console.log('Photo uploaded successfully:', photoUrl);
            }
            // Merge with existing photos (ensure we handle null/undefined properly)
            const existingPhotos = Array.isArray(editingTournament.photos) ? editingTournament.photos : [];
            mediaUrls.photos = [...existingPhotos, ...photoUrls];
            console.log('Updated photos array:', mediaUrls.photos);
          } catch (error) {
            console.error('Error uploading photos:', error);
            const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
            alert(`Błąd podczas przesyłania zdjęć: ${errorMessage}`);
            return; // Stop execution if photo upload fails
          }
        }
        
        // Upload videos if provided
        if (mediaFiles.videos && mediaFiles.videos.length > 0) {
          try {
            console.log('Uploading videos for tournament update...');
            const videoUrls: string[] = [];
            for (const video of mediaFiles.videos) {
              console.log('Uploading video:', video.name);
              const videoUrl = await uploadTournamentVideo(editingTournament.id, video);
              videoUrls.push(videoUrl);
              console.log('Video uploaded successfully:', videoUrl);
            }
            // Merge with existing videos (ensure we handle null/undefined properly)
            const existingVideos = Array.isArray(editingTournament.videos) ? editingTournament.videos : [];
            mediaUrls.videos = [...existingVideos, ...videoUrls];
            console.log('Updated videos array:', mediaUrls.videos);
          } catch (error) {
            console.error('Error uploading videos:', error);
            const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
            alert(`Błąd podczas przesyłania filmów: ${errorMessage}`);
            return; // Stop execution if video upload fails
          }
        }
        
        // Update tournament with new media URLs if any were uploaded
        if (Object.keys(mediaUrls).length > 0) {
          try {
            console.log('Updating tournament media with URLs:', mediaUrls);
            await updateTournamentMedia(editingTournament.id, mediaUrls);
            console.log('Tournament media updated successfully');
          } catch (error) {
            console.error('Error updating tournament media:', error);
            const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
            alert(`Błąd podczas aktualizacji mediów turnieju: ${errorMessage}`);
            return; // Stop execution if media update fails
          }
        }
      }
      
      // Note: For now, we don't update participants/teams during edit
      // This could be enhanced in the future
      console.log('Reloading tournaments after update...');
      await loadTournaments();
      console.log('Setting editing tournament to null...');
      setEditingTournament(null);
      console.log('Tournament update completed successfully!');
    } catch (error) {
      console.error('=== ERROR UPDATING TOURNAMENT ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
      alert(`Błąd podczas aktualizacji turnieju: ${errorMessage}`);
    }
  };

  const handleDeleteTournament = async (tournamentId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten turniej? Ta operacja jest nieodwracalna.')) {
      return;
    }

    try {
      await deleteTournament(tournamentId);
      await loadTournaments();
    } catch (error) {
      console.error('Error deleting tournament:', error);
      alert('Błąd podczas usuwania turnieju');
    }
  };

  const toggleTournamentStatus = async (tournament: Tournament) => {
    try {
      await updateTournament(tournament.id, {
        ...tournament,
        is_active: !tournament.is_active
      });
      await loadTournaments();
    } catch (error) {
      console.error('Error updating tournament status:', error);
      alert('Błąd podczas zmiany statusu turnieju');
    }
  };

  const handleCompleteTournament = async (tournament: Tournament) => {
    if (!confirm(`Czy na pewno chcesz zakończyć turniej "${tournament.name}"? Ta operacja wygeneruje osiągnięcia i oznaczy turniej jako zakończony.`)) {
      return;
    }

    try {
      // First, check and assign achievements
      await checkAndAssignTournamentAchievements(tournament.id);
      
      // Mark tournament as completed (inactive) with end date
      await updateTournament(tournament.id, {
        ...tournament,
        is_active: false,
        end_date: new Date().toISOString()
      });
      
      await loadTournaments();
      alert('Turniej został pomyślnie zakończony! Osiągnięcia zostały wygenerowane.');
    } catch (error) {
      console.error('Error completing tournament:', error);
      alert('Błąd podczas kończenia turnieju: ' + (error as Error).message);
    }
  };

  const handleSetupNewTournament = async () => {
    if (!confirm('Czy na pewno chcesz usunąć wszystkie istniejące turnieje i utworzyć nowy turniej "Mistrzostwa Bieżanowa EA FC 25 Listopad 2024" z wynikami? Ta operacja jest nieodwracalna.')) {
      return;
    }

    setSetupLoading(true);
    setSetupMessage('');
    
    try {
      await setupNewTournament();
      setSetupMessage('Turniej został pomyślnie utworzony! Archiwum "Mistrzostwa Bieżanowa EA FC 25 Listopad 2024" zostało dodane z wszystkimi wynikami meczów.');
      await loadTournaments();
    } catch (error) {
      setSetupMessage('Błąd podczas tworzenia turnieju: ' + (error as Error).message);
    } finally {
      setSetupLoading(false);
    }
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    if (!managingMedia) return;
    
    try {
      await deleteTournamentMediaFile(photoUrl);
      
      // Update tournament photos array
      const updatedPhotos = (managingMedia.photos || []).filter(url => url !== photoUrl);
      await updateTournament(managingMedia.id, {
        ...managingMedia,
        photos: updatedPhotos
      });
      
      // Update local state
      setManagingMedia({
        ...managingMedia,
        photos: updatedPhotos
      });
      
      await loadTournaments();
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Błąd podczas usuwania zdjęcia');
    }
  };

  const handleDeleteVideo = async (videoUrl: string) => {
    if (!managingMedia) return;
    
    try {
      await deleteTournamentMediaFile(videoUrl);
      
      // Update tournament videos array
      const updatedVideos = (managingMedia.videos || []).filter(url => url !== videoUrl);
      await updateTournament(managingMedia.id, {
        ...managingMedia,
        videos: updatedVideos
      });
      
      // Update local state
      setManagingMedia({
        ...managingMedia,
        videos: updatedVideos
      });
      
      await loadTournaments();
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Błąd podczas usuwania wideo');
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Ładowanie turniejów...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trophy className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Zarządzanie Turniejami</h2>
        </div>
        <button
          onClick={() => setShowCreator(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>Nowy Turniej</span>
        </button>
      </div>



      {/* Tournament Creation Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Tworzenie Turniejów</h3>
        <p className="text-sm text-green-600 mb-3">
          Aby utworzyć nowy turniej z wybranymi uczestnikami, użyj przycisku "Dodaj Turniej" poniżej. 
          Pozwoli Ci to wybrać konkretnych graczy i przypisać im drużyny.
        </p>
        <div className="flex items-center space-x-2 text-sm text-green-700">
          <Plus className="w-4 h-4" />
          <span>Kliknij "Dodaj Turniej" aby rozpocząć</span>
        </div>
      </div>

      {/* Tournament Creator */}
      {showCreator && (
        <TournamentCreator
          onSave={handleCreateTournament}
          onCancel={() => setShowCreator(false)}
        />
      )}

      {/* Tournament Editor */}
      {editingTournament && (
        <TournamentCreator
          onSave={handleUpdateTournament}
          onCancel={() => setEditingTournament(null)}
          existingTournament={editingTournament}
        />
      )}

      {/* Match Editor */}
      {editingMatches && (
        <MatchEditor
          tournamentId={editingMatches.id}
          tournamentName={editingMatches.name}
          onClose={() => setEditingMatches(null)}
        />
      )}

      {/* Media Management Modal */}
      {managingMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Zarządzaj mediami - {managingMedia.name}
                </h2>
                <button
                  onClick={() => setManagingMedia(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Thumbnail Section */}
                {managingMedia.thumbnail_url && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Miniatura</h3>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <img 
                        src={managingMedia.thumbnail_url} 
                        alt="Tournament thumbnail"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Miniatura turnieju</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Media Gallery */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Galeria mediów</h3>
                  {(managingMedia.photos?.length || 0) > 0 || (managingMedia.videos?.length || 0) > 0 ? (
                    <MediaGallery
                      photos={managingMedia.photos || []}
                      videos={managingMedia.videos || []}
                      showControls={true}
                      onDeletePhoto={handleDeletePhoto}
                      onDeleteVideo={handleDeleteVideo}
                      gridCols={3}
                    />
                  ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-300">Brak mediów do wyświetlenia</p>
                      <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">
                        Dodaj zdjęcia i wideo podczas edycji turnieju
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tournaments List */}
      <div className="space-y-4">
        {tournaments.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Brak turniejów do wyświetlenia</p>
            <button
              onClick={() => setShowCreator(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Utwórz pierwszy turniej
            </button>
          </div>
        ) : (
          tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Trophy size={20} className={tournament.is_active ? 'text-green-600' : 'text-gray-400'} />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{tournament.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>Start: {new Date(tournament.start_date).toLocaleDateString('pl-PL')}</span>
                        </div>
                        {tournament.end_date && (
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>Koniec: {new Date(tournament.end_date).toLocaleDateString('pl-PL')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tournament.is_active
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {tournament.is_active ? 'Aktywny' : 'Nieaktywny'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {tournament.is_active && (
                    <button
                      onClick={() => handleCompleteTournament(tournament)}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors"
                      title="Zakończ turniej i wygeneruj osiągnięcia"
                    >
                      <CheckCircle size={14} />
                      <span>Zakończ</span>
                    </button>
                  )}
                  <button
                    onClick={() => toggleTournamentStatus(tournament)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      tournament.is_active
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {tournament.is_active ? 'Dezaktywuj' : 'Aktywuj'}
                  </button>
                  <button
                    onClick={() => setManagingMedia(tournament)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Zarządzaj mediami"
                  >
                    <Image size={16} />
                  </button>
                  <button
                    onClick={() => setEditingMatches(tournament)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Edytuj wyniki meczów"
                  >
                    <Target size={16} />
                  </button>
                  <button
                    onClick={() => setEditingTournament(tournament)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edytuj turniej"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTournament(tournament.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Usuń turniej"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};