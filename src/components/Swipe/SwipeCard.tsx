import { useState } from 'react';
import { MapPin, Briefcase, Star, Heart, X, Zap } from 'lucide-react';
import { Profile, ProfessionalProfile } from '../../lib/supabase';

interface SwipeCardProps {
  profile: Profile;
  professionalProfile?: ProfessionalProfile;
  onSwipe: (action: 'like' | 'pass' | 'super_like') => void;
  distance?: number;
}

export function SwipeCard({ profile, professionalProfile, onSwipe, distance }: SwipeCardProps) {
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(dragOffset.x) > 100) {
      if (dragOffset.x > 0) {
        onSwipe('like');
      } else {
        onSwipe('pass');
      }
    } else if (dragOffset.y < -100) {
      onSwipe('super_like');
    }

    setDragOffset({ x: 0, y: 0 });
  };

  const rotation = dragOffset.x * 0.1;
  const opacity = 1 - Math.abs(dragOffset.x) * 0.002;

  return (
    <div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
        opacity,
        transition: isDragging ? 'none' : 'all 0.3s ease',
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden h-full flex flex-col">
        <div className="relative h-2/3 bg-gradient-to-br from-blue-400 to-cyan-400">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-6xl font-bold">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {dragOffset.x > 50 && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-30 flex items-center justify-center">
              <Heart className="w-32 h-32 text-green-500" fill="currentColor" />
            </div>
          )}

          {dragOffset.x < -50 && (
            <div className="absolute inset-0 bg-red-500 bg-opacity-30 flex items-center justify-center">
              <X className="w-32 h-32 text-red-500" strokeWidth={3} />
            </div>
          )}

          {dragOffset.y < -50 && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-30 flex items-center justify-center">
              <Zap className="w-32 h-32 text-blue-500" fill="currentColor" />
            </div>
          )}

          {professionalProfile?.verified && (
            <div className="absolute top-4 right-4 bg-blue-500 p-2 rounded-full">
              <Star className="w-5 h-5 text-white" fill="currentColor" />
            </div>
          )}
        </div>

        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{profile.full_name}</h2>

            {professionalProfile && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-5 h-5" />
                  <span className="font-semibold">{professionalProfile.company_name || 'Indépendant'}</span>
                </div>
                {professionalProfile.category && (
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {professionalProfile.category}
                  </span>
                )}
              </div>
            )}

            {distance !== undefined && (
              <div className="flex items-center gap-2 text-gray-500 mb-3">
                <MapPin className="w-5 h-5" />
                <span>{distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}</span>
              </div>
            )}

            {profile.bio && (
              <p className="text-gray-600 leading-relaxed line-clamp-3">{profile.bio}</p>
            )}

            {professionalProfile?.tags && professionalProfile.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {professionalProfile.tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => onSwipe('pass')}
              className="w-16 h-16 rounded-full bg-white border-2 border-red-500 flex items-center justify-center hover:bg-red-50 transition shadow-lg"
            >
              <X className="w-8 h-8 text-red-500" strokeWidth={3} />
            </button>

            <button
              onClick={() => onSwipe('super_like')}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center hover:from-blue-600 hover:to-cyan-600 transition shadow-lg"
            >
              <Zap className="w-8 h-8 text-white" fill="currentColor" />
            </button>

            <button
              onClick={() => onSwipe('like')}
              className="w-16 h-16 rounded-full bg-white border-2 border-green-500 flex items-center justify-center hover:bg-green-50 transition shadow-lg"
            >
              <Heart className="w-8 h-8 text-green-500" fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
