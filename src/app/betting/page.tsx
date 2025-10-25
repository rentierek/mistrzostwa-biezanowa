'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DollarSign, AlertCircle, Trophy } from 'lucide-react';
import { Tournament, Player, BettingFormData, BettingCoupon, BettingAchievement, BettingRankingEntry, BettingPlayerStats } from '@/types/database';
import { getAllTournaments, getAllPlayers } from '@/lib/supabase';
import { createBettingCoupon, getBettingRanking, getBettingPlayerStats, getBettingAchievements, calculateCouponResults } from '@/lib/betting';
import BettingCouponForm from '@/components/betting/BettingCouponForm';
import BettingResults from '@/components/betting/BettingResults';
import BettingRanking from '@/components/betting/BettingRanking';
import UserCoupons from '@/components/betting/UserCoupons';

export default function BettingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [activeTab, setActiveTab] = useState('create');
  const [userCoupons, setUserCoupons] = useState<BettingCoupon[]>([]);
  const [userAchievements, setUserAchievements] = useState<BettingAchievement[]>([]);
  const [rankingData, setRankingData] = useState<BettingRankingEntry[]>([]);
  const [playerStats, setPlayerStats] = useState<BettingPlayerStats[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load tournaments and players from database
      const [tournamentsData, playersData] = await Promise.all([
        getAllTournaments(),
        getAllPlayers()
      ]);

      setTournaments(tournamentsData);
      setPlayers(playersData);

      // Auto-select the first active tournament if available
      const activeTournament = tournamentsData.find(t => t.is_active);
      if (activeTournament) {
        setSelectedTournament(activeTournament);
      } else if (tournamentsData.length > 0) {
        // If no active tournament, select the most recent one
        setSelectedTournament(tournamentsData[0]);
      }

      // Load betting data using real API
      try {
        // Load ranking data
        const rankingData = await getBettingRanking();
        setRankingData(rankingData);
        
        // For now, load achievements and stats as empty arrays
        // TODO: Implement user-specific achievements and stats
        setUserAchievements([]);
        setPlayerStats([]);
      } catch (err) {
        console.error('Error loading betting data:', err);
        setRankingData([]);
        setUserAchievements([]);
        setPlayerStats([]);
      }
      
      // Mock user coupons for now - TODO: implement getTournamentBettingCoupons
      setUserCoupons([]);

    } catch (err) {
      console.error('Error loading betting data:', err);
      setError('Błąd podczas ładowania danych betowania');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTournamentChange = (tournamentId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (tournament) {
      setSelectedTournament(tournament);
    }
  };

  const handleCouponSubmit = async (formData: BettingFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Create the betting coupon using the real API
      const result = await createBettingCoupon(formData);
      
      if (!result.success) {
        throw new Error(result.error || 'Błąd podczas zapisywania kuponu');
      }
      
      console.log('Coupon created successfully:', result.data);
      
      // Reload data after successful submission
      await loadData();
      
      // Switch to results tab
      setActiveTab('results');
      
    } catch (err) {
      console.error('Error submitting coupon:', err);
      setError('Błąd podczas zapisywania kuponu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <DollarSign className="h-8 w-8" />
          Betowanie
        </h1>
        <p className="text-muted-foreground">
          Stwórz kupony i przewiduj wyniki turniejów
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {tournaments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Brak dostępnych turniejów.<br />
              Betowanie będzie dostępne gdy zostanie utworzony turniej.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tournament Selector */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Wybierz turniej
              </CardTitle>
              <CardDescription>
                Wybierz turniej na który chcesz postawić kupon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="tournament-select">Turniej</Label>
                <Select 
                  value={selectedTournament?.id || ''} 
                  onValueChange={handleTournamentChange}
                >
                  <SelectTrigger id="tournament-select">
                    <SelectValue placeholder="Wybierz turniej..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tournaments.map((tournament) => (
                      <SelectItem key={tournament.id} value={tournament.id}>
                        <div className="flex items-center gap-2">
                          <span>{tournament.name}</span>
                          {tournament.is_active && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Aktywny
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {selectedTournament && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="create">Stwórz Kupon</TabsTrigger>
                <TabsTrigger value="coupons">Moje Kupony</TabsTrigger>
                <TabsTrigger value="results">Wyniki</TabsTrigger>
                <TabsTrigger value="ranking">Ranking</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-6">
                <BettingCouponForm
                  tournament={selectedTournament}
                  players={players}
                  onSubmit={handleCouponSubmit}
                  isLoading={isSubmitting}
                />
              </TabsContent>

              <TabsContent value="coupons" className="space-y-6">
                <UserCoupons players={players} />
              </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <BettingResults
              coupons={userCoupons}
              achievements={userAchievements}
              players={players}
              isLoading={false}
              onCouponDeleted={loadData}
            />
          </TabsContent>

              <TabsContent value="ranking" className="space-y-6">
                <BettingRanking
                  rankingData={rankingData}
                  playerStats={playerStats}
                  isLoading={false}
                />
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
}