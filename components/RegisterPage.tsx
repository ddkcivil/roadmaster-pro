import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { UserRole } from '../types';

interface RegisterPageProps {
  onRegister: (userData: { username: string, email: string, phone: string, role: UserRole }) => void;
  onNavigateToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onNavigateToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.SITE_ENGINEER);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password || !confirmPassword || !email || !phone) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (username.length > 3 && password.length > 5) {
      onRegister({ username, email, phone, role });
    } else {
      setError('Username must be at least 4 characters and password at least 6 characters.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="card w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-primary rounded-full mb-4">
            <UserPlus size={48} className="text-on-primary" />
          </div>
          <h2 className="text-4xl font-bold text-text mb-2">Create Account</h2>
          <p className="text-gray-500">Join RoadMaster Pro</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-text placeholder-gray-500 focus:ring-2 focus:ring-primary"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-text placeholder-gray-500 focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="phone">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-text placeholder-gray-500 focus:ring-2 focus:ring-primary"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-text focus:ring-2 focus:ring-primary"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-text placeholder-gray-500 focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a strong password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-text placeholder-gray-500 focus:ring-2 focus:ring-primary"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full btn btn-primary py-3 text-lg"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{' '}
          <button
            onClick={onNavigateToLogin}
            className="text-primary hover:underline font-medium"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
