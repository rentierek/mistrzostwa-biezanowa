'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, TrendingUp, Crown, Award, BarChart3 } from 'lucide-react';
import { BettingRankingEntry, BettingPlayerStats } from '@/types/database';

interface BettingRankingProps {
  rankingData: BettingRankingEntry[];
  playerStats: BettingPlayerStats[];
  isLoading?: boolean;
}

export default function BettingRanking({ rankingData, playerStats, isLoading }: BettingRankingProps) {
  const [sortBy, setSortBy] = useState<'points' | 'accuracy' | 'coupons'>('points');

  const sortedRanking = [...rankingData].sort((a, b) => {
    switch (sortBy) {
      case 'points':
        return b.total_points - a.total_points;
      case 'accuracy':
        return b.accuracy_percentage - a.accuracy_percentage;
      case 'coupons':
        return b.total_coupons - a.total_coupons;
      default:
        return b.total_points - a.total_points;
    }
  });

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return position.toString();
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'text-yellow-600 dark:text-yellow-400';
      case 2: return 'text-gray-600 dark:text-gray-400';
      case 3: return 'text-amber-600 dark:text-amber-400';
      default: return 'text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="ranking" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          <TabsTrigger value="statistics">Statystyki</TabsTrigger>
        </TabsList>

        <TabsContent value="ranking" className="space-y-4">
          {/* Sortowanie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Sortuj według
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={sortBy === 'points' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('points')}
                >
                  Punkty
                </Button>
                <Button
                  variant={sortBy === 'accuracy' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('accuracy')}
                >
                  Celność
                </Button>
                <Button
                  variant={sortBy === 'coupons' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('coupons')}
                >
                  Liczba kuponów
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ranking */}
          {sortedRanking.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Brak danych rankingowych.<br />
                  Stwórz kupony aby pojawić się w rankingu!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedRanking.map((entry, index) => (
                <Card key={entry.player_id} className={`${index < 3 ? 'border-2' : ''} ${
                  index === 0 ? 'border-yellow-400' : 
                  index === 1 ? 'border-gray-400' : 
                  index === 2 ? 'border-amber-400' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`text-2xl font-bold ${getPositionColor(index + 1)}`}>
                          {getPositionIcon(index + 1)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{entry.nickname}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{entry.total_coupons} kuponów</span>
                            <span>{entry.accuracy_percentage.toFixed(1)}% celności</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {entry.total_points}
                        </div>
                        <div className="text-sm text-muted-foreground">punktów</div>
                      </div>
                    </div>
                    
                    {/* Osiągnięcia */}
                    {(entry.gambling_king_awards > 0 || entry.dark_horse_awards > 0) && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        {entry.gambling_king_awards > 0 && (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            Król Hazardu x{entry.gambling_king_awards}
                          </Badge>
                        )}
                        {entry.dark_horse_awards > 0 && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            🐴 Czarny Koń x{entry.dark_horse_awards}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          {playerStats.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Brak statystyk.<br />
                  Stwórz kupony aby zobaczyć swoje statystyki!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {playerStats.map((stats) => (
                <Card key={stats.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{stats.player?.nickname}</span>
                      <Badge variant="outline">
                        {stats.accuracy_percentage.toFixed(1)}% celności
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{stats.total_points}</div>
                        <div className="text-sm text-muted-foreground">Punkty</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{stats.total_coupons}</div>
                        <div className="text-sm text-muted-foreground">Kupony</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.correct_predictions}</div>
                        <div className="text-sm text-muted-foreground">Trafne</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{stats.best_coupon_points}</div>
                        <div className="text-sm text-muted-foreground">Najlepszy kupon</div>
                      </div>
                    </div>
                    
                    {/* Osiągnięcia */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm">Król Hazardu: {stats.gambling_king_awards}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🐴 Czarny Koń: {stats.dark_horse_awards}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}