import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { SignupForm } from './components/Auth/SignupForm';
import { Header } from './components/Layout/Header';
import { BottomNav } from './components/Layout/BottomNav';
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { MapPage } from './pages/MapPage';
import { PostsPage } from './pages/PostsPage';
import { ProfilePage } from './pages/ProfilePage';

function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center p-4">
      {mode === 'login' ? (
        <LoginForm onToggleMode={() => setMode('signup')} />
      ) : (
        <SignupForm onToggleMode={() => setMode('login')} />
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
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
