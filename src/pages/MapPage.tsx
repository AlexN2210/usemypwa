import { useState, useEffect } from 'react';
import { supabase, Profile, ProfessionalProfile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Navigation, Briefcase, Star } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet avec Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Icône personnalisée pour l'utilisateur
const UserIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [30, 46],
  iconAnchor: [15, 46],
  popupAnchor: [1, -34],
  shadowSize: [46, 46]
});

// Composant pour centrer la carte sur la position de l'utilisateur
function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);
  return null;
}

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
    loadProfessionals();
  }, [profile]);

  const loadProfessionals = async () => {
    setLoading(true);

    const { data: profilesData, error } = await supabase
      .from('profiles')
      .select('*')
      .in('user_type', ['professional', 'professionnel'])
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

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

    enrichedProfiles.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    setProfessionals(enrichedProfiles);
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
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {userLocation && (
              <>
                <MapCenter center={[userLocation.lat, userLocation.lng]} />
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={UserIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">Votre position</p>
                      {profile?.city && <p className="text-sm text-gray-600">{profile.city}</p>}
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

            {professionals.map(({ profile: prof, professionalProfile, distance }) => {
              if (!prof.latitude || !prof.longitude) return null;
              
              return (
                <Marker
                  key={prof.id}
                  position={[prof.latitude, prof.longitude]}
                  eventHandlers={{
                    click: () => {
                      setSelectedProfessional({ profile: prof, professionalProfile, distance });
                    },
                  }}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800">{prof.full_name}</h4>
                        {professionalProfile?.verified && (
                          <Star className="w-4 h-4 text-blue-500" fill="currentColor" />
                        )}
                      </div>
                      {professionalProfile?.company_name && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                          <Briefcase className="w-3 h-3" />
                          <span className="truncate">{professionalProfile.company_name}</span>
                        </div>
                      )}
                      {distance !== undefined && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => setSelectedProfessional({ profile: prof, professionalProfile, distance })}
                        className="mt-2 w-full py-1.5 px-3 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition"
                      >
                        Voir détails
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
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
