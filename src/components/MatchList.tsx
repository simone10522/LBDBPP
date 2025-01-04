import React from 'react';
import { Check, X } from 'lucide-react';

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

interface MatchListProps {
  matches: Match[];
  onSetWinner?: (matchId: string, winnerId: string) => void;
  readonly?: boolean;
}

export default function MatchList({ matches, onSetWinner, readonly }: MatchListProps) {
  const roundsMap = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const rounds = Object.entries(roundsMap).sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div className="space-y-8">
      {rounds.map(([round, matches]) => (
        <div key={round}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Round {round}</h3>
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
              >
                <div className="flex items-center space-x-4">
                  <span className={match.winner_id === match.player1_id ? 'font-bold' : ''}>
                    {match.player1}
                  </span>
                  <span className="text-gray-500">vs</span>
                  <span className={match.winner_id === match.player2_id ? 'font-bold' : ''}>
                    {match.player2}
                  </span>
                </div>
                
                {!readonly && onSetWinner && match.status !== 'completed' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onSetWinner(match.id, match.player1_id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                      title={`${match.player1} wins`}
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onSetWinner(match.id, match.player2_id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                      title={`${match.player2} wins`}
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {match.status === 'completed' && (
                  <span className="text-green-600">Completed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
