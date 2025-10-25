'use client';

import { useState } from 'react';
import { Tournament, LeagueTableEntry, MatchWithDetails } from '@/types/database';
import MediaGallery from '@/components/ui/MediaGallery';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LeagueTable } from '@/components/tournament/LeagueTable';
import { MatchesList } from '@/components/tournament/MatchesList';
import TournamentAwardsAnimation from '@/components/tournament/TournamentAwardsAnimation';
import { Calendar, Trophy, Image, Video, Users, Target, Award } from 'lucide-react';

interface TournamentPageClientProps {
  tournament: Tournament;
  leagueTable: LeagueTableEntry[];
  matches: MatchWithDetails[];
}

export default function TournamentPageClient({
  tournament,
  leagueTable,
  matches
}: TournamentPageClientProps) {
  const [showAwardsAnimation, setShowAwardsAnimation] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Tournament Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {tournament.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(tournament.start_date).toLocaleDateString('pl-PL')}
                  {tournament.end_date && ` - ${new Date(tournament.end_date).toLocaleDateString('pl-PL')}`}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {leagueTable.length} uczestników
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Awards Animation Button */}
              <button
                onClick={() => setShowAwardsAnimation(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Award className="w-5 h-5" />
                Ceremonia Nagród
              </button>
              
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                tournament.is_active 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {tournament.is_active ? 'Aktywny' : 'Zakończony'}
              </span>
            </div>
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

        {/* Awards Animation Modal */}
        <TournamentAwardsAnimation
          tournamentId={tournament.id}
          tournamentName={tournament.name}
          isOpen={showAwardsAnimation}
          onClose={() => setShowAwardsAnimation(false)}
        />
      </div>
    </div>
  );
}