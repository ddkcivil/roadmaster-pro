import React, { useState, useEffect } from 'react';
import { LogIn } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string) => void;
  onNavigateToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUsername');
    if (rememberedUser) {
      setUsername(rememberedUser);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    if (username === 'user' && password === 'password') {
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }
      onLogin(username);
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="relative z-10 w-full max-w-md p-10 bg-gray-800 rounded-2xl shadow-2xl transform transition-all duration-500 ease-out animate-fade-in">
        <div className="flex flex-col items-center mb-10">
          <div className="p-5 bg-indigo-600 rounded-full mb-4 shadow-lg animate-bounce-in">
            <LogIn size={52} className="text-white" />
          </div>
          <h2 className="text-5xl font-extrabold text-white mb-3 tracking-tight">RoadMaster Pro</h2>
          <p className="text-indigo-300 text-lg">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-7">
          <div>
            <label className="block text-base font-medium text-indigo-200 mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-5 py-3 border-2 border-indigo-700 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500 transition-all duration-300 ease-in-out hover:border-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium text-indigo-200 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-5 py-3 border-2 border-indigo-700 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500 transition-all duration-300 ease-in-out hover:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded-md bg-gray-700 cursor-pointer transition-colors duration-200"
              />
              <label htmlFor="remember-me" className="ml-3 block text-base text-indigo-200">
                Remember me
              </label>
            </div>
            {/* Optionally add a "Forgot password?" link here */}
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center animate-shake">{error}</p>
          )}

          <button
            type="submit"
            className="w-full btn bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 text-xl rounded-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-10">
          Hint: Use username "user" and password "password"
        </p>
        <p className="text-center text-base text-indigo-300 mt-5">
          Don't have an account?{' '}
          <button
            onClick={onNavigateToRegister}
            className="text-indigo-400 hover:underline font-semibold transition-colors duration-200"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
