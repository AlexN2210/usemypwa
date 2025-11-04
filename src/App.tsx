import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { MultiStepSignupForm } from './components/Auth/MultiStepSignupForm';
import { Header } from './components/Layout/Header';
import { BottomNav } from './components/Layout/BottomNav';
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { MapPage } from './pages/MapPage';
import { PostsPage } from './pages/PostsPage';
import { ProfilePage } from './pages/ProfilePage';

// Composant de gestion d'erreur pour afficher les erreurs de chargement
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Erreur capturée:', event.error);
      setError(event.error);
      setHasError(true);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Promesse rejetée:', event.reason);
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (hasError) {
    // Vérifier si c'est une erreur de configuration Supabase
    const isSupabaseError = error?.message?.includes('Supabase') || 
                            error?.message?.includes('ERR_NAME_NOT_RESOLVED') ||
                            error?.message?.includes('Failed to fetch');

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {isSupabaseError ? 'Erreur de connexion Supabase' : 'Erreur de chargement'}
          </h1>
          <p className="text-gray-600 mb-6">
            {isSupabaseError ? (
              <>
                L'application ne peut pas se connecter à Supabase. Vérifiez :
                <ul className="text-left mt-4 space-y-2 text-sm">
                  <li>• Votre connexion Internet</li>
                  <li>• La configuration Supabase (variables d'environnement)</li>
                  <li>• Que votre projet Supabase est actif</li>
                </ul>
              </>
            ) : (
              'L\'application n\'a pas pu se charger correctement. Cela peut être dû à un problème de cache ou de service worker.'
            )}
          </p>
          {error && (
            <details className="text-left mb-4 p-4 bg-gray-100 rounded text-sm">
              <summary className="cursor-pointer font-semibold mb-2">Détails de l'erreur</summary>
              <pre className="text-xs overflow-auto whitespace-pre-wrap">{error.message}</pre>
            </details>
          )}
          <div className="space-y-2">
            <button
              onClick={() => {
                // Réinitialiser le service worker
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(registrations => {
                    registrations.forEach(registration => registration.unregister());
                    // Vider le cache
                    if ('caches' in window) {
                      caches.keys().then(names => {
                        names.forEach(name => caches.delete(name));
                      });
                    }
                    // Recharger la page
                    window.location.reload();
                  });
                } else {
                  window.location.reload();
                }
              }}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              🔄 Réinitialiser et recharger
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              ↻ Recharger la page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center p-4">
      {mode === 'login' ? (
        <LoginForm onToggleMode={() => setMode('signup')} />
      ) : (
        <MultiStepSignupForm onToggleMode={() => setMode('login')} />
      )}
    </div>
  );
}

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800">Usemy</h2>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 overflow-hidden pt-16">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'discover' && <DiscoverPage />}
        {activeTab === 'map' && <MapPage />}
        {activeTab === 'posts' && <PostsPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
