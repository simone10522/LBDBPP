import React, { useState, useEffect } from 'react';
    import { useNavigate, useParams } from 'react-router-dom';
    import { supabase } from '../lib/supabase';
    import { useAuth } from '../hooks/useAuth';

    export default function EditTournament() {
      const { user } = useAuth();
      const navigate = useNavigate();
      const { id } = useParams<{ id: string }>();
      const [name, setName] = useState('');
      const [description, setDescription] = useState('');
      const [startDate, setStartDate] = useState('');
      const [maxPlayers, setMaxPlayers] = useState('illimitato');
      const [maxRounds, setMaxRounds] = useState('illimitato');
      const [error, setError] = useState('');
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const fetchTournament = async () => {
          if (!id) return;
          try {
            setLoading(true);
            const { data, error } = await supabase
              .from('tournaments')
              .select('*')
              .eq('id', id)
              .single();
            if (error) throw error;
            setName(data.name);
            setDescription(data.description || '');
            setStartDate(data.start_date ? data.start_date.slice(0, 10) : '');
            setMaxPlayers(data.max_players === null ? 'illimitato' : String(data.max_players));
            setMaxRounds(data.max_rounds === null ? 'illimitato' : String(data.max_rounds));
          } catch (error: any) {
            setError(error.message);
          } finally {
            setLoading(false);
          }
        };
        fetchTournament();
      }, [id]);

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          const maxPlayersValue = maxPlayers === 'illimitato' ? null : parseInt(maxPlayers, 10);
          if (maxPlayersValue !== null && isNaN(maxPlayersValue)) {
            throw new Error("Numero massimo di giocatori non valido.");
          }
          const maxRoundsValue = maxRounds === 'illimitato' ? null : parseInt(maxRounds, 10);
          if (maxRoundsValue !== null && isNaN(maxRoundsValue)) {
            throw new Error("Numero massimo di turni non valido.");
          }
          const { error } = await supabase
            .from('tournaments')
            .update({ name, description, start_date: startDate, max_players: maxPlayersValue, max_rounds: maxRoundsValue })
            .eq('id', id);
          if (error) throw error;
          navigate(`/tournaments/${id}`);
        } catch (error: any) {
          setError(error.message);
        }
      };

      if (loading) {
        return <div>Loading...</div>;
      }

      return (
        <div className="max-w-md mx-auto p-4 bg-gray-200 bg-opacity-50 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Tournament</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tournament Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Max Players</label>
              <select
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="illimitato">Unlimited</option>
                {Array.from({ length: 50 }, (_, i) => i + 2).map((num) => (
                  <option key={num} value={num.toString()}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Rounds</label>
              <select
                value={maxRounds}
                onChange={(e) => setMaxRounds(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="illimitato">Unlimited</option>
                {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num.toString()}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-700 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Aggiorna Torneo
            </button>
          </form>
        </div>
      );
    }