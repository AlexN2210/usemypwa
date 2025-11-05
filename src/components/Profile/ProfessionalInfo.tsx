import { useState, useEffect } from 'react';
import { supabase, ProfessionalProfile } from '../../lib/supabase';
import { formatApeCodeDisplay } from '../../lib/apeCodeTranslator';
import { Building2, MapPin, Hash, Briefcase } from 'lucide-react';

interface ProfessionalInfoProps {
  userId: string;
}

export function ProfessionalInfo({ userId }: ProfessionalInfoProps) {
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfessionalProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('professional_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erreur lors du chargement du profil professionnel:', error);
        } else if (data) {
          console.log('📋 ProfessionalInfo - Profil chargé:', {
            ape_code: data.ape_code,
            apeCodeValue: data.ape_code || 'NULL',
            hasApeCode: !!data.ape_code,
            category: data.category,
            company_name: data.company_name,
            allFields: Object.keys(data),
            rawData: data
          });
          setProfessionalProfile(data);
        }
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfessionalProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!professionalProfile) {
    return null;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Informations professionnelles</h3>
      </div>

      <div className="space-y-3">
        {/* Nom de l'entreprise */}
        <div className="flex items-center gap-3">
          <Building2 className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Entreprise</p>
            <p className="font-medium text-gray-800">{professionalProfile.company_name}</p>
          </div>
        </div>

        {/* Profession */}
        {professionalProfile.category && (
          <div className="flex items-center gap-3">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Profession</p>
              <p className="font-medium text-gray-800">{professionalProfile.category}</p>
            </div>
          </div>
        )}

        {/* Code APE */}
        {professionalProfile.ape_code && (
          <div className="flex items-center gap-3">
            <Hash className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Code APE</p>
              <p className="font-medium text-gray-800 font-mono">{professionalProfile.ape_code}</p>
              <p className="text-xs text-gray-600 mt-1">{formatApeCodeDisplay(professionalProfile.ape_code)}</p>
            </div>
          </div>
        )}

        {/* SIRET */}
        {professionalProfile.siret && (
          <div className="flex items-center gap-3">
            <Hash className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">SIRET</p>
              <p className="font-medium text-gray-800 font-mono">
                {professionalProfile.siret.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4')}
              </p>
            </div>
          </div>
        )}

        {/* Statut de vérification */}
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Statut</p>
            <p className="font-medium text-green-600">Vérifié par l'API gouvernementale</p>
          </div>
        </div>
      </div>

      {/* Date d'inscription */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Inscrit le {new Date(professionalProfile.created_at).toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
}
