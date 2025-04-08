import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

const BuyerLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [teamName, setTeamName] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const action = isLogin ? 'login' : 'register';
      const payload = isLogin 
        ? { action, username, password } 
        : { action, username, password, teamName };
      
      const response = await axios.post('/api/buyer/auth', payload);

      if (response.data.token) {
        // Store token in localStorage
        localStorage.setItem('buyerToken', response.data.token);
        // Redirect to buyer bidding page
        router.push('/buyer/bid');
      } else {
        setMessage(response.data.message || 'Registration successful. Please login now.');
        if (!isLogin) {
          setIsLogin(true); // Switch to login form after successful registration
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(error.response.data.message || 'Authentication failed');
      } else {
        setMessage('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Team Login' : 'Team Registration'}
        </h1>
        
        {message && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="w-full p-2 border rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full p-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {!isLogin && (
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="teamName">
                Team Name
              </label>
              <input
                id="teamName"
                type="text"
                className="w-full p-2 border rounded"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            className="text-blue-500 hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Need to register?' : 'Already have an account?'}
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-500 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyerLogin;