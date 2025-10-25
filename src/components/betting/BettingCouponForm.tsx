'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trophy, Target, Shield, Star, TrendingUp } from 'lucide-react';
import { Player, Tournament, BettingFormData } from '@/types/database';

interface BettingCouponFormProps {
  tournament: Tournament;
  players: Player[];
  onSubmit: (formData: BettingFormData) => void;
  isLoading?: boolean;
}

export default function BettingCouponForm({ tournament, players, onSubmit, isLoading }: BettingCouponFormProps) {
  const [formData, setFormData] = useState<BettingFormData>({
    coupon_name: '',
    tournament_id: tournament.id,
    player_id: '',
    predictions: {}
  });

  const [rankingOrder, setRankingOrder] = useState<Player[]>(players);

  useEffect(() => {
    setRankingOrder(players);
  }, [players]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(rankingOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setRankingOrder(items);
    setFormData(prev => ({
      ...prev,
      predictions: {
        ...prev.predictions,
        final_ranking: items.map(player => player.id)
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updatePrediction = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      predictions: {
        ...prev.predictions,
        [key]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Podstawowe informacje */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Trophy className="h-5 w-5" />
            Informacje o kuponie
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Stwórz swój kupon na turniej: <span className="font-semibold text-foreground">{tournament.name}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div>
            <Label htmlFor="coupon_name">Nazwa kuponu</Label>
            <Input
              id="coupon_name"
              value={formData.coupon_name}
              onChange={(e) => setFormData(prev => ({ ...prev, coupon_name: e.target.value }))}
              placeholder="np. Mój super kupon"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="player_id">Wybierz gracza</Label>
            <Select 
              value={formData.player_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, player_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz gracza..." />
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
        </CardContent>
      </Card>

      {/* Średnia bramek na mecz */}
      <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-orange-50 dark:bg-orange-950/20">
          <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
            <Target className="h-5 w-5" />
            Średnia bramek na mecz
          </CardTitle>
          <CardDescription>
            Przewiduj czy średnia bramek na mecz będzie powyżej czy poniżej 4
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Select 
            value={formData.predictions.goals_over_under || ''} 
            onValueChange={(value) => updatePrediction('goals_over_under', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz opcję..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="over">Over 4 (powyżej 4 bramek)</SelectItem>
              <SelectItem value="under">Under 4 (poniżej 4 bramek)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Kolejność końcowa */}
      <Card className="border-l-4 border-l-yellow-500 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-yellow-50 dark:bg-yellow-950/20">
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <Trophy className="h-5 w-5" />
            Przewidywana kolejność końcowa
          </CardTitle>
          <CardDescription>
            Przeciągnij graczy aby ustawić przewidywaną kolejność końcową turnieju
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="ranking">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {rankingOrder.map((player, index) => (
                    <Draggable key={player.id} draggableId={player.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center gap-3 p-3 bg-background border rounded-lg transition-colors ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span className="font-medium">{player.nickname}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Top strzelec */}
      <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-green-50 dark:bg-green-950/20">
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Star className="h-5 w-5" />
            Najlepszy strzelec
          </CardTitle>
          <CardDescription>
            Kto strzeli najwięcej bramek w turnieju?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Select 
            value={formData.predictions.top_scorer || ''} 
            onValueChange={(value) => updatePrediction('top_scorer', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz gracza..." />
            </SelectTrigger>
            <SelectContent>
              {players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.nickname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Najgorsza obrona */}
      <Card className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-red-50 dark:bg-red-950/20">
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <Shield className="h-5 w-5" />
            Najgorsza obrona
          </CardTitle>
          <CardDescription>
            Kto straci najwięcej bramek w turnieju?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Select 
            value={formData.predictions.worst_defense || ''} 
            onValueChange={(value) => updatePrediction('worst_defense', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz gracza..." />
            </SelectTrigger>
            <SelectContent>
              {players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.nickname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Zwycięzca turnieju */}
      <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-purple-50 dark:bg-purple-950/20">
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
            <Trophy className="h-5 w-5" />
            Zwycięzca turnieju
          </CardTitle>
          <CardDescription>
            Kto wygra cały turniej?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Select 
            value={formData.predictions.tournament_winner || ''} 
            onValueChange={(value) => updatePrediction('tournament_winner', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz gracza..." />
            </SelectTrigger>
            <SelectContent>
              {players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.nickname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Niespodzianka turnieju */}
      <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <TrendingUp className="h-5 w-5" />
            Niespodzianka turnieju
          </CardTitle>
          <CardDescription>
            Który gracz zaskoczy wszystkich i zajmie wyższe miejsce niż oczekiwano?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Select 
            value={formData.predictions.surprise_player || ''} 
            onValueChange={(value) => updatePrediction('surprise_player', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz gracza..." />
            </SelectTrigger>
            <SelectContent>
              {players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.nickname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Przycisk submit */}
      <div className="flex justify-center pt-4">
        <Button 
          type="submit" 
          size="lg" 
          disabled={isLoading || !formData.coupon_name || !formData.player_id}
          className="min-w-[250px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 text-lg font-semibold"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Zapisywanie...
            </div>
          ) : (
            'Zapisz kupon'
          )}
        </Button>
      </div>
    </form>
  );
}