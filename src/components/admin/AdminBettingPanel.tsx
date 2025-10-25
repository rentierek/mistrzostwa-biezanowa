'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, Eye, Trash2, RefreshCw, User, Calendar, Trophy } from 'lucide-react';
import { getTournamentBettingCoupons, deleteBettingCoupon } from '@/lib/betting';
import { getAllTournaments } from '@/lib/supabase';
import { BettingCoupon, Tournament } from '@/types/database';

interface CouponWithDetails extends BettingCoupon {
  player?: {
    id: string;
    nickname: string;
    name: string;
  };
  predictions?: any[];
}

export function AdminBettingPanel() {
  const [coupons, setCoupons] = useState<CouponWithDetails[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [selectedCoupon, setSelectedCoupon] = useState<CouponWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      loadCoupons();
    }
  }, [selectedTournament]);

  const loadTournaments = async () => {
    try {
      const tournamentsData = await getAllTournaments();
      setTournaments(tournamentsData);
      if (tournamentsData.length > 0) {
        setSelectedTournament(tournamentsData[0].id);
      }
    } catch (error) {
      console.error('Error loading tournaments:', error);
    }
  };

  const loadCoupons = async () => {
    if (!selectedTournament) return;
    
    setIsLoading(true);
    try {
      const couponsData = await getTournamentBettingCoupons(selectedTournament);
      setCoupons(couponsData);
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten kupon? Ta operacja jest nieodwracalna.')) {
      return;
    }

    setIsDeleting(couponId);
    try {
      const result = await deleteBettingCoupon(couponId);
      if (result.success) {
        setCoupons(coupons.filter(c => c.id !== couponId));
        if (selectedCoupon?.id === couponId) {
          setSelectedCoupon(null);
        }
      } else {
        alert(`Błąd podczas usuwania kuponu: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Wystąpił nieoczekiwany błąd podczas usuwania kuponu');
    } finally {
      setIsDeleting(null);
    }
  };

  const formatPredictionValue = (type: string, value: string) => {
    switch (type) {
      case 'goals_over_under':
        return `${value} goli`;
      case 'final_ranking':
        try {
          const ranking = JSON.parse(value);
          return ranking.join(', ');
        } catch {
          return value;
        }
      case 'top_scorer':
      case 'worst_defense':
      case 'tournament_winner':
      case 'surprise_player':
        return value;
      default:
        return value;
    }
  };

  const getPredictionTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'goals_over_under': 'Liczba goli',
      'final_ranking': 'Końcowa kolejność',
      'top_scorer': 'Król strzelców',
      'worst_defense': 'Najgorsza obrona',
      'tournament_winner': 'Zwycięzca turnieju',
      'surprise_player': 'Objawienie turnieju'
    };
    return labels[type] || type;
  };

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <Ticket className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Zarządzanie Kuponami Bukmacherskimi</h2>
      </div>

      {/* Tournament Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Wybierz turniej:
        </label>
        <select
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Wybierz turniej...</option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.name}
            </option>
          ))}
        </select>
      </div>

      {selectedTournament && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coupons List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Kupony ({coupons.length})
              </h3>
              <button
                onClick={loadCoupons}
                disabled={isLoading}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Odśwież</span>
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Ładowanie kuponów...</p>
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Ticket className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Brak kuponów dla tego turnieju</p>
              </div>
            ) : (
              <div className="space-y-3">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCoupon?.id === coupon.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {coupon.coupon_name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedCoupon(coupon)}
                          className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded"
                          title="Podgląd kuponu"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          disabled={isDeleting === coupon.id}
                          className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                          title="Usuń kupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{coupon.player?.nickname || coupon.player?.name || 'Nieznany gracz'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(coupon.created_at).toLocaleDateString('pl-PL')}</span>
                      </div>
                      {coupon.total_points !== undefined && (
                        <div className="flex items-center space-x-1">
                          <Trophy className="w-4 h-4" />
                          <span>{coupon.total_points} pkt</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coupon Details */}
          <div>
            {selectedCoupon ? (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Szczegóły kuponu: {selectedCoupon.coupon_name}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gracz:
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedCoupon.player?.nickname || selectedCoupon.player?.name || 'Nieznany gracz'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data utworzenia:
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(selectedCoupon.created_at).toLocaleString('pl-PL')}
                    </p>
                  </div>
                  
                  {selectedCoupon.total_points !== undefined && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Punkty:
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedCoupon.total_points}</p>
                    </div>
                  )}
                  
                  {selectedCoupon.predictions && selectedCoupon.predictions.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Przewidywania:
                      </label>
                      <div className="space-y-2">
                        {selectedCoupon.predictions.map((prediction, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {getPredictionTypeLabel(prediction.prediction_type)}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                              {formatPredictionValue(prediction.prediction_type, prediction.prediction_value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 text-center">
                <Eye className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">
                  Wybierz kupon z listy, aby zobaczyć szczegóły
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}