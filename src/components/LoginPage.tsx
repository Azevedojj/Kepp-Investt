import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Mail, Lock, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import { dbService } from '../services/DatabaseService';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const sanitizedEmail = email.toLowerCase().trim();
      const user = await dbService.loginUser(sanitizedEmail, password);
      
      if (user) {
        login(user);
        navigate('/');
      } else {
        setError(t('auth.invalidCredentials'));
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        if (err.message.includes('Conta banida') || err.message.includes('Conta suspensa')) {
          setError(err.message);
        } else {
          setError(t('auth.loginError'));
        }
      } else {
        setError(t('auth.loginError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4 relative">
      {/* Elementos decorativos minimalistas */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Círculos sutis */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-orange-100 to-transparent rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-orange-100 to-transparent rounded-full blur-3xl opacity-20" />

        {/* Padrão de pontos minimalista */}
        <div className="absolute inset-0 bg-[radial-gradient(#fb923c_0.5px,transparent_0.5px)] [background-size:48px_48px] opacity-[0.08]" />

        {/* Linhas decorativas simples */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-200/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-200/10 to-transparent" />
        </div>
      </div>

      {/* Container principal */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg w-full max-w-4xl flex flex-col md:flex-row overflow-hidden relative z-10 border border-gray-100">
        {/* Lado Esquerdo - Welcome */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-12 md:w-[45%] flex flex-col justify-center relative overflow-hidden">
          <div className="relative">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-white/10 rounded-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Kepp Invest</h1>
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">Hello, Welcome Back!</h2>
            <p className="text-orange-50 mb-8 text-lg">{t('auth.welcomeMessage')}</p>
            <Link 
              to="/register"
              className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white rounded-xl px-6 py-3 text-sm font-medium transition-all border border-white/20 hover:border-white/40"
            >
              <span>{t('auth.register')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Lado Direito - Form */}
        <div className="p-12 md:w-[55%] flex flex-col justify-center bg-white relative">
          <div className="relative">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.loginTitle')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('auth.loginSubtitle')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-full animate-shake">
                  {error}
                </div>
              )}

              <div>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.email')}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.password')}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <div className="flex justify-end mt-2">
                  <Link 
                    to="/forgot-password"
                    className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-medium
                  ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:from-orange-600 hover:to-orange-700'}
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    <span>{t('common.loading')}</span>
                  </div>
                ) : (
                  t('auth.loginButton')
                )}
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    {t('auth.orLoginWith')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className="flex justify-center items-center px-4 py-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <img 
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="h-5 w-5"
                  />
                </button>
                <button
                  type="button"
                  className="flex justify-center items-center px-4 py-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <img 
                    src="https://www.svgrepo.com/show/448234/facebook.svg"
                    alt="Facebook"
                    className="h-5 w-5"
                  />
                </button>
                <button
                  type="button"
                  className="flex justify-center items-center px-4 py-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <img 
                    src="https://www.svgrepo.com/show/513008/linkedin-112.svg"
                    alt="LinkedIn"
                    className="h-5 w-5"
                  />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}; 