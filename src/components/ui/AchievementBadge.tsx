import React from 'react';
import { Achievement } from '@/types/database';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

const getAchievementIcon = (achievementType: Achievement['achievement_type'], rank?: number) => {
  switch (achievementType) {
    case 'tournament_winner':
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return '🏆';
    case 'top_scorer':
      return '⚽';
    case 'defensive_leader':
      return '🛡️';
    case 'most_conceded':
      return '🤡';
    case 'king_of_emotions':
      return '🎭';
    default:
      return '🏅';
  }
};

const getAchievementColor = (achievementType: Achievement['achievement_type'], rank?: number) => {
  switch (achievementType) {
    case 'tournament_winner':
      if (rank === 1) return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-400';
      if (rank === 2) return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-300';
      if (rank === 3) return 'bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-400';
      return 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-400';
    case 'top_scorer':
      return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-800 dark:text-green-400';
    case 'defensive_leader':
      return 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-400';
    case 'most_conceded':
      return 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700 text-red-800 dark:text-red-400';
    case 'king_of_emotions':
      return 'bg-pink-100 dark:bg-pink-900 border-pink-300 dark:border-pink-700 text-pink-800 dark:text-pink-400';
    default:
      return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-300';
  }
};

const getSizeClasses = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return 'w-8 h-8 text-xs';
    case 'medium':
      return 'w-12 h-12 text-sm';
    case 'large':
      return 'w-16 h-16 text-base';
    default:
      return 'w-12 h-12 text-sm';
  }
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'medium',
  showTooltip = true
}) => {
  const icon = getAchievementIcon(achievement.achievement_type, achievement.achievement_rank);
  const colorClasses = getAchievementColor(achievement.achievement_type, achievement.achievement_rank);
  const sizeClasses = getSizeClasses(size);

  const badge = (
    <div
      className={`
        ${sizeClasses} 
        ${colorClasses}
        rounded-full border-2 flex items-center justify-center font-bold
        cursor-pointer hover:scale-110 transition-transform duration-200
        shadow-sm hover:shadow-md
      `}
      title={showTooltip ? `${achievement.title} - ${achievement.description}` : undefined}
    >
      <span className="text-lg">{icon}</span>
    </div>
  );

  if (showTooltip) {
    return (
      <div className="group relative">
        {badge}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          <div className="font-semibold">{achievement.title}</div>
          <div className="text-xs text-gray-300">{achievement.description}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  return badge;
};

export default AchievementBadge;