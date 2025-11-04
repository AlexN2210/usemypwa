import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, userType: 'professional' | 'individual', profession?: string, siret?: string, companyName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Erreur lors du chargement du profil:', error);
        // Si erreur 401, c'est que l'utilisateur n'est pas authentifié
        if (error.code === 'PGRST301' || error.message?.includes('401')) {
          console.warn('⚠️ Session expirée ou non authentifiée');
          // Déconnecter l'utilisateur
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setSession(null);
        }
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('❌ Erreur inattendue lors du chargement du profil:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        }
        setLoading(false);
      })();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string, userType: 'professional' | 'individual', profession?: string, siret?: string, companyName?: string) => {
    // Passer les métadonnées dans signUp pour que le trigger puisse créer le profil
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: userType
        }
      }
    });
    if (error) throw error;

    if (data.user) {
      // Le profil sera créé automatiquement par le trigger handle_new_user
      // Si le trigger n'existe pas, on crée le profil manuellement
      
      // Attendre un peu pour que le trigger s'exécute
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Vérifier si le profil existe déjà (créé par le trigger)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      // Si le profil n'existe pas, le créer manuellement
      if (!existingProfile) {
        const profileData: any = {
          id: data.user.id,
          full_name: fullName,
          user_type: userType
        };
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileData);

        if (profileError) throw profileError;
      }

      // Si c'est un professionnel, créer le profil professionnel
      if (userType === 'professional' && profession && siret && companyName) {
        const { error: professionalError } = await supabase
          .from('professional_profiles')
          .insert({
            user_id: data.user.id,
            profession,
            siret,
            company_name: companyName,
          });

        if (professionalError) throw professionalError;
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
