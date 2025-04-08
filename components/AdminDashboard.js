import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

// Admin Dashboard Component
export const AdminDashboard = () => {
  const [players, setPlayers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get('/api/players');
        setPlayers(response.data);
      } catch (error) {
        console.error('Error fetching players', error);
      }
    };
    fetchPlayers();
  }, []);

  const generatePlayer = async () => {
    try {
      const response = await axios.post('/api/players/generate');
      setPlayers([...players, response.data]);
    } catch (error) {
      console.error('Error generating player', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">IPL Auction Admin Dashboard</h1>
      <button 
        onClick={generatePlayer}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Generate Random Player
      </button>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {players.map(player => (
          <div key={player.id} className="border p-4 rounded">
            <h2 className="font-bold">{player.name}</h2>
            <p>Role: {player.role}</p>
            <p>Base Price: ₹{player.basePrice.toLocaleString()}</p>
            <p>Current Bid: ₹{player.currentBid?.toLocaleString() || 'No bids'}</p>
            <button 
              onClick={() => finalizePlayerSale(player.id)}
              className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
            >
              Finalize Sale
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};