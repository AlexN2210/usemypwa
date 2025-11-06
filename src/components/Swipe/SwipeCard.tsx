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

  // Gestion des événements tactiles (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setDragOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 80; // Seuil réduit pour mobile
    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) {
        onSwipe('like');
      } else {
        onSwipe('pass');
      }
    } else if (dragOffset.y < -threshold) {
      onSwipe('super_like');
    }

    setDragOffset({ x: 0, y: 0 });
  };

  // Gestion des événements souris (desktop)
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

    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) {
        onSwipe('like');
      } else {
        onSwipe('pass');
      }
    } else if (dragOffset.y < -threshold) {
      onSwipe('super_like');
    }

    setDragOffset({ x: 0, y: 0 });
  };

  const rotation = dragOffset.x * 0.1;
  const opacity = 1 - Math.abs(dragOffset.x) * 0.002;

  return (
    <div
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
        opacity,
        transition: isDragging ? 'none' : 'all 0.3s ease',
        touchAction: 'none', // Empêche le scroll pendant le drag
      }}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden h-full flex flex-col">
        {/* Image/Photo - Adapté mobile */}
        <div className="relative h-[55%] sm:h-2/3 bg-gradient-to-br from-blue-400 to-cyan-400">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-4xl sm:text-6xl font-bold">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Indicateurs de swipe - Taille adaptée mobile */}
          {dragOffset.x > 50 && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-30 flex items-center justify-center">
              <Heart className="w-20 h-20 sm:w-32 sm:h-32 text-green-500" fill="currentColor" />
            </div>
          )}

          {dragOffset.x < -50 && (
            <div className="absolute inset-0 bg-red-500 bg-opacity-30 flex items-center justify-center">
              <X className="w-20 h-20 sm:w-32 sm:h-32 text-red-500" strokeWidth={3} />
            </div>
          )}

          {dragOffset.y < -50 && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-30 flex items-center justify-center">
              <Zap className="w-20 h-20 sm:w-32 sm:h-32 text-blue-500" fill="currentColor" />
            </div>
          )}

          {professionalProfile?.verified && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-blue-500 p-1.5 sm:p-2 rounded-full shadow-lg">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" />
            </div>
          )}
        </div>

        {/* Contenu - Adapté mobile */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{profile.full_name}</h2>

            {professionalProfile && (
              <div className="space-y-2 mb-3 sm:mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="font-semibold text-sm sm:text-base truncate">
                    {professionalProfile.company_name || 'Indépendant'}
                  </span>
                </div>
                {professionalProfile.category && (
                  <span className="inline-block px-2.5 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                    {professionalProfile.category}
                  </span>
                )}
              </div>
            )}

            {distance !== undefined && (
              <div className="flex items-center gap-2 text-gray-500 mb-2 sm:mb-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">
                  {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
                </span>
              </div>
            )}

            {profile.bio && (
              <p className="text-gray-600 leading-relaxed line-clamp-2 sm:line-clamp-3 text-sm sm:text-base mb-2 sm:mb-0">
                {profile.bio}
              </p>
            )}

            {professionalProfile?.tags && professionalProfile.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                {professionalProfile.tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Boutons d'action - Adaptés mobile */}
          <div className="flex justify-center gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => onSwipe('pass')}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-red-500 flex items-center justify-center active:bg-red-50 hover:bg-red-50 transition shadow-lg touch-manipulation"
              aria-label="Passer"
            >
              <X className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" strokeWidth={3} />
            </button>

            <button
              onClick={() => onSwipe('super_like')}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center active:from-blue-600 active:to-cyan-600 hover:from-blue-600 hover:to-cyan-600 transition shadow-lg touch-manipulation"
              aria-label="Super like"
            >
              <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="currentColor" />
            </button>

            <button
              onClick={() => onSwipe('like')}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-green-500 flex items-center justify-center active:bg-green-50 hover:bg-green-50 transition shadow-lg touch-manipulation"
              aria-label="Aimer"
            >
              <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-green-500" fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
