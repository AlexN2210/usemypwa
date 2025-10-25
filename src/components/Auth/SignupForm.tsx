import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, User } from 'lucide-react';

interface SignupFormProps {
  onToggleMode: () => void;
}

export function SignupForm({ onToggleMode }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<'professional' | 'individual'>('individual');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password, fullName, userType);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
      <div className="flex items-center justify-center mb-8">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-xl">
          <img src="/logoheader.png" alt="Usemy Logo" className="w-8 h-8" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Inscription</h2>
      <p className="text-center text-gray-600 mb-8">Rejoignez la communauté Usemy</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Type de compte</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUserType('individual')}
              className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                userType === 'individual'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <User className={`w-6 h-6 ${userType === 'individual' ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className={`font-medium text-sm ${userType === 'individual' ? 'text-blue-700' : 'text-gray-600'}`}>
                Particulier
              </span>
            </button>
            <button
              type="button"
              onClick={() => setUserType('professional')}
              className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                userType === 'professional'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Briefcase className={`w-6 h-6 ${userType === 'professional' ? 'text-emerald-500' : 'text-gray-400'}`} />
              <span className={`font-medium text-sm ${userType === 'professional' ? 'text-emerald-700' : 'text-gray-600'}`}>
                Professionnel
              </span>
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Nom complet
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
            placeholder="Jean Dupont"
          />
        </div>

        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
            placeholder="••••••••"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Déjà inscrit ?{' '}
          <button
            onClick={onToggleMode}
            className="text-emerald-500 font-semibold hover:text-emerald-600 transition"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}
