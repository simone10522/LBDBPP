import React from 'react';

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
                          <img
                            src={`/icons/profile1.png`}
                            alt={`${match.player1} profile`}
                            className="h-11 w-11 rounded-full object-cover"
                          />
                        </button>
                        <button
                          onClick={() => onSetWinner(match.id, match.player2_id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                          title={`${match.player2} wins`}
                        >
                          <img
                            src={`/icons/profile2.png`}
                            alt={`${match.player2} profile`}
                            className="h-11 w-11 rounded-full object-cover"
                          />
                        </button>
                      </div>
                    )}

                    {match.status === 'completed' && match.winner_id && (
                      <img
                        src={`/icons/profile${match.winner_id === match.player1_id ? '1' : '2'}.png`}
                        alt="Winner"
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    )}
                    {match.status === 'completed' && !match.winner_id && (
                      <span className="text-gray-600">Pareggio</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
