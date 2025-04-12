import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

interface Player {
  id: string;
  name: string;
  role: string;
  basePrice: number;
  currentBid: number;
  isSold: boolean;
  soldToTeam: string | null;
}

const BuyerBidPage = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setMessage] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [teamName, setTeamName] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState('unsold');
  const router = useRouter();

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/players?status=${statusFilter}`);
      setPlayers(response.data);
      setMessage('');
    } catch (error) {
      setMessage('Failed to fetch players');
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const token = localStorage.getItem('buyerToken');
    if (!token) {
      router.push('/buyer/login');
      return;
    }

    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      setTeamName(tokenData.teamName || 'Your Team');
    } catch (e) {
      console.error('Error parsing token:', e);
    }

    fetchPlayers();
  }, [fetchPlayers, router]);

  const selectPlayer = (player: Player) => {
    setSelectedPlayer(player);
    const startingBid = player.currentBid > 0 
      ? Math.ceil(player.currentBid * 1.05) 
      : player.basePrice;
    setBidAmount(startingBid);
  };

  const placeBid = async () => {
    if (!selectedPlayer) return;

    try {
      const token = localStorage.getItem('buyerToken');
      await axios.post(
        '/api/bids',
        {
          action: 'place',
          playerId: selectedPlayer.id,
          bidAmount
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedPlayers = players.map(player => 
        player.id === selectedPlayer.id 
          ? { ...player, currentBid: bidAmount, soldToTeam: teamName }
          : player
      );

      setPlayers(updatedPlayers);
      setSelectedPlayer(null);
      setMessage('Bid placed successfully!');
      setTimeout(fetchPlayers, 1000);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(error.response.data.message || 'Failed to place bid');
      } else {
        setMessage('An unexpected error occurred');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('buyerToken');
    router.push('/buyer/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">IPL Auction</h1>
            <p className="text-gray-600">Team: {teamName}</p>
          </div>
          <button 
            onClick={logout}
            className="text-red-500 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="unsold">Available Players</option>
            <option value="sold">Sold Players</option>
            <option value="all">All Players</option>
          </select>
          
          <Link href="/" className="text-blue-500 hover:underline">
            Back to Home
          </Link>
        </div>

        {loading ? (
          <p className="text-center py-4">Loading players...</p>
        ) : players.length === 0 ? (
          <p className="text-center py-4">No players found in this category.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <div
                key={player.id}
                className={`bg-white rounded-lg shadow-md p-4 cursor-pointer ${
                  selectedPlayer?.id === player.id ? 'border-blue-500 border-2' : ''
                } ${player.isSold ? 'opacity-75' : ''}`}
                onClick={() => !player.isSold && selectPlayer(player)}
              >
                <h2 className="text-xl font-bold">{player.name}</h2>
                <p className="text-gray-600">{player.role}</p>
                <div className="mt-2">
                  <p>Base Price: ₹{(player.basePrice / 1000000).toFixed(2)} Cr</p>
                  <p>Current Bid: ₹{(player.currentBid / 1000000).toFixed(2)} Cr</p>
                  {player.soldToTeam && (
                    <p className={player.soldToTeam === teamName ? 'text-green-600 font-semibold' : ''}>
                      Team: {player.soldToTeam}
                    </p>
                  )}
                  <p className="mt-1">
                    Status: {player.isSold ? (
                      <span className="text-green-500 font-semibold">Sold</span>
                    ) : (
                      <span className="text-gray-500">Available</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedPlayer && !selectedPlayer.isSold && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">Place Your Bid</h2>
              <div className="mb-4">
                <p className="text-lg font-semibold">{selectedPlayer.name}</p>
                <p>{selectedPlayer.role}</p>
                <p className="mt-2">Base Price: ₹{(selectedPlayer.basePrice / 1000000).toFixed(2)} Cr</p>
                <p>Current Bid: ₹{(selectedPlayer.currentBid / 1000000).toFixed(2)} Cr</p>
                {selectedPlayer.soldToTeam && (
                  <p className="mt-2">Current Bidder: {selectedPlayer.soldToTeam}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="bidAmount">
                  Your Bid (in Rupees)
                </label>
                <input
                  id="bidAmount"
                  type="number"
                  min={selectedPlayer.currentBid + 1}
                  step={1000000}
                  className="w-full p-2 border rounded"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-1">
                  ₹{(bidAmount / 1000000).toFixed(2)} Cr
                </p>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={placeBid}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  disabled={bidAmount <= selectedPlayer.currentBid}
                >
                  Place Bid
                </button>
                
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BuyerBidPage;
