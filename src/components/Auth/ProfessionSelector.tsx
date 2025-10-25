import { useState } from 'react';
import { Search } from 'lucide-react';

interface ProfessionSelectorProps {
  selectedProfession: string;
  onProfessionChange: (profession: string) => void;
}

const PROFESSIONS = [
  'Santé & Bien-être',
  'Beauté & Esthétique',
  'Maison & Jardin',
  'Technologie & Informatique',
  'Éducation & Formation',
  'Sport & Fitness',
  'Art & Culture',
  'Transport & Logistique',
  'Restauration & Hôtellerie',
  'Commerce & Vente',
  'Services financiers',
  'Immobilier',
  'Légal & Juridique',
  'Marketing & Communication',
  'Autre'
];

export function ProfessionSelector({ selectedProfession, onProfessionChange }: ProfessionSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProfessions = PROFESSIONS.filter(profession =>
    profession.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Votre profession
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Sélectionnez votre domaine d'activité pour mieux vous connecter avec vos clients
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Rechercher une profession..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
        />
      </div>

      {/* Liste des professions */}
      <div className="max-h-60 overflow-y-auto space-y-2">
        {filteredProfessions.map((profession) => (
          <button
            key={profession}
            type="button"
            onClick={() => onProfessionChange(profession)}
            className={`w-full text-left p-3 rounded-lg border-2 transition ${
              selectedProfession === profession
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <span className="font-medium">{profession}</span>
          </button>
        ))}
      </div>

      {filteredProfessions.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          Aucune profession trouvée pour "{searchTerm}"
        </div>
      )}
    </div>
  );
}
