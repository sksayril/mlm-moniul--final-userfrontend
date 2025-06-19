import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          password: password,
        }),
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        // Store token and user data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Call onLogin to update authentication state
        onLogin();
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-900">
      {/* Geometric Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        {/* Geometric Shapes */}
        <div className="absolute inset-0">
          {/* Large triangular shapes */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-gray-700 transform rotate-45 opacity-60"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gray-600 transform rotate-12 opacity-40"></div>
          <div className="absolute bottom-32 left-20 w-40 h-40 bg-gray-700 transform -rotate-12 opacity-50"></div>
          <div className="absolute bottom-20 right-32 w-28 h-28 bg-gray-600 transform rotate-45 opacity-45"></div>
          
          {/* Medium triangular shapes */}
          <div className="absolute top-60 left-1/3 w-20 h-20 bg-gray-600 transform rotate-30 opacity-30"></div>
          <div className="absolute top-32 right-1/3 w-16 h-16 bg-gray-700 transform -rotate-45 opacity-35"></div>
          <div className="absolute bottom-60 left-1/2 w-24 h-24 bg-gray-600 transform rotate-60 opacity-40"></div>
          
          {/* Small triangular shapes */}
          <div className="absolute top-80 right-10 w-12 h-12 bg-gray-500 transform rotate-15 opacity-25"></div>
          <div className="absolute bottom-80 right-1/4 w-14 h-14 bg-gray-600 transform -rotate-30 opacity-30"></div>
          <div className="absolute top-1/2 left-10 w-10 h-10 bg-gray-500 transform rotate-45 opacity-20"></div>
        </div>

        {/* Golden accent lines */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent transform rotate-45 opacity-60"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent transform -rotate-45 opacity-50"></div>
          <div className="absolute bottom-1/3 left-1/3 w-20 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent transform rotate-30 opacity-40"></div>
          <div className="absolute top-1/3 right-1/3 w-28 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent transform -rotate-30 opacity-45"></div>
        </div>

        {/* Small golden triangular accents */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-yellow-400 transform rotate-45 opacity-80"></div>
          <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-yellow-400 transform rotate-45 opacity-70"></div>
          <div className="absolute top-1/2 right-1/3 w-2.5 h-2.5 bg-yellow-400 transform rotate-45 opacity-60"></div>
          <div className="absolute bottom-1/3 right-1/5 w-2 h-2 bg-yellow-400 transform rotate-45 opacity-75"></div>
          <div className="absolute top-2/3 left-1/5 w-3 h-3 bg-yellow-400 transform rotate-45 opacity-65"></div>
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl px-8 py-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">FLT</span>
                </div>
                <div className="ml-3">
                  <div>
                    <div className="text-xl font-bold text-blue-600" style={{ fontFamily: 'serif' }}>ForLifeTrading</div>
                    <div className="text-sm font-semibold text-blue-500">India</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800 uppercase tracking-wide">
                USER LOGIN PANEL
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User ID Field */}
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  USER ID
                </label>
                <input
                  id="userId"
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-800"
                  placeholder="Enter your user ID"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-800 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}

              {/* Forgot Password & Sign In */}
              <div className="flex items-center justify-between pt-2">
                <button type="button" className="text-sm text-gray-600 hover:text-gray-800">
                  Forgot?
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Not registered?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                  Register now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;