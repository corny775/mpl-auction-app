// Buyer Bid Component
export const BuyerBidPage = () => {
    const [players, setPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [bidAmount, setBidAmount] = useState(0);
  
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
  
    const placeBid = async () => {
      try {
        await axios.post('/api/bids', {
          playerId: selectedPlayer.id,
          bidAmount
        });
        // Refresh players or update UI
      } catch (error) {
        console.error('Error placing bid', error);
      }
    };
  
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">IPL Auction - Place Bid</h1>
        <div className="grid grid-cols-3 gap-4">
          {players.map(player => (
            <div 
              key={player.id} 
              className={`border p-4 rounded cursor-pointer ${
                selectedPlayer?.id === player.id ? 'bg-blue-100' : ''
              }`}
              onClick={() => setSelectedPlayer(player)}
            >
              <h2 className="font-bold">{player.name}</h2>
              <p>Role: {player.role}</p>
              <p>Base Price: ₹{player.basePrice.toLocaleString()}</p>
              <p>Current Bid: ₹{player.currentBid?.toLocaleString() || 'No bids'}</p>
            </div>
          ))}
        </div>
        {selectedPlayer && (
          <div className="mt-4">
            <h2 className="text-xl font-bold">Bid for {selectedPlayer.name}</h2>
            <input 
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              placeholder="Enter bid amount"
              className="border p-2 rounded w-full"
            />
            <button 
              onClick={placeBid}
              className="bg-green-500 text-white px-4 py-2 rounded mt-2"
            >
              Place Bid
            </button>
          </div>
        )}
      </div>
    );
  };