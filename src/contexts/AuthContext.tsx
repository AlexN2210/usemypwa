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

  const loadProfile = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Erreur lors du chargement du profil:', error);
        
        // Gestion des erreurs d'authentification
        if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('401')) {
          console.warn('⚠️ Session expirée ou non authentifiée');
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setSession(null);
        }
        return false;
      }

      if (data) {
        setProfile(data);
        return true;
      }
      return false;
    } catch (err) {
      console.error('❌ Erreur inattendue lors du chargement du profil:', err);
      return false;
    }
  };

  // Fonction utilitaire pour attendre qu'un profil existe (avec retry)
  const waitForProfile = async (userId: string, maxAttempts = 5, delayMs = 500): Promise<boolean> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        console.log(`✅ Profil trouvé après ${attempt + 1} tentative(s)`);
        return true;
      }

      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    return false;
  };

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadProfile(session.user.id);
        }
      } catch (err) {
        console.error('❌ Erreur lors de l\'initialisation de la session:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('❌ Erreur dans onAuthStateChange:', err);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    userType: 'professional' | 'individual', 
    profession?: string, 
    siret?: string, 
    companyName?: string
  ) => {
    // Validation des données avant l'inscription
    if (!email || !email.includes('@')) {
      throw new Error('Email invalide');
    }
    if (!password || password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }
    if (!fullName || fullName.trim().length === 0) {
      throw new Error('Le nom complet est requis');
    }

    // Inscription avec métadonnées pour le trigger
    const { data, error } = await supabase.auth.signUp({ 
      email: email.trim(), 
      password: password,
      options: {
        emailRedirectTo: `${window.location.origin}`,
        data: {
          full_name: fullName.trim(),
          user_type: userType
        }
      }
    });
    
    if (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      console.error('Détails de l\'erreur:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      
      // Messages d'erreur plus clairs
      if (error.message.includes('already registered')) {
        throw new Error('Cet email est déjà enregistré');
      }
      if (error.message.includes('Invalid email')) {
        throw new Error('Email invalide');
      }
      if (error.message.includes('Password')) {
        throw new Error('Le mot de passe ne respecte pas les critères de sécurité');
      }
      
      throw new Error(error.message || 'Erreur lors de l\'inscription');
    }
    
    if (!data.user) {
      throw new Error('Inscription échouée : aucun utilisateur créé');
    }

    // Si email confirmation est requis, data.session sera null
    // Dans ce cas, le trigger créera le profil et l'utilisateur devra confirmer son email
    if (!data.session) {
      console.log('📧 Email de confirmation requis - Le profil sera créé après confirmation');
      // Le trigger créera le profil même sans session
      // L'utilisateur devra confirmer son email pour se connecter
      throw new Error('Un email de confirmation a été envoyé. Veuillez vérifier votre boîte mail et confirmer votre compte.');
    }

    // Attendre que la session soit établie
    let attempts = 0;
    let currentSession = null;
    while (attempts < 10 && !currentSession) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        currentSession = session;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
      attempts++;
    }

    if (!currentSession) {
      console.warn('⚠️ Session non établie après inscription');
    }

    // Attendre que le profil soit créé par le trigger ou le créer manuellement
    const profileExists = await waitForProfile(data.user.id);

    if (!profileExists) {
      // Vérifier la session avant création manuelle
      const { data: { session: checkSession } } = await supabase.auth.getSession();
      if (!checkSession) {
        throw new Error('Session non disponible. Veuillez vous reconnecter.');
      }

      console.log('📝 Création manuelle du profil pour:', data.user.id);
      
      const profileData: Partial<Profile> = {
        id: data.user.id,
        full_name: fullName,
        user_type: userType
      };
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (profileError) {
        console.error('❌ Erreur lors de la création du profil:', profileError);
        throw profileError;
      }
      console.log('✅ Profil créé avec succès');
    }

    // Création du profil professionnel si nécessaire
    if (userType === 'professional' && profession && siret && companyName) {
      const { error: professionalError } = await supabase
        .from('professional_profiles')
        .insert({
          user_id: data.user.id,
          profession,
          siret,
          company_name: companyName,
        });

      if (professionalError) {
        console.error('❌ Erreur lors de la création du profil professionnel:', professionalError);
        throw professionalError;
      }
    }

    // Charger le profil final
    await loadProfile(data.user.id);
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