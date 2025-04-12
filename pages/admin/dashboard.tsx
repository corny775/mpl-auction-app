import React, { useState, useEffect } from 'react';
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

const AdminDashboard = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'unsold', 'sold'
  const [showAuctionPanel, setShowAuctionPanel] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/players?status=${statusFilter}`);
        setPlayers(response.data);
        setError('');
      } catch (error) {
        setError('Failed to fetch players');
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [statusFilter, router]);

  const generateRandomPlayer = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post('/api/players', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setPlayers([response.data, ...players]);
    } catch (error) {
      setError('Failed to generate player');
      console.error('Error generating player:', error);
    }
  };

  const startAuction = (player: Player) => {
    setSelectedPlayer(player);
    setShowAuctionPanel(true);
  };

  const finalizeSale = async (playerId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        '/api/bids',
        { action: 'finalize', playerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedPlayers = players.map(player => 
        player.id === playerId ? { ...player, isSold: true } : player
      );
      
      setPlayers(updatedPlayers);
      setShowAuctionPanel(false);
    } catch (error) {
      setError('Failed to finalize sale');
      console.error('Error finalizing sale:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">IPL Auction Admin</h1>
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
          <div>
            <button
              onClick={generateRandomPlayer}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-4"
            >
              Generate Random Player
            </button>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="all">All Players</option>
              <option value="unsold">Unsold Players</option>
              <option value="sold">Sold Players</option>
            </select>
          </div>
          
          <Link href="/" className="text-blue-500 hover:underline">
            Back to Home
          </Link>
        </div>

        {loading ? (
          <p className="text-center py-4">Loading players...</p>
        ) : players.length === 0 ? (
          <p className="text-center py-4">No players found. Generate some players to start.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <div
                key={player.id}
                className={`bg-white rounded-lg shadow-md p-4 ${
                  player.isSold ? 'border-green-500 border-2' : ''
                }`}
              >
                <h2 className="text-xl font-bold">{player.name}</h2>
                <p className="text-gray-600">{player.role}</p>
                <div className="mt-2">
                  <p>Base Price: ₹{(player.basePrice / 1000000).toFixed(2)} Cr</p>
                  <p>Current Bid: ₹{(player.currentBid / 1000000).toFixed(2)} Cr</p>
                  {player.soldToTeam && (
                    <p>Team: {player.soldToTeam}</p>
                  )}
                  <p className="mt-1">
                    Status: {player.isSold ? (
                      <span className="text-green-500 font-semibold">Sold</span>
                    ) : (
                      <span className="text-gray-500">Unsold</span>
                    )}
                  </p>
                </div>
                
                {!player.isSold && (
                  <div className="mt-3">
                    <button
                      onClick={() => startAuction(player)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 mr-2"
                    >
                      Conduct Auction
                    </button>
                    
                    {player.currentBid > 0 && (
                      <button
                        onClick={() => finalizeSale(player.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                      >
                        Finalize Sale
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showAuctionPanel && selectedPlayer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">Auction in Progress</h2>
              <div className="mb-4">
                <p className="text-lg font-semibold">{selectedPlayer.name}</p>
                <p>{selectedPlayer.role}</p>
                <p className="mt-2">Base Price: ₹{(selectedPlayer.basePrice / 1000000).toFixed(2)} Cr</p>
                <p>Current Bid: ₹{(selectedPlayer.currentBid / 1000000).toFixed(2)} Cr</p>
                {selectedPlayer.soldToTeam && (
                  <p className="mt-2">Current Bidder: {selectedPlayer.soldToTeam}</p>
                )}
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => finalizeSale(selectedPlayer.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  disabled={selectedPlayer.currentBid === 0}
                >
                  Finalize Sale
                </button>
                
                <button
                  onClick={() => setShowAuctionPanel(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
