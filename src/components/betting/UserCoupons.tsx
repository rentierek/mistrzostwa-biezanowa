'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Eye, 
  Calendar, 
  Trophy, 
  Target, 
  Star, 
  Shield, 
  TrendingUp, 
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react';
import { BettingCoupon, Player } from '@/types/database';
import { getPlayerBettingCoupons } from '@/lib/betting';

interface UserCouponsProps {
  players: Player[];
}

export default function UserCoupons({ players }: UserCouponsProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [coupons, setCoupons] = useState<BettingCoupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<BettingCoupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPlayerId) {
      loadPlayerCoupons();
    }
  }, [selectedPlayerId]);

  const loadPlayerCoupons = async () => {
    if (!selectedPlayerId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const playerCoupons = await getPlayerBettingCoupons(selectedPlayerId);
      setCoupons(playerCoupons);
    } catch (err) {
      console.error('Error loading player coupons:', err);
      setError('Błąd podczas ładowania kuponów');
    } finally {
      setIsLoading(false);
    }
  };

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
      case 'final_ranking': return 'Końcowa kolejność';
      case 'top_scorer': return 'Król strzelców';
      case 'worst_defense': return 'Najgorsza obrona';
      case 'tournament_winner': return 'Zwycięzca turnieju';
      case 'surprise_player': return 'Niespodzianka turnieju';
      default: return 'Nieznane przewidywanie';
    }
  };

  const formatPredictionValue = (type: string, value: string) => {
    switch (type) {
      case 'goals_over_under':
        return value === 'over' ? 'Powyżej 4 bramek' : 'Poniżej 4 bramek';
      case 'final_ranking':
        try {
          const ranking = JSON.parse(value);
          return `1. ${getPlayerName(ranking[0])} 2. ${getPlayerName(ranking[1])} 3. ${getPlayerName(ranking[2])}`;
        } catch {
          return 'Nieprawidłowy format rankingu';
        }
      case 'top_scorer':
      case 'worst_defense':
      case 'tournament_winner':
      case 'surprise_player':
        return getPlayerName(value);
      default:
        return value;
    }
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="player-select">Wybierz gracza</Label>
          <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz gracza, aby zobaczyć jego kupony" />
            </SelectTrigger>
            <SelectContent>
              {players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.nickname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedPlayerId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Wybierz gracza z listy powyżej, aby zobaczyć jego kupony.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedPlayerId && coupons.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Ten gracz nie ma jeszcze żadnych kuponów.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedPlayerId && coupons.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Kupony gracza {getPlayerName(selectedPlayerId)} ({coupons.length})
            </h3>
            <Button variant="outline" size="sm" onClick={loadPlayerCoupons}>
              Odśwież
            </Button>
          </div>

          <div className="grid gap-4">
            {coupons.map((coupon) => (
              <Card key={coupon.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{coupon.coupon_name}</CardTitle>
                    <Badge variant={coupon.total_points > 10 ? "default" : "secondary"}>
                      {coupon.total_points} pkt
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      {coupon.tournament?.name || 'Nieznany turniej'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(coupon.created_at).toLocaleDateString('pl-PL')}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {coupon.predictions?.length || 0} przewidywań
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedCoupon(coupon)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Zobacz szczegóły
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {coupon.coupon_name}
                          </DialogTitle>
                          <DialogDescription>
                            Szczegóły kuponu z turnieju: {coupon.tournament?.name}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          {/* Informacje podstawowe */}
                          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium">Data utworzenia</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(coupon.created_at).toLocaleString('pl-PL')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Łączne punkty</p>
                              <p className="text-sm text-muted-foreground">
                                {coupon.total_points} punktów
                              </p>
                            </div>
                          </div>

                          {/* Przewidywania */}
                          <div>
                            <h4 className="font-medium mb-3">Przewidywania</h4>
                            <div className="space-y-3">
                              {coupon.predictions?.map((prediction: any, index: number) => (
                                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                  <div className="flex-shrink-0">
                                    {getPredictionIcon(prediction.prediction_type)}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">
                                      {getPredictionDisplayName(prediction.prediction_type)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {formatPredictionValue(prediction.prediction_type, prediction.prediction_value)}
                                    </p>
                                  </div>
                                  {prediction.is_correct !== undefined && (
                                    <Badge variant={prediction.is_correct ? "default" : "secondary"}>
                                      {prediction.is_correct ? 'Trafione' : 'Nietrafione'}
                                    </Badge>
                                  )}
                                  {prediction.points_earned !== undefined && (
                                    <div className="text-sm font-medium">
                                      +{prediction.points_earned} pkt
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}