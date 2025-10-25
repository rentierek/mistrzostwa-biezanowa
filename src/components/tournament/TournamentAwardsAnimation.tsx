'use client';

import React, { useState, useEffect } from 'react';
import { Achievement, Player } from '@/types/database';
import { getTournamentAchievements, getAllPlayers } from '@/lib/supabase';

interface TournamentAwardsAnimationProps {
  tournamentId: string;
  tournamentName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface AchievementWithPlayer extends Achievement {
  player?: Player;
}

export default function TournamentAwardsAnimation({
  tournamentId,
  tournamentName,
  isOpen,
  onClose
}: TournamentAwardsAnimationProps) {
  const [achievements, setAchievements] = useState<AchievementWithPlayer[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animationStarted, setAnimationStarted] = useState(false);

  // Animation steps
  const [showSpecialAwards, setShowSpecialAwards] = useState(false);
  const [showThirdPlace, setShowThirdPlace] = useState(false);
  const [showSecondPlace, setShowSecondPlace] = useState(false);
  const [showFirstPlace, setShowFirstPlace] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAchievements();
    } else {
      resetAnimation();
    }
  }, [isOpen, tournamentId]);

  const loadAchievements = async () => {
    setIsLoading(true);
    setError(null);
    setAnimationStarted(false);
    
    try {
      const [achievementsData, playersData] = await Promise.all([
        getTournamentAchievements(tournamentId),
        getAllPlayers()
      ]);

      // Merge achievements with player data
      const achievementsWithPlayers = achievementsData.map(achievement => ({
        ...achievement,
        player: playersData.find(p => p.id === achievement.player_id)
      }));

      setAchievements(achievementsWithPlayers);
      setPlayers(playersData);
      setIsLoading(false);
      
      // Start animation after data is loaded with a smooth delay
      if (achievementsWithPlayers.length > 0) {
        setTimeout(() => {
          setAnimationStarted(true);
          startAnimation();
        }, 800);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
      setError('Nie udało się załadować nagród. Spróbuj ponownie.');
      setIsLoading(false);
    }
  };

  const resetAnimation = () => {
    setCurrentStep(0);
    setShowSpecialAwards(false);
    setShowThirdPlace(false);
    setShowSecondPlace(false);
    setShowFirstPlace(false);
    setAnimationStarted(false);
    setError(null);
  };

  const startAnimation = () => {
    if (!animationStarted) return;
    
    const specialAwards = achievements.filter(a => a.achievement_type !== 'tournament_winner');
    const podiumAwards = achievements.filter(a => a.achievement_type === 'tournament_winner').sort((a, b) => (a.achievement_rank || 0) - (b.achievement_rank || 0));

    // Show everything immediately without delays
    if (specialAwards.length > 0) {
      setShowSpecialAwards(true);
      setCurrentStep(1);
    }

    if (podiumAwards.length > 0) {
      // Show all podium places immediately
      const thirdPlace = podiumAwards.find(a => a.achievement_rank === 3);
      const secondPlace = podiumAwards.find(a => a.achievement_rank === 2);
      const firstPlace = podiumAwards.find(a => a.achievement_rank === 1);

      if (thirdPlace) {
        setShowThirdPlace(true);
        setCurrentStep(2);
      }

      if (secondPlace) {
        setShowSecondPlace(true);
        setCurrentStep(3);
      }

      if (firstPlace) {
        setShowFirstPlace(true);
        setCurrentStep(4);
      }
    }
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player?.nickname || 'Nieznany gracz';
  };

  const specialAwards = achievements.filter(a => a.achievement_type !== 'tournament_winner');
  const podiumAwards = achievements.filter(a => a.achievement_type === 'tournament_winner').sort((a, b) => (a.achievement_rank || 0) - (b.achievement_rank || 0));

  const firstPlace = podiumAwards.find(a => a.achievement_rank === 1);
  const secondPlace = podiumAwards.find(a => a.achievement_rank === 2);
  const thirdPlace = podiumAwards.find(a => a.achievement_rank === 3);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🏆 Ceremonia Wręczenia Nagród
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-semibold text-center mb-8 text-gray-900 dark:text-white">
            {tournamentName}
          </h3>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Ładowanie nagród...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={loadAchievements}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Spróbuj ponownie
              </button>
            </div>
          ) : achievements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏆</div>
              <p className="text-gray-600 dark:text-gray-400">Brak nagród dla tego turnieju</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Special Awards Section */}
              {specialAwards.length > 0 && (
                <div className={`transition-all duration-1000 ${showSpecialAwards ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
                  <h4 className="text-lg font-semibold text-center mb-4 text-gray-800 dark:text-gray-200">
                    🎯 Nagrody Specjalne
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {specialAwards.map((award, index) => (
                      <div
                        key={award.id}
                        className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg text-center transform transition-all duration-500 delay-${index * 200}`}
                        style={{ animationDelay: `${index * 200}ms` }}
                      >
                        <div className="text-3xl mb-2">{award.title.split(' ')[0]}</div>
                        <div className="font-bold text-lg">{award.title.substring(2)}</div>
                        <div className="text-sm opacity-90 mt-1">{getPlayerName(award.player_id)}</div>
                        <div className="text-xs opacity-75 mt-1">{award.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Podium Section */}
              <div className="mt-12">
                <h4 className="text-lg font-semibold text-center mb-8 text-gray-800 dark:text-gray-200">
                  🏆 Podium
                </h4>
                
                <div className="flex justify-center items-end space-x-4 h-80">
                  {/* Second Place */}
                  {secondPlace && (
                    <div className={`flex flex-col items-center transition-all duration-1000 ${showSecondPlace ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
                      <div className="bg-gradient-to-t from-gray-400 to-gray-300 text-white p-4 rounded-lg text-center mb-4 shadow-lg">
                        <div className="text-4xl mb-2">🥈</div>
                        <div className="font-bold text-lg">{getPlayerName(secondPlace.player_id)}</div>
                        <div className="text-sm opacity-90">{secondPlace.value} pkt</div>
                      </div>
                      <div className="bg-gradient-to-t from-gray-400 to-gray-300 w-24 h-32 rounded-t-lg flex items-center justify-center text-white font-bold text-xl">
                        2
                      </div>
                    </div>
                  )}

                  {/* First Place */}
                  {firstPlace && (
                    <div className={`flex flex-col items-center transition-all duration-1000 ${showFirstPlace ? 'opacity-100 transform translate-y-0 scale-110' : 'opacity-0 transform translate-y-8 scale-100'}`}>
                      <div className="bg-gradient-to-t from-yellow-500 to-yellow-300 text-white p-6 rounded-lg text-center mb-4 shadow-xl border-4 border-yellow-400">
                        <div className="text-5xl mb-2 animate-bounce">🥇</div>
                        <div className="font-bold text-xl">{getPlayerName(firstPlace.player_id)}</div>
                        <div className="text-sm opacity-90">{firstPlace.value} pkt</div>
                        <div className="text-xs mt-2 font-semibold">MISTRZ!</div>
                      </div>
                      <div className="bg-gradient-to-t from-yellow-500 to-yellow-300 w-28 h-40 rounded-t-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        1
                      </div>
                    </div>
                  )}

                  {/* Third Place */}
                  {thirdPlace && (
                    <div className={`flex flex-col items-center transition-all duration-1000 ${showThirdPlace ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
                      <div className="bg-gradient-to-t from-amber-600 to-amber-400 text-white p-4 rounded-lg text-center mb-4 shadow-lg">
                        <div className="text-4xl mb-2">🥉</div>
                        <div className="font-bold text-lg">{getPlayerName(thirdPlace.player_id)}</div>
                        <div className="text-sm opacity-90">{thirdPlace.value} pkt</div>
                      </div>
                      <div className="bg-gradient-to-t from-amber-600 to-amber-400 w-24 h-24 rounded-t-lg flex items-center justify-center text-white font-bold text-xl">
                        3
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Congratulations */}
              {showFirstPlace && (
                <div className="text-center mt-8 animate-pulse">
                  <div className="text-4xl mb-4">🎉</div>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    Gratulacje wszystkim uczestnikom!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}