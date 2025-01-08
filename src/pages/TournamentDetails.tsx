// src/pages/TournamentDetails.tsx
    import React, { useEffect, useState } from 'react';
    import { useParams, Link, useNavigate } from 'react-router-dom';
    import { supabase } from '../lib/supabase';
    import { useAuth } from '../hooks/useAuth';
    import MatchList from '../components/MatchList';
    import ParticipantList from '../components/ParticipantList';
	import '../index.css';

    interface Tournament {
      id: string;
      name: string;
      description: string;
      status: 'draft' | 'in_progress' | 'completed';
      created_by: string;
      start_date: string | null;
      max_players: number | null;
    }

    interface Participant {
      username: string;
      points: number;
      id: string;
      deck: any;
    }

    interface Match {
      id: string;
      player1: string;
      player1_id: string;
      player2: string;
      player2_id: string;
      winner_id: string | null;
      round: number;
      status: 'scheduled' | 'completed';
    }

    export default function TournamentDetails() {
      const { id } = useParams<{ id: string }>();
      const { user } = useAuth();
      const [tournament, setTournament] = useState<Tournament | null>(null);
      const [participants, setParticipants] = useState<Participant[]>([]);
      const [matches, setMatches] = useState<Match[]>([]);
      const [error, setError] = useState('');
      const [loading, setLoading] = useState(true);
      const navigate = useNavigate();
      const [showManageDecks, setShowManageDecks] = useState(false);

      useEffect(() => {
        if (id) {
          fetchTournamentData();
        }
      }, [id]);

      const fetchTournamentData = async () => {
        try {
          setLoading(true);
          const { data: tournamentData, error: tournamentError } = await supabase
            .from('tournaments')
            .select('*')
            .eq('id', id)
            .single();
          if (tournamentError) throw tournamentError;
          setTournament(tournamentData);

          const { data: participantsData, error: participantsError } = await supabase
            .from('tournament_participants')
            .select(`
              points,
              id,
              deck,
              profiles:participant_id (username)
            `)
            .eq('tournament_id', id);
          if (participantsError) throw participantsError;
          setParticipants(participantsData.map(p => ({ username: p.profiles.username, points: p.points, id: p.id, deck: p.deck })) || []);

          const { data: matchesData, error: matchesError } = await supabase
            .from('matches')
            .select(`
              id,
              round,
              status,
              winner_id,
              player1_id,
              player2_id,
              player1:player1_id(username),
              player2:player2_id(username)
            `)
            .eq('tournament_id', id)
            .order('round', { ascending: true });
          if (matchesError) throw matchesError;
          setMatches(matchesData.map(m => ({ ...m, player1: m.player1.username, player2: m.player2.username })) || []);
        } catch (error: any) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      const handleStartTournament = async () => {
        try {
          // Check if all participants have decks
          const participantsWithoutDecks = participants.filter(p => !p.deck || !p.deck.deck1 || p.deck.deck1.length === 0 || !p.deck.deck2 || p.deck.deck2.length === 0);
          if (participantsWithoutDecks.length > 0) {
            const names = participantsWithoutDecks.map(p => p.username).join(', ');
            setError(`Giocatore ${names} non ha selezionato i deck`);
            return;
          }

          if (tournament?.max_players !== null && participants.length < tournament.max_players) {
            const missingPlayers = tournament.max_players - participants.length;
            setError(`Mancano ${missingPlayers} giocatori per avviare il torneo`);
            return;
          }

          const { error } = await supabase
            .from('tournaments')
            .update({ status: 'in_progress' })
            .eq('id', id);
          if (error) throw error;

          // Call the function to generate matches
          const { error: generateMatchesError } = await supabase.rpc('generate_tournament_matches', {
            tournament_id_param: id,
          });
          if (generateMatchesError) throw generateMatchesError;

          fetchTournamentData();
        } catch (error: any) {
          setError(error.message);
        }
      };

      const handleSetWinner = async (matchId: string, winnerId: string) => {
        try {
          // 1. Update the match with the winner
          const { error: matchError } = await supabase
            .from('matches')
            .update({ winner_id: winnerId, status: 'completed' })
            .eq('id', matchId);
          if (matchError) throw matchError;

          // 2. Increment points for the winner
          const { data: pointsData, error: pointsError } = await supabase.rpc('increment_points', {
            tournament_id_param: id,
            participant_id_param: winnerId,
          });
          if (pointsError) throw pointsError;

          // 3. Check if all matches are completed and update tournament status
          if (await allMatchesCompleted()) {
            await supabase
              .from('tournaments')
              .update({ status: 'completed' })
              .eq('id', id);
          }

          // 4. Fetch updated data
          fetchTournamentData();
        } catch (error: any) {
          setError(error.message);
        }
      };

      const allMatchesCompleted = async () => {
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .eq('tournament_id', id)
          .eq('status', 'scheduled');
        if (error) {
          console.error("Error checking matches:", error);
          return false;
        }
        return data.length === 0;
      };

      if (loading) {
        return <div>Loading...</div>;
      }

      if (!tournament) {
        return <div>Tournament not found</div>;
      }

      const isOwner = tournament.created_by === user?.id;

      const getWinner = () => {
        if (tournament.status !== 'completed' || participants.length === 0) return null;
        return participants.reduce((prev, current) => (prev.points > current.points) ? prev : current);
      };

      const winner = getWinner();

      return (
        <div className="max-w-4xl mx-auto p-4 bg-gray-50 bg-opacity-50 rounded-lg shadow-md">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <button onClick={() => navigate(-1)} className="mb-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition">
            Back
          </button>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 inline-block">{tournament.name}</h1>
              <span className="text-gray-600 ml-2">
                Giocatori ({participants.length}/{tournament.max_players === null ? '∞' : tournament.max_players})
              </span>
              <p className="mt-2 text-gray-800">{tournament.description}</p>
              {tournament.start_date && (
                <p className="mt-2 text-gray-600">Start Date: {new Date(tournament.start_date).toLocaleDateString()}</p>
              )}
              <div className="mt-4">
                <span className={`px-2 py-1 text-sm rounded-full ${
                  tournament.status === 'completed' ? 'bg-green-100 text-green-800' :
                    tournament.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                  {tournament.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Matches</h2>
              {(tournament.status === 'in_progress' || tournament.status === 'completed') && (
                <MatchList
                  matches={matches}
                  onSetWinner={isOwner && tournament.status === 'in_progress' ? handleSetWinner : undefined}
                  readonly={tournament.status === 'completed' || !isOwner}
                />
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Classifica</h2>
              <div className="bg-white rounded-lg shadow p-4">
                <ParticipantList
                  participants={participants
                    .sort((a, b) => b.points - a.points)
                    .map(p => `${p.username} (${p.points} points)`)
                  }
                  readonly
                />
              </div>
            </div>
          </div>
          {tournament.status === 'completed' && winner && (
            <div className="flex flex-col items-center justify-center mt-8">
              <p className="text-center text-green-600 font-bold text-3xl text-outline"style={{
        textShadow: `
          -2px -2px 0 #105050,
          2px -2px 0 #105050,
          -2px 2px 0 #105050,
          2px 2px 0 #105050
        `,
      }}>VINCITORE</p>
              <img src="/icons/crown.png" alt="Winner Crown" className="h-40 w-48" />
              <p className="mt-2 text-4xl font-bold text-gray-900 text-center">{winner.username}</p>
            </div>
          )}
          <div className="mt-4 flex items-center space-x-4">
            <Link to={`/tournaments/${id}/participants`} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-700 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Lista Giocatori
            </Link>
            {isOwner && tournament.status === 'draft' && (
              <button onClick={handleStartTournament} className="bg-gradient-to-r from-green-500 to-green-700 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-md">
                Start Tournament
              </button>
            )}
          </div>
        </div>
      );
    }
