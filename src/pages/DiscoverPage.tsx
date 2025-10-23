import { useState, useEffect } from 'react';
import { supabase, Profile, ProfessionalProfile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Search, Filter, MapPin, Briefcase, Star } from 'lucide-react';

const CATEGORIES = [
  'Tous',
  'Santé',
  'Maison',
  'Beauté',
  'Technologie',
  'Éducation',
  'Finance',
  'Transport',
  'Restauration',
];

const DISTANCES = [5, 10, 25, 50, 100];

export function DiscoverPage() {
  const { profile } = useAuth();
  const [professionals, setProfessionals] = useState<Array<{ profile: Profile; professionalProfile?: ProfessionalProfile; distance?: number }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [maxDistance, setMaxDistance] = useState(25);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfessionals();
  }, [selectedCategory, maxDistance]);

  const loadProfessionals = async () => {
    setLoading(true);

    let query = supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'professional');

    const { data: profilesData, error } = await query;

    if (error) {
      console.error('Error loading professionals:', error);
      setLoading(false);
      return;
    }

    const enrichedProfiles = await Promise.all(
      (profilesData || []).map(async (prof) => {
        const { data: professionalData } = await supabase
          .from('professional_profiles')
          .select('*')
          .eq('user_id', prof.id)
          .maybeSingle();

        let distance: number | undefined;
        if (profile?.latitude && profile?.longitude && prof.latitude && prof.longitude) {
          distance = calculateDistance(
            profile.latitude,
            profile.longitude,
            prof.latitude,
            prof.longitude
          );
        }

        return {
          profile: prof,
          professionalProfile: professionalData || undefined,
          distance,
        };
      })
    );

    let filtered = enrichedProfiles;

    if (selectedCategory !== 'Tous') {
      filtered = filtered.filter(
        p => p.professionalProfile?.category === selectedCategory
      );
    }

    if (profile?.latitude && profile?.longitude) {
      filtered = filtered.filter(
        p => p.distance !== undefined && p.distance <= maxDistance
      );
    }

    filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    setProfessionals(filtered);
    setLoading(false);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredBySearch = professionals.filter(p =>
    p.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.professionalProfile?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.professionalProfile?.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un professionnel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filtres</span>
        </button>

        {showFilters && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      selectedCategory === category
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance maximale: {maxDistance}km
              </label>
              <div className="flex gap-2">
                {DISTANCES.map((distance) => (
                  <button
                    key={distance}
                    onClick={() => setMaxDistance(distance)}
                    className={`flex-1 py-2 rounded-lg font-medium transition ${
                      maxDistance === distance
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {distance}km
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredBySearch.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <Search className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun professionnel trouvé</h3>
            <p className="text-gray-500">Essayez d'ajuster vos filtres de recherche</p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {filteredBySearch.map(({ profile: prof, professionalProfile, distance }) => (
              <div
                key={prof.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="flex">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 flex-shrink-0">
                    {prof.avatar_url ? (
                      <img
                        src={prof.avatar_url}
                        alt={prof.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        {prof.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{prof.full_name}</h3>
                        {professionalProfile?.company_name && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Briefcase className="w-4 h-4" />
                            <span>{professionalProfile.company_name}</span>
                          </div>
                        )}
                      </div>
                      {professionalProfile?.verified && (
                        <Star className="w-5 h-5 text-blue-500" fill="currentColor" />
                      )}
                    </div>

                    {professionalProfile?.category && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium mb-2">
                        {professionalProfile.category}
                      </span>
                    )}

                    {distance !== undefined && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
