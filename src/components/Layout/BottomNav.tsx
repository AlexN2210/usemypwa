import { Home, Compass, MapPin, FileText, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'discover', icon: Compass, label: 'Découvrir' },
    { id: 'map', icon: MapPin, label: 'Proximité' },
    { id: 'home', icon: Home, label: 'Accueil' },
    { id: 'posts', icon: FileText, label: 'Posts' },
    { id: 'profile', icon: User, label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-screen-xl mx-auto px-2">
        <div className="flex justify-around items-center h-16">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                activeTab === id
                  ? 'text-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${activeTab === id ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
