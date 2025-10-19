import { notFound } from 'next/navigation';
import { getTournamentById, getLeagueTable, getMatchesForTournament } from '@/lib/supabase';
import MediaGallery from '@/components/ui/MediaGallery';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LeagueTable } from '@/components/tournament/LeagueTable';
import { MatchesList } from '@/components/tournament/MatchesList';
import { Calendar, Trophy, Image, Video, Users, Target } from 'lucide-react';

interface TournamentPageProps {
  params: Promise<{ id: string }>;
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { id } = await params;
  const tournament = await getTournamentById(id);

  if (!tournament) {
    notFound();
  }

  // Fetch tournament data
  const [leagueTable, matches] = await Promise.all([
    getLeagueTable(id),
    getMatchesForTournament(id)
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tournament Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{tournament.name}</h1>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>Start: {new Date(tournament.start_date).toLocaleDateString('pl-PL')}</span>
            </div>
            {tournament.end_date && (
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Koniec: {new Date(tournament.end_date).toLocaleDateString('pl-PL')}</span>
              </div>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              tournament.is_active
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              {tournament.is_active ? 'Aktywny' : 'Zakończony'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tournament Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Szczegóły Turnieju
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nazwa:</span>
                    <span className="font-medium">{tournament.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{tournament.is_active ? 'Aktywny' : 'Zakończony'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data rozpoczęcia:</span>
                    <span className="font-medium">{new Date(tournament.start_date).toLocaleDateString('pl-PL')}</span>
                  </div>
                  {tournament.end_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data zakończenia:</span>
                      <span className="font-medium">{new Date(tournament.end_date).toLocaleDateString('pl-PL')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tournament Media Gallery */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-blue-600" />
                  Galeria Turnieju
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MediaGallery
                   photos={tournament.photos || []}
                   videos={tournament.videos || []}
                   maxItems={12}
                   gridCols={3}
                 />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tournament Statistics */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* League Table */}
          <div>
            <LeagueTable 
              data={leagueTable} 
              title="Tabela Turniejowa"
              showExport={true}
            />
          </div>

          {/* Matches List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Mecze Turnieju
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MatchesList 
                  matches={matches}
                  maxItems={10}
                  showExport={false}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tournament Thumbnail Display */}
        {tournament.thumbnail_url && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-purple-600" />
                  Miniatura Turnieju
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <img 
                    src={tournament.thumbnail_url} 
                    alt={`${tournament.name} thumbnail`}
                    className="max-w-md w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}