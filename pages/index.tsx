import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const HomePage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2">IPL Auction App</h1>
        <p className="text-center text-gray-600 mb-8">Manage player auctions for cricket teams</p>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">For Auction Admin</h2>
            <p className="text-gray-600 mb-4">
              Generate players, set base prices, and manage the auction process
            </p>
            <Link href="/admin/login" className="block">
              <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">
                Admin Login
              </button>
            </Link>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">For Team Owners</h2>
            <p className="text-gray-600 mb-4">
              Bid on players and build your dream cricket team
            </p>
            <Link href="/buyer/login" className="block">
              <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition">
                Team Login
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>This is a demonstration app for IPL-style auctions</p>
          <p className="mt-2">No real money transactions involved</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;