import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginModalProps {
  onLogin: (user: User) => void;
  error: string | null;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo, users are hardcoded
    const users: User[] = [
      { id: '1', username: 'pm', password: 'pm', role: UserRole.PROJECT_MANAGER, name: 'John Doe (PM)' },
      { id: '2', username: 'se', password: 'se', role: UserRole.SITE_ENGINEER, name: 'Jane Smith (SE)' },
      { id: '3', username: 'sup', password: 'sup', role: UserRole.SUPERVISOR, name: 'Bob Johnson (Sup)' },
      { id: '4', username: 'lab', password: 'lab', role: UserRole.LAB_TECHNICIAN, name: 'Alice Brown (Lab)' },
    ];
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      alert('Invalid username or password');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Login to RoadMaster</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="text-sm text-slate-600 dark:text-gray-400">
            Demo accounts: pm/pm, se/se, sup/sup, lab/lab
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
