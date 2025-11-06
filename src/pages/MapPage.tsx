import { useState, useEffect, lazy, Suspense } from 'react';
import { supabase, Profile, ProfessionalProfile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Navigation, Briefcase, Star } from 'lucide-react';

// Import dynamique de la carte pour éviter les problèmes de compatibilité
const MapComponent = lazy(() => import('../components/Map/MapComponent').then(module => ({ default: module.MapComponent })));

export function MapPage() {
  const { profile } = useAuth();
  const [professionals, setProfessionals] = useState<Array<{ profile: Profile; professionalProfile?: ProfessionalProfile; distance?: number }>>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<{ profile: Profile; professionalProfile?: ProfessionalProfile; distance?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]); // Paris par défaut
  const [mapZoom, setMapZoom] = useState(13);

  useEffect(() => {
    // Demander la géolocalisation de l'utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setMapCenter([lat, lng]);
          setMapZoom(13);
        },
        (error) => {
          console.warn('Erreur de géolocalisation:', error);
          // Utiliser la position du profil si disponible
          if (profile?.latitude && profile?.longitude) {
            setUserLocation({ lat: profile.latitude, lng: profile.longitude });
            setMapCenter([profile.latitude, profile.longitude]);
          }
        }
      );
    } else if (profile?.latitude && profile?.longitude) {
      // Fallback sur la position du profil
      setUserLocation({ lat: profile.latitude, lng: profile.longitude });
      setMapCenter([profile.latitude, profile.longitude]);
    }
  }, [profile]);

  // Charger les professionnels quand le profil ou la position change
  useEffect(() => {
    loadProfessionals();
  }, [profile, userLocation]);

  const loadProfessionals = async () => {
    setLoading(true);

    console.log('🔍 Chargement des professionnels...', { userLocation, profileLocation: profile?.latitude ? { lat: profile.latitude, lng: profile.longitude } : null });

    // Charger tous les professionnels (même sans coordonnées)
    const { data: profilesData, error } = await supabase
      .from('profiles')
      .select('*')
      .in('user_type', ['professional', 'professionnel'])
      .neq('id', profile?.id || '00000000-0000-0000-0000-000000000000'); // Exclure l'utilisateur connecté

    if (error) {
      console.error('❌ Error loading professionals:', error);
      setLoading(false);
      return;
    }

    console.log(`📊 ${profilesData?.length || 0} professionnels trouvés au total`);

    // Utiliser userLocation si disponible, sinon profile
    const referenceLocation = userLocation || (profile?.latitude && profile?.longitude ? { lat: profile.latitude, lng: profile.longitude } : null);

    const enrichedProfiles = await Promise.all(
      (profilesData || []).map(async (prof) => {
        const { data: professionalData } = await supabase
          .from('professional_profiles')
          .select('*')
          .eq('user_id', prof.id)
          .maybeSingle();

        // Si pas de coordonnées mais une adresse, essayer de géocoder
        let lat = prof.latitude;
        let lng = prof.longitude;
        
        if ((!lat || !lng) && prof.address && prof.postal_code && prof.city) {
          // Géocoder l'adresse si pas de coordonnées
          try {
            const geocoded = await geocodeAddress(prof.address, prof.postal_code, prof.city);
            if (geocoded) {
              lat = geocoded.lat;
              lng = geocoded.lng;
              // Optionnel: sauvegarder les coordonnées dans la base
              // await supabase.from('profiles').update({ latitude: lat, longitude: lng }).eq('id', prof.id);
            }
          } catch (error) {
            console.warn(`⚠️ Erreur de géocodage pour ${prof.full_name}:`, error);
          }
        }

        let distance: number | undefined;
        if (referenceLocation && lat && lng) {
          distance = calculateDistance(
            referenceLocation.lat,
            referenceLocation.lng,
            lat,
            lng
          );
        }

        return {
          profile: {
            ...prof,
            latitude: lat || prof.latitude,
            longitude: lng || prof.longitude,
          },
          professionalProfile: professionalData || undefined,
          distance,
        };
      })
    );

    // Filtrer et trier par distance
    const filteredProfiles = enrichedProfiles.filter(p => p.profile.id !== profile?.id); // Exclure l'utilisateur lui-même
    filteredProfiles.sort((a, b) => {
      if (a.distance === undefined && b.distance === undefined) return 0;
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });

    console.log(`✅ ${filteredProfiles.length} professionnels chargés`, filteredProfiles.map(p => ({
      name: p.profile.full_name,
      distance: p.distance?.toFixed(2) + 'km',
      hasCoords: !!(p.profile.latitude && p.profile.longitude)
    })));

    setProfessionals(filteredProfiles);
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

  // Fonction pour géocoder une adresse (utilise Nominatim OpenStreetMap)
  const geocodeAddress = async (address: string, postalCode: string, city: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const query = `${address}, ${postalCode} ${city}, France`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Usemy-PWA/1.0'
        }
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    } catch (error) {
      console.warn('Erreur de géocodage:', error);
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        {userLocation && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Votre position</p>
                <p className="text-sm font-semibold text-gray-800">{profile?.city || 'Position actuelle'}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[999]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[999]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            }
          >
            <MapComponent
              center={mapCenter}
              zoom={mapZoom}
              userLocation={userLocation}
              professionals={professionals}
              onMarkerClick={setSelectedProfessional}
              userCity={profile?.city}
            />
          </Suspense>
        )}
      </div>

      <div className="h-48 sm:h-64 overflow-y-auto bg-white border-t border-gray-200 pb-20">
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Professionnels à proximité</h3>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : professionals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun professionnel trouvé à proximité</p>
            </div>
          ) : (
            <div className="space-y-3">
              {professionals.slice(0, 10).map(({ profile: prof, professionalProfile, distance }) => (
                <div
                  key={prof.id}
                  onClick={() => setSelectedProfessional({ profile: prof, professionalProfile, distance })}
                  className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex-shrink-0 flex items-center justify-center text-white font-bold">
                      {prof.avatar_url ? (
                        <img
                          src={prof.avatar_url}
                          alt={prof.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        prof.full_name.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800 truncate">{prof.full_name}</h4>
                        {professionalProfile?.verified && (
                          <Star className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" />
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        {professionalProfile?.company_name && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            <span className="truncate">{professionalProfile.company_name}</span>
                          </div>
                        )}
                        {distance !== undefined && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <MapPin className="w-3 h-3" />
                            <span>
                              {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedProfessional && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProfessional(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex-shrink-0 flex items-center justify-center text-white font-bold text-2xl">
                {selectedProfessional.profile.avatar_url ? (
                  <img
                    src={selectedProfessional.profile.avatar_url}
                    alt={selectedProfessional.profile.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  selectedProfessional.profile.full_name.charAt(0).toUpperCase()
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-800">{selectedProfessional.profile.full_name}</h3>
                  {selectedProfessional.professionalProfile?.verified && (
                    <Star className="w-5 h-5 text-blue-500" fill="currentColor" />
                  )}
                </div>

                {selectedProfessional.professionalProfile?.company_name && (
                  <div className="flex items-center gap-1 text-gray-600 mb-2">
                    <Briefcase className="w-4 h-4" />
                    <span className="font-medium">{selectedProfessional.professionalProfile.company_name}</span>
                  </div>
                )}

                {selectedProfessional.distance !== undefined && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {selectedProfessional.distance < 1
                        ? `${Math.round(selectedProfessional.distance * 1000)}m`
                        : `${selectedProfessional.distance.toFixed(1)}km`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {selectedProfessional.profile.bio && (
              <p className="text-gray-600 mb-4">{selectedProfessional.profile.bio}</p>
            )}

            {selectedProfessional.profile.address && (
              <p className="text-sm text-gray-500 mb-4">{selectedProfessional.profile.address}</p>
            )}

            <button
              onClick={() => setSelectedProfessional(null)}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
