import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onToggleMode: () => void;
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
      <div className="flex items-center justify-center mb-8">
        <img src="/logoheader.png" alt="Usemy Logo" className="w-16 h-16" />
      </div>

      <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Connexion</h2>
      <p className="text-center text-gray-600 mb-8">Accédez à votre compte Usemy</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          style={{
            background: 'linear-gradient(to right, #00FFFF, #00E5FF)'
          }}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Pas encore de compte ?{' '}
          <button
            onClick={onToggleMode}
            className="text-blue-500 font-semibold hover:text-blue-600 transition"
          >
            S'inscrire
          </button>
        </p>
      </div>
    </div>
  );
}
