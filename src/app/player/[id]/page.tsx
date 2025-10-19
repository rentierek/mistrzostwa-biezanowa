'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Player, PlayerStats, Achievement, MatchWithDetails, Team } from '@/types/database';
import { getAllPlayers, getPlayerStats, getPlayerMatches, getPlayerAchievements, uploadPlayerPhoto, deletePlayerPhoto } from '@/lib/supabase';
import AchievementBadge from '@/components/ui/AchievementBadge';
import PhotoUpload from '@/components/ui/PhotoUpload';

interface PlayerProfileData {
  player: Player;
  stats: PlayerStats | null;
  achievements: Achievement[];
  recentMatches: MatchWithDetails[];
  teamsPlayed: { team: Team; matches: number; wins: number; }[];
}

export default function PlayerProfilePage() {
  const params = useParams();
  const playerId = params.id as string;
  const [profileData, setProfileData] = useState<PlayerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    async function fetchPlayerData() {
      try {
        const players = await getAllPlayers();
        const player = players.find(p => p.id === playerId);
        
        if (!player) {
          setLoading(false);
          return;
        }

        const stats = await getPlayerStats(playerId);
        const playerMatches = await getPlayerMatches(playerId, 10);
        const achievements = await getPlayerAchievements(playerId);

        // Calculate teams played
        const teamStats = new Map<string, { team: Team; matches: number; wins: number; }>();
        
        playerMatches.forEach(match => {
          const isPlayer1 = match.player1_id === playerId;
          const playerTeam = isPlayer1 ? match.team1 : match.team2;
          const playerScore = isPlayer1 ? match.player1_score : match.player2_score;
          const opponentScore = isPlayer1 ? match.player2_score : match.player1_score;
          
          if (playerTeam) {
            const teamId = playerTeam.id;
            if (!teamStats.has(teamId)) {
              teamStats.set(teamId, { team: playerTeam, matches: 0, wins: 0 });
            }
            
            const teamStat = teamStats.get(teamId)!;
            teamStat.matches++;
            if (playerScore > opponentScore) {
              teamStat.wins++;
            }
          }
        });

        const teamsPlayed = Array.from(teamStats.values()).sort((a, b) => b.matches - a.matches);

        setProfileData({
          player,
          stats,
          achievements,
          recentMatches: playerMatches,
          teamsPlayed
        });
      } catch (error) {
        console.error('Error fetching player data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayerData();
  }, [playerId]);

  const handlePhotoChange = async (file: File | null) => {
    if (!profileData) return;

    setIsUploadingPhoto(true);
    try {
      if (file) {
        // Upload new photo
        const photoUrl = await uploadPlayerPhoto(playerId, file);
        
        // Update local state
        setProfileData(prev => {
          if (!prev) return null;
          const updatedPlayer: Player = { ...prev.player, photo_url: photoUrl };
          return {
            ...prev,
            player: updatedPlayer
          };
        });
      } else {
        // Delete current photo
        if (profileData.player.photo_url) {
          await deletePlayerPhoto(playerId, profileData.player.photo_url);
          
          // Update local state
          setProfileData(prev => {
            if (!prev) return null;
            const updatedPlayer: Player = { ...prev.player, photo_url: undefined };
            return {
              ...prev,
              player: updatedPlayer
            };
          });
        }
      }
    } catch (error) {
      console.error('Error handling photo change:', error);
      alert('Failed to update photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading player profile...</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Player not found</div>
      </div>
    );
  }

  const { player, stats, achievements, recentMatches } = profileData;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-6">
            {/* Player Photo Upload */}
            <PhotoUpload
              currentPhotoUrl={player.photo_url || player.avatar_url}
              playerName={player.nickname}
              onPhotoChange={handlePhotoChange}
              isUploading={isUploadingPhoto}
            />
            
            {/* Player Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{player.nickname}</h1>
              <div className="flex items-center space-x-4 text-gray-300">
                <span>🏆 {stats?.tournaments_won || 0} Tournaments Won</span>
                <span>⚽ {stats?.total_goals || 0} Goals</span>
                <span>🥅 {stats?.clean_sheets || 0} Clean Sheets</span>
                <span>📊 {stats?.win_percentage?.toFixed(1) || 0}% Win Rate</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">{stats?.total_wins || 0}</div>
                <div className="text-sm text-gray-300">Wins</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-400">{stats?.total_draws || 0}</div>
                <div className="text-sm text-gray-300">Draws</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-400">{stats?.total_losses || 0}</div>
                <div className="text-sm text-gray-300">Losses</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'stats', label: 'Statistics' },
              { id: 'teams', label: 'Teams' },
              { id: 'matches', label: 'Matches' },
              { id: 'achievements', label: 'Achievements' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Stats */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Career Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats?.total_matches || 0}</div>
                    <div className="text-sm text-gray-400">Matches Played</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{stats?.total_goals || 0}</div>
                    <div className="text-sm text-gray-400">Goals Scored</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{stats?.total_goals_conceded || 0}</div>
                    <div className="text-sm text-gray-400">Goals Conceded</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${(stats?.goal_difference || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(stats?.goal_difference || 0) >= 0 ? '+' : ''}{stats?.goal_difference || 0}
                    </div>
                    <div className="text-sm text-gray-400">Goal Difference</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{stats?.win_percentage?.toFixed(1) || 0}%</div>
                    <div className="text-sm text-gray-400">Win Rate</div>
                  </div>
                </div>
              </div>

              {/* Recent Matches */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Recent Matches</h2>
                <div className="space-y-3">
                  {recentMatches.length > 0 ? recentMatches.map((match) => {
                    const isPlayer1 = match.player1_id === playerId;
                    const playerScore = isPlayer1 ? match.player1_score : match.player2_score;
                    const opponentScore = isPlayer1 ? match.player2_score : match.player1_score;
                    const opponent = isPlayer1 ? match.player2?.nickname : match.player1?.nickname;
                    
                    let result = 'draw';
                    if (playerScore > opponentScore) result = 'win';
                    if (playerScore < opponentScore) result = 'loss';

                    return (
                      <div key={match.id} className="flex items-center justify-between bg-gray-700 rounded p-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            result === 'win' ? 'bg-green-500' : 
                            result === 'loss' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></div>
                          <span>vs {opponent}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">{playerScore} - {opponentScore}</span>
                          <span className={`text-sm px-2 py-1 rounded ${
                            result === 'win' ? 'bg-green-600 text-white' : 
                            result === 'loss' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-black'
                          }`}>
                            {result.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-gray-400 text-center py-4">No matches found</div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Achievements */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Achievements</h2>
                {achievements.length > 0 ? (
                  <div className="space-y-3">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          🏆
                        </div>
                        <div>
                          <div className="font-medium">{achievement.title}</div>
                          <div className="text-sm text-gray-400">{achievement.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-4">No achievements yet</div>
                )}
              </div>

              {/* Player Info */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Player Info</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Joined:</span>
                    <span>{new Date(player.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Player ID:</span>
                    <span className="font-mono text-xs">{player.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Teams Played For</h2>
            {profileData.teamsPlayed.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profileData.teamsPlayed.map((teamData) => (
                  <div key={teamData.team.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                       <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                         <span className="text-lg font-bold text-gray-300">
                           {teamData.team.name.charAt(0).toUpperCase()}
                         </span>
                       </div>
                       <div>
                         <div className="font-semibold">{teamData.team.name}</div>
                         <div className="text-sm text-gray-400">Team ID: {teamData.team.id}</div>
                       </div>
                     </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Matches:</span>
                        <span>{teamData.matches}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Wins:</span>
                        <span className="text-green-400">{teamData.wins}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Win Rate:</span>
                        <span className="text-blue-400">
                          {teamData.matches > 0 ? ((teamData.wins / teamData.matches) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚽</div>
                <div className="text-xl text-gray-400 mb-2">No teams played for yet</div>
                <div className="text-gray-500">Start playing matches to see your team history!</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Detailed Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Match Record</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Matches Played:</span>
                    <span>{stats?.total_matches || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wins:</span>
                    <span className="text-green-400">{stats?.total_wins || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Draws:</span>
                    <span className="text-yellow-400">{stats?.total_draws || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Losses:</span>
                    <span className="text-red-400">{stats?.total_losses || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Scoring</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Goals Scored:</span>
                    <span className="text-green-400">{stats?.total_goals || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Goals Conceded:</span>
                    <span className="text-red-400">{stats?.total_goals_conceded || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Goal Difference:</span>
                    <span className={`${(stats?.goal_difference || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(stats?.goal_difference || 0) >= 0 ? '+' : ''}{stats?.goal_difference || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Goals per Match:</span>
                    <span>{stats?.goals_per_match?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clean Sheets:</span>
                    <span className="text-blue-400">{stats?.clean_sheets || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Records</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Biggest Win:</span>
                    <span className="text-green-400">+{stats?.biggest_win || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biggest Loss:</span>
                    <span className="text-red-400">-{stats?.biggest_loss || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Points:</span>
                    <span className="text-purple-400">{stats?.total_points || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Tournament Performance</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Tournaments Won:</span>
                    <span className="text-yellow-400">{stats?.tournaments_won || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Points:</span>
                    <span>{stats?.total_points || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Win Percentage:</span>
                    <span>{stats?.win_percentage?.toFixed(1) || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Match History</h2>
            <div className="space-y-3">
              {recentMatches.length > 0 ? recentMatches.map((match) => {
                const isPlayer1 = match.player1_id === playerId;
                const playerScore = isPlayer1 ? match.player1_score : match.player2_score;
                const opponentScore = isPlayer1 ? match.player2_score : match.player1_score;
                const opponent = isPlayer1 ? match.player2?.nickname : match.player1?.nickname;
                const opponentTeam = isPlayer1 ? match.team2?.name : match.team1?.name;
                
                let result = 'draw';
                if (playerScore > opponentScore) result = 'win';
                if (playerScore < opponentScore) result = 'loss';

                return (
                  <div key={match.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${
                          result === 'win' ? 'bg-green-500' : 
                          result === 'loss' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <div className="font-medium">vs {opponent}</div>
                          <div className="text-sm text-gray-400">{opponentTeam}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{playerScore} - {opponentScore}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(match.match_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-gray-400 text-center py-8">No matches found</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Achievements & Trophies</h2>
            {achievements.length > 0 ? (
              <div className="space-y-6">
                {/* Achievement Badges */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-300">Achievement Badges</h3>
                  <div className="flex flex-wrap gap-4">
                    {achievements.map((achievement) => (
                      <AchievementBadge 
                        key={achievement.id} 
                        achievement={achievement} 
                        size="large"
                        showTooltip={true}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Achievement Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-300">Achievement Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <AchievementBadge 
                            achievement={achievement} 
                            size="medium"
                            showTooltip={false}
                          />
                          <div>
                            <div className="font-semibold">{achievement.title}</div>
                            {achievement.value && (
                              <div className="text-sm text-blue-400">
                                Value: {achievement.value}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400 mb-2">{achievement.description}</div>
                        <div className="text-xs text-gray-500">
                          Earned: {new Date(achievement.achievement_date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <div className="text-xl text-gray-400 mb-2">No achievements yet</div>
                <div className="text-gray-500">Keep playing to earn your first trophy!</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}