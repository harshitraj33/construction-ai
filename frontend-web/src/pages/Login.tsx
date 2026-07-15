import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, LanguageCode } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { HardHat, Eye, EyeOff, Lock, User, Globe } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { language, t, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (roleType: string) => {
    setError('');
    setLoading(true);
    try {
      await login(roleType, 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden theme-bg-root px-4 transition-colors duration-200">
      {/* Background ambient glowing blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />

      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 backdrop-blur cursor-pointer transition-all"
      >
        ← Back to Main Site
      </button>

      {/* Theme & Language Switcher Floating in Top Corner */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-800 dark:text-slate-300 backdrop-blur transition-all">
          <Globe size={14} className="text-blue-500 dark:text-blue-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="bg-transparent border-none text-black dark:text-white outline-none cursor-pointer focus:ring-0 font-medium"
          >
            <option value="en" className="bg-white dark:bg-slate-900 text-black dark:text-white">English</option>
            <option value="hi" className="bg-white dark:bg-slate-900 text-black dark:text-white">हिन्दी (Hindi)</option>
            <option value="mr" className="bg-white dark:bg-slate-900 text-black dark:text-white">मराठी (Marathi)</option>
            <option value="gu" className="bg-white dark:bg-slate-900 text-black dark:text-white">ગુજરાતી (Gujarati)</option>
            <option value="bn" className="bg-white dark:bg-slate-900 text-black dark:text-white">বাংলা (Bengali)</option>
          </select>
        </div>
      </div>

      <div className="w-full max-w-md glass rounded-2xl p-8 shadow-2xl relative z-10 border border-white/5">
        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/20 mb-3">
            <HardHat size={32} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            {t.brandName}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {t.tagline}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/15 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {t.username}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. jason_contractor"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {t.password}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-sm font-semibold text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-55 disabled:cursor-not-allowed mt-2 cursor-pointer"
          >
            {loading ? '...' : t.login}
          </button>
        </form>

        {/* Demo Fast Login Panel */}
        <div className="mt-8 border-t border-slate-800/80 pt-6">
          <h3 className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {t.demoAccounts}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('Contractor')}
              className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-880 text-[11px] font-medium text-slate-300 border border-slate-800 hover:border-slate-700 transition-all text-center cursor-pointer"
            >
              Contractor
            </button>
            <button
              onClick={() => handleDemoLogin('Client')}
              className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-880 text-[11px] font-medium text-slate-300 border border-slate-800 hover:border-slate-700 transition-all text-center cursor-pointer"
            >
              Client
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => handleDemoLogin('Vendor')}
              className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-880 text-[11px] font-medium text-slate-300 border border-slate-800 hover:border-slate-700 transition-all text-center cursor-pointer"
            >
              Vendor
            </button>
            <button
              onClick={() => handleDemoLogin('Labor')}
              className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-880 text-[11px] font-medium text-slate-300 border border-slate-800 hover:border-slate-700 transition-all text-center cursor-pointer"
            >
              Labor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
