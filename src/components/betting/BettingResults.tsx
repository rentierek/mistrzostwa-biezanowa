'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Shield, Star, TrendingUp, CheckCircle, XCircle, Clock, Award, Trash2 } from 'lucide-react';
import { BettingCoupon, BettingPrediction, BettingAchievement, Player } from '@/types/database';
import { useAdmin } from '@/contexts/AdminContext';
import { deleteBettingCoupon } from '@/lib/betting';

interface BettingResultsProps {
  coupons: BettingCoupon[];
  achievements: BettingAchievement[];
  players: Player[];
  isLoading?: boolean;
  onCouponDeleted?: () => void;
}

export default function BettingResults({ coupons, achievements, players, isLoading, onCouponDeleted }: BettingResultsProps) {
  const [selectedCoupon, setSelectedCoupon] = useState<BettingCoupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<string | null>(null);
  const { isAdmin } = useAdmin();

  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.nickname || 'Nieznany gracz';
  };

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'goals_over_under': return <Target className="h-4 w-4" />;
      case 'final_ranking': return <Trophy className="h-4 w-4" />;
      case 'top_scorer': return <Star className="h-4 w-4" />;
      case 'worst_defense': return <Shield className="h-4 w-4" />;
      case 'tournament_winner': return <Trophy className="h-4 w-4" />;
      case 'surprise_player': return <TrendingUp className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPredictionDisplayName = (type: string) => {
    switch (type) {
      case 'goals_over_under': return 'Średnia bramek na mecz';
      case 'final_ranking': return 'Kolejność końcowa';
      case 'top_scorer': return 'Najlepszy strzelec';
      case 'worst_defense': return 'Najgorsza obrona';
      case 'tournament_winner': return 'Zwycięzca turnieju';
      case 'surprise_player': return 'Niespodzianka turnieju';
      default: return type;
    }
  };

  const getResultIcon = (isCorrect: boolean | null) => {
    if (isCorrect === null) return <Clock className="h-4 w-4 text-muted-foreground" />;
    return isCorrect ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'gambling_king': return '👑';
      case 'dark_horse': return '🐴';
      case 'perfect_predictor': return '🎯';
      default: return '🏆';
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!isAdmin) return;
    
    if (!confirm('Czy na pewno chcesz usunąć ten kupon? Ta operacja jest nieodwracalna.')) {
      return;
    }

    setDeletingCoupon(couponId);
    try {
      const result = await deleteBettingCoupon(couponId);
      if (result.success) {
        onCouponDeleted?.();
      } else {
        alert(`Błąd podczas usuwania kuponu: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Wystąpił nieoczekiwany błąd podczas usuwania kuponu');
    } finally {
      setDeletingCoupon(null);
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
      <Tabs defaultValue="coupons" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="coupons">Moje kupony</TabsTrigger>
          <TabsTrigger value="achievements">Osiągnięcia</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="space-y-4">
          {coupons.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Nie masz jeszcze żadnych kuponów.<br />
                  Stwórz swój pierwszy kupon w zakładce "Stwórz Kupon"!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{coupon.coupon_name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={coupon.total_points > 0 ? "default" : "secondary"}>
                          {coupon.total_points} pkt
                        </Badge>
                        <Badge variant={coupon.is_submitted ? "outline" : "secondary"}>
                          {coupon.is_submitted ? "Rozliczony" : "Oczekuje"}
                        </Badge>
                        {isAdmin && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCoupon(coupon.id);
                            }}
                            disabled={deletingCoupon === coupon.id}
                            className="ml-2"
                          >
                            {deletingCoupon === coupon.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      Gracz: {getPlayerName(coupon.player_id)} • 
                      Utworzony: {new Date(coupon.created_at).toLocaleDateString('pl-PL')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {coupon.predictions?.map((prediction) => (
                        <div key={prediction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getPredictionIcon(prediction.prediction_type)}
                            <div>
                              <p className="font-medium">{getPredictionDisplayName(prediction.prediction_type)}</p>
                              <p className="text-sm text-muted-foreground">
                                {prediction.prediction_value}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getResultIcon(prediction.is_correct)}
                            <span className="text-sm font-medium">
                              {prediction.points_awarded} pkt
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          {achievements.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Nie masz jeszcze żadnych osiągnięć z betowania.<br />
                  Stwórz kupony i czekaj na zakończenie turnieju!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-2xl">{getAchievementIcon(achievement.achievement_type)}</span>
                        {achievement.achievement_name}
                      </CardTitle>
                      <Badge variant="default" className="text-lg px-3 py-1">
                        +{achievement.points_earned} pkt
                      </Badge>
                    </div>
                    <CardDescription>
                      {achievement.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Turniej: {achievement.tournament?.name}</span>
                      <span>Otrzymano: {new Date(achievement.created_at).toLocaleDateString('pl-PL')}</span>
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