import { useState, useEffect } from 'react';
import { supabase, Profile, ProfessionalProfile, MatchAction } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SwipeCard } from '../components/Swipe/SwipeCard';
import { Loader2, Users } from 'lucide-react';

export function HomePage() {
  const { user, profile } = useAuth();
  const [profiles, setProfiles] = useState<Array<{ profile: Profile; professionalProfile?: ProfessionalProfile; distance?: number }>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchedUsers, setMatchedUsers] = useState<string[]>([]);

  useEffect(() => {
    loadProfiles();
    loadMatches();
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('matches')
      .select('target_user_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Erreur lors du chargement des matches:', error);
      return;
    }

    if (data) {
      setMatchedUsers(data.map(m => m.target_user_id));
    }
  };

  const loadProfiles = async () => {
    if (!user) return;
    setLoading(true);

    const { data: profilesData, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id)
      .eq('user_type', 'professional');

    if (error) {
      console.error('Error loading profiles:', error);
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

    const unswipedProfiles = enrichedProfiles.filter(
      p => !matchedUsers.includes(p.profile.id)
    );

    setProfiles(unswipedProfiles);
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

  const handleSwipe = async (action: MatchAction) => {
    if (!user || currentIndex >= profiles.length) return;

    const targetProfile = profiles[currentIndex].profile;

    const { error } = await supabase
      .from('matches')
      .insert({
        user_id: user.id,
        target_user_id: targetProfile.id,
        action,
        matched: false,
      });

    if (error) {
      console.error('Error creating match:', error);
      return;
    }

    if (action === 'like') {
      const { data: reverseMatch } = await supabase
        .from('matches')
        .select('*')
        .eq('user_id', targetProfile.id)
        .eq('target_user_id', user.id)
        .eq('action', 'like')
        .maybeSingle();

      if (reverseMatch) {
        alert(`C'est un match avec ${targetProfile.full_name}!`);
      }
    }

    setCurrentIndex(currentIndex + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <Users className="w-20 h-20 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Plus de profils pour le moment</h2>
        <p className="text-gray-500">Revenez plus tard pour découvrir de nouveaux professionnels</p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            loadProfiles();
          }}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition shadow-lg"
        >
          Recharger
        </button>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="relative h-full p-4">
      <div className="max-w-md mx-auto h-full relative">
        <SwipeCard
          profile={currentProfile.profile}
          professionalProfile={currentProfile.professionalProfile}
          distance={currentProfile.distance}
          onSwipe={handleSwipe}
        />
      </div>
    </div>
  );
}
